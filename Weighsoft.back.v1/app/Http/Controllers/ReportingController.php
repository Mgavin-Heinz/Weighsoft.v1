<?php

namespace App\Http\Controllers;

error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Reporting;
use Illuminate\Support\Carbon;
use App\Models\Company;
use App\Models\settings;
use App\Http\Controllers\JwtAuthController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\ReportEmailer;
use App\Services\ReportPricingSqlHelper;
use JWTAuth;
use stdClass;

class ReportingController extends JwtAuthController
{
    // Define private properties
    private $fillable, $model, $Reporting, $modelName, $SQLQuery, $Setting, $ReportEmailer;

    public function __construct()
    {
        parent::__construct();
        $this->model = new Reporting();
        $this->modelName = "Reporting";
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Filter by company_id if provided
        if (isset($_GET) && isset($_GET['company_id'])) {
            $this->model = $this->model->where('company_id', '=', $_GET['company_id']);
        }
        $this->model = $this->model->get();

        return response()->json($this->model);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return response()->json("Success");
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->model = $this->model->create($request->all());

        return response()->json($this->model);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->model = $this->model->where('id', '=', $id)->first();

        if (!$this->model)
            return response()->json($this->modelName . " not found", 404);

        return response()->json($this->model);
    }

    // Helper function to set object name uniquely
    private function setObject(int $currentNum, $usedNames, $currentName)
    {
        if (in_array($currentName, $usedNames)) {
            $currentNum += 1;
            $currentName = substr($currentName, 0, -1) . $currentNum;
            return $this->setObject($currentNum, $usedNames, $currentName);
        } else {
            return $currentName;
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(int $id, Request $request)
    {
        // Create a data object with request inputs
        $data = new stdClass();
        $data->Site = $request->input("site_id");
        $data->Setting = $request->input("weighingtypes_id");
        $data->Workstation = $request->input("workstation_id");
        $data->Weighbridge = $request->input("weighbridge_id");
        $data->Product = $request->input("product_id");
        $data->Businesspartner = $request->input("businesspartner_id");
        $data->Haulier = $request->input("haulier_id");
        $data->stockpile_nr = $request->input("stockpile_nr");
        $data->destination = $request->input("destination");
        $data->order_numbers = $request->input("order_numbers");
        $dateRangeRaw = $request->input('DateRange');
        if ($dateRangeRaw !== null && $dateRangeRaw !== '') {
            $decoded = json_decode($dateRangeRaw, false);
            $data->DateRange = is_object($decoded) ? $decoded : null;
        } else {
            $data->DateRange = null;
        }
        $data->id = $id;
        return response()->json($this->GetData($data));
    }

    // Define static properties for columns, filters, and groupings
    private static $Columns = [
        "Transaction Date" => " created_at `Transaction Date`,", "Transaction No" => " transaction `Transaction No`,",
        "Registration No" => " RegNumber `Registration No`,"
    ];
    private static $Filters = [
        "Transaction Date" => " created_at `Transaction Date`,", "Transaction No" => " transaction `Transaction No`,",
        "Registration No" => " RegNumber `Registration No`,"
    ];
    private static $Groupings = [
        "Transaction Date" => " created_at `Transaction Date`,", "Transaction No" => " transaction `Transaction No`,",
        "Registration No" => " RegNumber `Registration No`,"
    ];

    // Function to get data based on filters and groupings
    public function GetData($data)
    {
        $report = Reporting::where('id', $data->id)->first();
        if (!$report) {
            return [
                'data' => [],
                'Sum' => [],
                'RequestData' => $data,
                'Error' => 'Report not found',
            ];
        }
        $jsondata = $report["jsondata"];
        $this->Reporting = json_decode($jsondata);
        $sanitycheck = ($jsondata == null ? true : ($this->Reporting == null));
        if ($sanitycheck == true) {
            return [
                "data" => [], "Sum" => [], "RequestData" => $data,
                "Error" => "No data found", "jsondata" => $jsondata, "Reporting" => $this->Reporting
            ];
        }

        $built = $this->buildReportSql($data, $report);
        if ($built['abortWith'] !== null) {
            return $built['abortWith'];
        }
        return $this->executeReportSql($built['sql'], $built['needsGroupToggle'], $data);
    }

    /**
     * Build the raw report SQL for the given request data and saved report row.
     *
     * Pure string building apart from:
     *   - a settings::where() lookup when Custom Fields column is used
     *   - DB::connection()->getPdo()->quote() for stockpile/destination/order_numbers filters
     *
     * Requires $this->Reporting to be pre-populated (GetData sets it from $report->jsondata).
     *
     * @param  \stdClass  $data    Runtime filter values.
     * @param  mixed      $report  ArrayAccess-able report row (Reporting model or array).
     * @return array{sql: ?string, needsGroupToggle: bool, abortWith: ?array}
     */
    public function buildReportSql($data, $report): array
    {
        // Build SQL query based on selected columns
        $columns = (array) ($this->Reporting->Columns ?? []);
        if (empty($columns)) {
            Log::warning("ReportingController: report id={$report['id']} has no Columns defined in jsondata.", [
                'jsondata' => $report['jsondata'] ?? null,
            ]);
        }
        $this->SQLQuery = "Select ";
            if (in_array("Transaction Date", $columns)) {
                $this->SQLQuery .= " created_at `Time In`, updated_at `Time Out`,";
            }
            if (in_array("Transaction No", $columns)) {
                $this->SQLQuery .= " transaction `ID`,";
            }
            if (in_array("Registration No", $columns)) {
                $this->SQLQuery .= " RegNumber `Reg. #`,";
            }
            if (in_array("Company", $columns)) {
                $this->SQLQuery .= " IFNULL((select registered_name from companies where id = company_id),'') `Company`,";
            }
            if (in_array("Site", $columns)) {
                $this->SQLQuery .= " IFNULL((select site_name from sites where id = site_id),'') `Site`,";
            }
            $measureTypeQuery = "IFNULL((select measure_type from sites where id = site_id),'')";
            $decimalsQuery = "IFNULL((Select decimals from sites where id = site_id),'0')";

            if (in_array("Workstation", $columns)) {
                $this->SQLQuery .= " IFNULL((select workstation_name from weighingtransactions, workstations
                                    where weighingtransactions.workstation_id = workstations.id and
                                    weighingtransactions.weighing_header_id = weighingheaders.id limit 1),'') `Workstation`,";
            }
            if (in_array("Weighbridge", $columns)) {
                $this->SQLQuery .= " IFNULL((select name from weighbridges where "
                    . "weighbridges.id = weighingheaders.weighbridge_id and "
                    . "weighbridges.site_id = weighingheaders.site_id),'') `Weighbridge`,";
            }
            if (in_array("Weighing Types", $columns)) {
                $this->SQLQuery .= " IFNULL((select `name` from settings where id = settings_id),'') `Weighing Types`,";
            }
            if (in_array("Product Code", $columns)) {
                $this->SQLQuery .= " IFNULL((select `code` from products where id = product_id), '') `Product Code`,";
            }
            if (in_array("Product", $columns)) {
                $this->SQLQuery .= " IFNULL((select `name` from products where id = product_id),'') `Product`,";
            }
            if (in_array("Grades", $columns)) {
                $this->SQLQuery .= " weighingheaders.grades 'Grades',";
            }
            if (in_array("Stockpile Nr", $columns)) {
                $this->SQLQuery .= " IFNULL(weighingheaders.stockpile_nr,'') `Stockpile Nr`,";
            }
            if (in_array("Destination", $columns)) {
                $this->SQLQuery .= " IFNULL(weighingheaders.destination,'') `Destination`,";
            }
            if (in_array("Order Numbers", $columns)) {
                $this->SQLQuery .= " IFNULL(weighingheaders.order_numbers,'') `Order Numbers`,";
            }
            if ($this->Reporting->ReportType->value !== "exception" && in_array("Contract", $columns)) {
                $this->SQLQuery .= " IFNULL((SELECT c.name FROM contract_transactions ctr INNER JOIN contracts c ON c.id = ctr.contract_id "
                    . "WHERE ctr.weighing_header_id = weighingheaders.id AND ctr.deleted_at IS NULL LIMIT 1), '') `Contract`,";
            }
            if (in_array("Business Partner Code", $columns)) {
                $this->SQLQuery .= " IFNULL((select `code` from businesspartners where "
                    . "businesspartners.id = weighingheaders.businesspartner_id and "
                    . "businesspartners.site_id = weighingheaders.site_id),'') `Business Partner Code`,";
            }
            if (in_array("Business Partner", $columns)) {
                $this->SQLQuery .= " IFNULL((select `name` from businesspartners where "
                    . "businesspartners.id = weighingheaders.businesspartner_id and "
                    . "businesspartners.site_id = weighingheaders.site_id),'') `Business Partner`,";
            }
            if (in_array("Haulier Code", $columns)) {
                $this->SQLQuery .= " IFNULL((select `code` from hauliers where id = haulier_id),'') `Haulier Code`,";
            }
            if (in_array("Haulier", $columns)) {
                $this->SQLQuery .= " IFNULL((select `name` from hauliers where id = haulier_id),'') `Haulier`,";
            }
            if (in_array("Month", $columns)) {
                $this->SQLQuery .= " MONTH(created_at) `Month`,";
                $this->SQLQuery .= " YEAR(created_at) `Year`,";
            }
            if (in_array("Count Records", $columns)) {
                $this->SQLQuery .= " count(1) `Count Records`,";
            }
            if (in_array("Gross Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(TotalWeight, $decimalsQuery), ' ', $measureTypeQuery) `Gross Weight`,";
            }
            if (in_array("Nett Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(ABS(FirstWeight - SecondWeight), $decimalsQuery), ' ', $measureTypeQuery) `Nett Weight`,";
            }
            if (in_array("1st Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(FirstWeight, $decimalsQuery), ' ', $measureTypeQuery) `1st Weight`,";
            }
            if (in_array("2nd Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(SecondWeight, $decimalsQuery), ' ', $measureTypeQuery) `2nd Weight`,";
            }
            if (in_array("Moisture Percentage", $columns)) {
                $this->SQLQuery .= " CONCAT(moisture_deduction,'%') `Moisture Deduction`,";
            }
            //25-07-2024 changes from KG to site.measure_type
            if (in_array("Moisture Threshold Percentage", $columns)) {
                $this->SQLQuery .= " CONCAT(moisture_threshold,'%') `Moisture Threshold`,";
            }
            //25-07-2024 changes from KG to site.measure_type
            if (in_array("Moisture Weight", $columns)) {
                $this->SQLQuery .= " CONCAT(IF(moisture_threshold < moisture_deduction, TotalWeight - (TotalWeight * ((100-moisture_deduction)/NULLIF(100-moisture_threshold, 0))), 0), ' ', $measureTypeQuery) `Moisture`,";
            }
            if (in_array("Sum Nett Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(sum(ABS(FirstWeight - SecondWeight)), $decimalsQuery), ' ', $measureTypeQuery) `Sum Nett Weight`,";
            }
            if (in_array("Sum 1st Weight", $columns)) {

                $this->SQLQuery .= " Concat(ROUND(sum(FirstWeight), $decimalsQuery), ' ', $measureTypeQuery) `Sum 1st Weight`,";
                //$this->SQLQuery .= " Concat(sum(FirstWeight),' $measureTypeQuery') `Sum 1st Weight`,";
            }
            if (in_array("Sum 2nd Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(sum(SecondWeight), $decimalsQuery), ' ', $measureTypeQuery) `Sum 2nd Weight`,";
            }
            if ($this->Reporting->ReportType->value !== "exception") {
                if (in_array("Sum Pricing Excl VAT", $columns)) {
                    $exclSum = ReportPricingSqlHelper::pricingExclVatSql();
                    $this->SQLQuery .= " ROUND(SUM({$exclSum}), 2) `Sum Pricing Excl VAT`,";
                }
                if (in_array("Sum Pricing VAT", $columns)) {
                    $vatSum = ReportPricingSqlHelper::pricingVatSql();
                    $this->SQLQuery .= " SUM({$vatSum}) `Sum Pricing VAT`,";
                }
                if (in_array("Sum Pricing Incl VAT", $columns)) {
                    $inclSum = ReportPricingSqlHelper::pricingInclVatSql();
                    $this->SQLQuery .= " SUM({$inclSum}) `Sum Pricing Incl VAT`,";
                }
                if (in_array("Sum Packaging Value Excl VAT", $columns)) {
                    $packSum = ReportPricingSqlHelper::pricingPackagingExclVatSql();
                    $this->SQLQuery .= " ROUND(SUM({$packSum}), 2) `Sum Packaging Value Excl VAT`,";
                }
                if (in_array("Sum Shipping Value Excl VAT", $columns)) {
                    $shipSum = ReportPricingSqlHelper::pricingShippingExclVatSql();
                    $this->SQLQuery .= " ROUND(SUM({$shipSum}), 2) `Sum Shipping Value Excl VAT`,";
                }
            }
            if (in_array("Avg Nett Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(avg(ABS(FirstWeight - SecondWeight)), $decimalsQuery), ' ', $measureTypeQuery) `Avg Nett Weight`,";
            }
            if (in_array("Avg 1st Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(avg(FirstWeight), $decimalsQuery), ' ', $measureTypeQuery) `Avg 1st Weight`,";
            }
            if (in_array("Avg 2nd Weight", $columns)) {
                $this->SQLQuery .= " Concat(ROUND(avg(SecondWeight), $decimalsQuery), ' ', $measureTypeQuery) `Avg 2nd Weight`,";
            }
            if (in_array("Exception Code", $columns)) {
                $this->SQLQuery .= " code `Exception Code`,";
            }
            if (in_array("Exception Description", $columns)) {
                $this->SQLQuery .= " description `Exception Description`,";
            }
            if (in_array("Exception Data", $columns)) {
                $this->SQLQuery .= " jsondata `Exception Data`,";
            }
            if (in_array("Comment", $columns)) {
                $this->SQLQuery .= " comment `Comment`,";
            }
            if ($this->Reporting->ReportType->value !== "exception") {
                if (in_array("1st Weight User", $columns)) {
                    $this->SQLQuery .= " (SELECT email FROM users u WHERE u.id = weighingheaders.firstWeightUserId) `1st Weight User`,";
                }

                if (in_array("2nd Weight User", $columns)) {
                    $this->SQLQuery .= " (SELECT email FROM users u WHERE u.id = weighingheaders.secondWeightUserId) `2nd Weight User`,";
                }

                if (in_array("Verifying User", $columns)) {
                    $this->SQLQuery .= " (SELECT email FROM users u WHERE u.id = weighingheaders.verifyUserId) `Verifying User`,";
                }

                if (in_array("Is Deleted?", $columns)) {
                    $this->SQLQuery .= " IF(weighingheaders.deleted_at IS NULL, '', 'DELETED') `Deleted?`,";
                }

                if (in_array("Delete Reason", $columns)) {
                    $this->SQLQuery .= " weighingheaders.reason `Delete Reason`,";
                }

                if (in_array("User that Deleted", $columns)) {
                    $this->SQLQuery .= " (SELECT email FROM users u WHERE u.id = weighingheaders.deletedUserId) `User that Deleted`,";
                }

                if (in_array("Unit Price (per Ton)", $columns)) {
                    $this->SQLQuery .= ' ROUND(' . ReportPricingSqlHelper::unitPriceSql() . ", 2) `Unit Price (per Ton)`,";
                }
                if (in_array("Pricing Excl VAT", $columns)) {
                    $excl = ReportPricingSqlHelper::pricingExclVatSql();
                    $this->SQLQuery .= " ROUND(({$excl}), 2) `Pricing Excl VAT`,";
                }
                if (in_array("Pricing VAT", $columns)) {
                    $vat = ReportPricingSqlHelper::pricingVatSql();
                    $this->SQLQuery .= " {$vat} `Pricing VAT`,";
                }
                if (in_array("Pricing Incl VAT", $columns)) {
                    $incl = ReportPricingSqlHelper::pricingInclVatSql();
                    $this->SQLQuery .= " ROUND(({$incl}), 2) `Pricing Incl VAT`,";
                }
                if (in_array("Packaging Price (per Ton)", $columns)) {
                    $this->SQLQuery .= ' ROUND(IFNULL(weighingheaders.contract_packaging_price_per_ton, 0), 2) `Packaging Price (per Ton)`,';
                }
                if (in_array("Shipping Price (per Ton)", $columns)) {
                    $this->SQLQuery .= ' ROUND(IFNULL(weighingheaders.contract_shipping_price_per_ton, 0), 2) `Shipping Price (per Ton)`,';
                }
                if (in_array("Packaging Value Excl VAT", $columns)) {
                    $packExcl = ReportPricingSqlHelper::pricingPackagingExclVatSql();
                    $this->SQLQuery .= " ROUND(({$packExcl}), 2) `Packaging Value Excl VAT`,";
                }
                if (in_array("Shipping Value Excl VAT", $columns)) {
                    $shipExcl = ReportPricingSqlHelper::pricingShippingExclVatSql();
                    $this->SQLQuery .= " ROUND(({$shipExcl}), 2) `Shipping Value Excl VAT`,";
                }
            }
            //$this->SQLQuery = substr($this->SQLQuery, 0, -1);

            if (in_array("Weighing Types", $this->Reporting->Filters) && ($data->Setting ?? '') !== '' && in_array("Custom Fields", $columns)) {
                $setting = settings::where('id', $data->Setting)->first();
                if ($setting) {
                    for ($i = 1; $i <= 20; $i++) {
                        if ($setting["user_defined_name$i"] != "" && $setting["user_defined_rep$i"] == "Yes") {
                            $this->SQLQuery .= "Custom$i `" . $setting["user_defined_name$i"] . "`,";
                        }
                    }
                }
                if (substr($this->SQLQuery, -1) == ",")
                    $this->SQLQuery = substr($this->SQLQuery, 0, -1);
            }
            if (substr($this->SQLQuery, -1) == ",")
                $this->SQLQuery = substr($this->SQLQuery, 0, -1);
            if ($this->Reporting->ReportType->value !== "exception") {
                // Any non-exception report type (transaction, enterprise, or any custom
                // label) queries weighingheaders. Only the literal "exception" type
                // queries the exceptions table. Braces are explicit here to kill the
                // prior dangling-else ambiguity.
                if ($report["show_deleted"] == "Yes") {
                    // Include entries where status is 'CLOSED' or 'deleted_at' is not null.
                    $this->SQLQuery .= " from weighingheaders where (status = 'CLOSED' or deleted_at IS NOT NULL) and ";
                } else {
                    // Only include entries with status 'CLOSED'.
                    $this->SQLQuery .= " from weighingheaders where status = 'CLOSED' and ";
                }
            } else {
                $this->SQLQuery .= " from exceptions where ";
            }
            if (in_array("Site", $this->Reporting->Filters) && ($data->Site ?? '') !== '') {
                $this->SQLQuery .= " site_id = '$data->Site' and ";
            }
            if (in_array("Weighbridge", $this->Reporting->Filters) && ($data->Weighbridge ?? '') !== '') {
                $this->SQLQuery .= " weighbridge_id = '$data->Weighbridge' and ";
            }
            if (in_array("Weighing Types", $this->Reporting->Filters) && ($data->Setting ?? '') !== '') {
                $this->SQLQuery .= " settings_id = '$data->Setting' and ";
                $this->Setting = settings::where('id', $data->Setting)->first();
            }
            if (in_array("Workstation", $this->Reporting->Filters) && ($data->Workstation ?? '') !== '') {
                $this->SQLQuery .= " (select workstations.id from weighingtransactions, workstations
                                    where weighingtransactions.weighing_header_id = weighingheaders.id limit 1) = '$data->Workstation' and ";
            }
            if (in_array("Exception Type", $this->Reporting->Filters) && ($data->Exception ?? '') !== '') {
                $this->SQLQuery .= " code = '$data->Exception' and ";
            }
            if (in_array("Product", $this->Reporting->Filters) && ($data->Product ?? '') !== '') {
                $this->SQLQuery .= " product_id = '$data->Product' and ";
            }
            if (in_array("Business Partner", $this->Reporting->Filters) && ($data->Businesspartner ?? '') !== '') {
                $this->SQLQuery .= " businesspartner_id = '$data->Businesspartner' and ";
            }
            if (in_array("Haulier", $this->Reporting->Filters) && ($data->Haulier ?? '') !== '') {
                $this->SQLQuery .= " haulier_id = '$data->Haulier' and ";
            }
            if ($this->Reporting->ReportType->value !== "exception") {
                $stockpileNr = isset($data->stockpile_nr) ? trim((string) $data->stockpile_nr) : '';
                if (in_array("Stockpile Nr", $this->Reporting->Filters) && $stockpileNr !== '') {
                    $this->SQLQuery .= " weighingheaders.stockpile_nr = " . DB::connection()->getPdo()->quote($stockpileNr) . " and ";
                }
                $destination = isset($data->destination) ? trim((string) $data->destination) : '';
                if (in_array("Destination", $this->Reporting->Filters) && $destination !== '') {
                    $this->SQLQuery .= " weighingheaders.destination = " . DB::connection()->getPdo()->quote($destination) . " and ";
                }
                $orderNumbers = isset($data->order_numbers) ? trim((string) $data->order_numbers) : '';
                if (in_array("Order Numbers", $this->Reporting->Filters) && $orderNumbers !== '') {
                    $this->SQLQuery .= " weighingheaders.order_numbers = " . DB::connection()->getPdo()->quote($orderNumbers) . " and ";
                }
            }
            if (in_array("Date Range", $this->Reporting->Filters)) {
                if (!is_object($data->DateRange) || !isset($data->DateRange->startDate, $data->DateRange->endDate)) {
                    return [
                        'sql' => null,
                        'needsGroupToggle' => false,
                        'abortWith' => [
                            'data' => [],
                            'Sum' => [],
                            'RequestData' => $data,
                            'Error' => 'A valid DateRange (startDate and endDate) is required for this report.',
                        ],
                    ];
                }
                $this->SQLQuery .= " CAST(updated_at AS DATETIME) between '" . Carbon::parse($data->DateRange->startDate)->toDateTimeLocalString() .
                    "' and '" . Carbon::parse($data->DateRange->endDate)->toDateTimeLocalString() . "' ";
            }
            // Remove dangling WHERE conjunction before GROUP BY; post-GROUP BY cleanup no longer sees it.
            $this->SQLQuery = preg_replace('/\s+and\s*$/i', '', rtrim($this->SQLQuery));
            $this->SQLQuery .= count($this->Reporting->Groupings) > 0 ? " group by " : "";
            if (in_array("Site", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select site_name from sites where id = site_id),''),";
            }
            if (in_array("Workstation", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select workstation_type from weighingtransactions, workstations
                                    where weighingtransactions.workstation_id = workstations.id and
                                    weighingtransactions.weighing_header_id = weighingheaders.id limit 1),''),";
            }
            if (in_array("Weighbridge", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select name from weighbridges where "
                    . "weighbridges.id = weighingheaders.weighbridge_id and "
                    . "weighbridges.site_id = weighingheaders.site_id),''),";
            }
            if (in_array("Weighing Types", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select `name` from settings where id = settings_id),''),";
            }
            if (in_array("Product", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select `name` from products where id = product_id),''),";
            }
            if (in_array("Business Partner", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select `name` from businesspartners where "
                    . "businesspartners.id = weighingheaders.businesspartner_id and "
                    . "businesspartners.site_id = weighingheaders.site_id),''),";
            }
            if (in_array("Haulier", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " IFNULL((select `name` from hauliers where id = haulier_id),''),";
            }
            if ($this->Reporting->ReportType->value !== "exception") {
                if (in_array("Stockpile Nr", $this->Reporting->Groupings)) {
                    $this->SQLQuery .= " IFNULL(weighingheaders.stockpile_nr,''),";
                }
                if (in_array("Destination", $this->Reporting->Groupings)) {
                    $this->SQLQuery .= " IFNULL(weighingheaders.destination,''),";
                }
                if (in_array("Order Numbers", $this->Reporting->Groupings)) {
                    $this->SQLQuery .= " IFNULL(weighingheaders.order_numbers,''),";
                }
            }
            if (in_array("Month", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " MONTH(created_at),";
                $this->SQLQuery .= " YEAR(created_at),";
            }
            if (in_array("Exception Type", $this->Reporting->Groupings)) {
                $this->SQLQuery .= " code,";
                $this->SQLQuery .= " description,";
            }
            if (substr($this->SQLQuery, -1) == " ")
                $this->SQLQuery = substr($this->SQLQuery, 0, -1);
            if (substr($this->SQLQuery, -1) == ",")
                $this->SQLQuery = substr($this->SQLQuery, 0, -1);
            if (substr($this->SQLQuery, -3) == "and")
                $this->SQLQuery = substr($this->SQLQuery, 0, -3);

        $groupings = isset($this->Reporting->Groupings) ? (array) $this->Reporting->Groupings : [];
        return [
            'sql' => $this->SQLQuery,
            'needsGroupToggle' => count($groupings) > 0,
            'abortWith' => null,
        ];
    }

    /**
     * Execute a prebuilt report SQL and return the result payload.
     *
     * Temporarily clears ONLY_FULL_GROUP_BY from the session sql_mode when the
     * report uses groupings, then restores the previous mode in a finally block.
     *
     * @param  string    $sql               The SQL built by buildReportSql().
     * @param  bool      $needsGroupToggle  True when the report has groupings.
     * @param  \stdClass $data              Original request data (used for error logging).
     * @return array
     */
    public function executeReportSql(string $sql, bool $needsGroupToggle, $data): array
    {
        Log::info($sql);
        $pdo = DB::connection()->getPdo();
        $previousSqlMode = null;
        if ($needsGroupToggle) {
            $previousSqlMode = $pdo->query('SELECT @@SESSION.sql_mode')->fetchColumn();
            $pdo->exec("SET SESSION sql_mode=(SELECT REPLACE(@@SESSION.sql_mode,'ONLY_FULL_GROUP_BY',''))");
        }
        try {
            $results = DB::select(DB::raw($sql), array());

            return ["data" => $results, "Sum" => []];
        } catch (\Throwable $th) {
            Log::error('Reporting query failed', [
                'exception' => $th,
                'report_id' => $data->id ?? null,
            ]);

            return ["data" => [], "Sum" => [], "error" => $th->getMessage()];
        } finally {
            if ($previousSqlMode !== null) {
                try {
                    $pdo->exec('SET SESSION sql_mode = ' . $pdo->quote($previousSqlMode));
                } catch (\Throwable $restoreEx) {
                    Log::warning('Failed to restore sql_mode after reporting query', [
                        'exception' => $restoreEx,
                    ]);
                }
            }
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->model = $this->model->where('id', '=', $id)->first();
        if (!$this->model)
            return $this->json($this->modelName . " not found", 404);
        $this->model = $this->model->update($request->all());

        return response()->json($this->model);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $this->model = $this->model->where('id', '=', $id)->first();
        if (!$this->model)
            return $this->json($this->modelName . " not found", 404);
        $this->model = $this->model->delete();
        return response()->json($this->model);
    }

    /**
     * Sends a report email for the given report ID.
     *
     * @param int $id The ID of the report to send the email for.
     * @return void
     */
    public function email(Request $request)
    {
        $input = $request->all();
        $this->ReportEmailer = new ReportEmailer();
        $this->ReportEmailer->SendReportEmails($input["id"]);
    }

    // Function to execute a select query with bindings
    public function select($query, $bindings = array())
    {
        return $this->run($query, $bindings, function ($me, $query, $bindings) {
            if ($me->pretending())
                return array();

            $statement = $me->getPdo()->prepare($query);
            $statement->execute($me->prepareBindings($bindings));

            return $statement->fetchAll($me->getFetchMode());
        });
    }
}
