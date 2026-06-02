<?php

namespace App\Services;

use App\Http\Controllers\ReportingController;
use App\Mail\Report;
use App\Models\Reporting;
use App\Models\settings;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\App;

class ReportEmailer
{

    public $debug;
    public function __construct()
    {
        $this->debug = App::hasDebugModeEnabled();
    }

    public function SendReportEmails(int $reportId)
    {
        if (!$reportId) {
            return;
        }

        $report = Reporting::find($reportId);

        if (!$report) {
            return;
        }

        if($report->time_frame == 0)
        {
            $start = $report->last_report_on ? Carbon::parse($report->last_report_on) : Carbon::now()->subDay();
        }
        else
        {
            $start = Carbon::now()->subDays($report->time_frame);
        }

        $end = Carbon::now();

        $emails = explode(';', $report->email);
        $emails = array_map(fn ($email) => trim($email), $emails);
        $reportData = $this->TransactionReport($start->toDateTimeLocalString(), $end->toDateTimeLocalString(), $report);

        $this->SendEmail($emails, "WeighSoft Transaction Report for " . $start, $reportData, $start, $end, $report);
    }

    public function TransactionReport($start, $end, $report): array
    {
        $weighingTypes = (new settings())
            ->where("company_id", "=", $report->company_id)
            ->get();

        $reports = array();
        if ($this->debug) {
            Log::info("weighingTypes: " . print_r($weighingTypes, true));
        }
        if ($this->debug) {
            Log::info("report: " . print_r($report, true));
        }
        foreach ($weighingTypes as $weighingType) {
            $data = new \stdClass();
            $data->name = $weighingType->name; //Used to name the file when creating email attachment
            $data->DateRange = new \stdClass();
            $data->DateRange->startDate = $start;
            $data->DateRange->endDate = $end;
            $data->id = $report->id;
            $data->Setting = $weighingType->id;
            $data->Site = '';
            $data->Weighbridge = '';
            $data->Workstation = '';
            $data->Product = '';
            $data->Businesspartner = '';
            $data->Haulier = '';
            $data->stockpile_nr = '';
            $data->destination = '';
            $data->order_numbers = '';

            if ($this->debug) {
                Log::info("Data: " . print_r($data, true));
            }
            $rep = new ReportingController();
            $reportData = $rep->GetData($data);
            if ($this->debug) {
                Log::info("Report: " . print_r($reportData, true));
            }
            $reportData["info"] = $data;
            array_push($reports, $reportData);
        }
        return $reports;
    }

    public function SendEmail($email, $subject, $data, $start, $end, $report)
    {
        Log::info("Sending mail");
        Mail::to($email)->send(new Report($data, $start, $end, $report));
        Log::info("Send mail");
    }
}
