<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessXeroInvoice;
use App\Models\BusinessPartner;
use App\Models\Contracts;
use App\Models\ContractTransactions;
use App\Models\Product;
use App\Models\settings;
use App\Models\Transactions;
use App\Models\User;
use App\Models\UserType;
use App\Models\weighingCameras;
use App\Models\weighingHeaders;
use App\Models\weighingTransactions;
use App\Models\XeroSettings;
use App\Services\ContractTransactionService;
use App\Services\WeighingCameraService;
use App\Services\WeighingHeaderService;
use App\Services\WeighingTransactionService;
use App\Services\XeroInvoiceService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WeighingHeadersController extends JwtAuthController
{
    private weighingHeaders $model;
    private WeighingHeaderService $headerService;
    private WeighingTransactionService $transactionService;
    private ContractTransactionService $contractTransactionService;
    private WeighingCameraService $weighingCameraService;

    public function __construct(
        WeighingHeaderService $headerService,
        WeighingTransactionService $transactionService,
        ContractTransactionService $contractTransactionService,
        WeighingCameraService $weighingCameraService
    ) {
        parent::__construct();
        $this->model = new weighingHeaders();
        $this->headerService = $headerService;
        $this->transactionService = $transactionService;
        $this->contractTransactionService = $contractTransactionService;
        $this->weighingCameraService = $weighingCameraService;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $companyId = null;
        $siteId = null;
        $workstationId = null;
        $status = null;
        $pageSize = 500;
        $pageStart = 0;
        $pagesDefined = false;
        $orderByCol = "updated_at";
        $orderByDir = "desc";
        $searchTerm = "";

        if (isset($_GET)) {
            $companyId = $_GET['company_id'] ?? $companyId;
            $siteId = $_GET['site_id'] ?? $siteId;
            $workstationId = $_GET['workstation_id'] ?? $workstationId;
            $status = $_GET['status'] ?? $status;
            $pageSize = $_GET['pageSize'] ?? $pageSize;
            $pageStart = $_GET['pageStart'] ?? $pageStart;
            $orderByCol = $_GET["orderByCol"] ?? $orderByCol;
            $orderByDir = $_GET["orderByDir"] ?? $orderByDir;
            $searchTerm = $_GET["searchTerm"] ?? $searchTerm;
        }
        $weighingHeaders = $this->headerService
            ->getWeighingHeaders($companyId, $siteId, $workstationId, $status, $pageStart, $pageSize, $orderByCol, $orderByDir, $searchTerm);
        $res = $pagesDefined ? ["count" => $weighingHeaders[1], "data" => $weighingHeaders[0]] : $weighingHeaders[0];
        return response()->json($res);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->user;
        Log::info(print_r($request->all(), true));
        $Transactions = new Transactions();
        $settings = new settings();
        $data = $request->all();
        if ($data["actiontype"] == "Edit")
            return response()->json(["Error" => "Edit not implemented"], 500);
        $data["firstWeightUserId"] = $user->id;

        $Transactions = $Transactions->where('company_id', '=', $data['company_id']);
        $Transactions = $Transactions->where('site_id', '=', $data['site_id']);
        $Transactions = $Transactions->where('settings_id', '=', $data['settings_id']);
        $Transactions = $Transactions->get();

        $settings = $settings->find($data['settings_id']);

        if ($settings["silo_verification"] == "Yes" && $data["SiloOverride"] != "Yes") {
            $data["status"] = "VERIFY";
        } else if ($settings["type_of_weighing"] != "1" && $settings["tares_enabled"] != "true") {
            $data["status"] = "OPEN";
        } else {
            $data["status"] = "CLOSED";
        }

        if ($settings["tares_enabled"] == "true") {
            $data["secondWeightUserId"] = $user->id;
        }

        if (count($Transactions) == 0) {
            $Transaction = [];
            $Transaction["company_id"] = $data['company_id'];
            $Transaction["site_id"] = $data['site_id'];
            $Transaction["settings_id"] = $data['settings_id'];
            $Transaction["current_id"] = 1;
            $Transactions = [(new Transactions)->create($Transaction)];
        }
        if (isset($data['businesspartner_id']) && ($data['businesspartner_id'] == "" || $data['businesspartner_id'] == null)) {
            unset($data['businesspartner_id']);
        }
        if (isset($data['haulier_id']) && ($data['haulier_id'] == "" || $data['haulier_id'] == null)) {
            unset($data['haulier_id']);
        }
        if (isset($data['grade_id']) && ($data['grade_id'] == "" || $data['grade_id'] == null)) {
            unset($data['grade_id']);
        }
        if (isset($data['product_id']) && ($data['product_id'] == "" || $data['product_id'] == null)) {
            unset($data['product_id']);
        }

        // FIX: Increment counter BEFORE creating header to prevent duplicate transaction IDs
        // This ensures the counter is reserved before use, preventing duplicates if header creation fails
        $currentIdBefore = $Transactions[0]["current_id"];
        $Transactions[0]["current_id"] = $Transactions[0]["current_id"] + 1;
        
        Log::info('Transaction counter increment attempt', [
            'company_id' => $data['company_id'],
            'site_id' => $data['site_id'],
            'settings_id' => $data['settings_id'],
            'current_id_before' => $currentIdBefore,
            'current_id_after' => $Transactions[0]["current_id"],
            'transaction_record_id' => $Transactions[0]->id
        ]);
        
        if (!$Transactions[0]->save()) {
            Log::error('CRITICAL: Failed to increment transaction counter', [
                'company_id' => $data['company_id'],
                'site_id' => $data['site_id'],
                'settings_id' => $data['settings_id'],
                'current_id' => $Transactions[0]["current_id"],
                'transaction_record_id' => $Transactions[0]->id
            ]);
            return response()->json(['error' => 'Failed to reserve transaction number. Please try again.'], 500);
        }

        // Generate transaction number with the newly incremented counter value
        $data["transaction"] = $settings["prefix"] . $Transactions[0]["current_id"];
        
        Log::info('Transaction number generated', [
            'transaction' => $data["transaction"],
            'current_id_used' => $Transactions[0]["current_id"],
            'prefix' => $settings["prefix"]
        ]);
        $data['reason'] = "";
        if ($settings["enable_moisture"] == "true") {
            $data["moisture_threshold"] = $settings["moisture_deduction_level"];
        }
        
        try {
            $weighingHeader = $this->headerService->insertWeighingHeader($data);
            
            Log::info('Weighing header created successfully', [
                'weighing_header_id' => $weighingHeader->id,
                'transaction' => $data["transaction"],
                'company_id' => $data['company_id'],
                'site_id' => $data['site_id']
            ]);
        } catch (\Exception $e) {
            Log::error('CRITICAL: Weighing header creation failed after counter increment', [
                'transaction' => $data["transaction"],
                'current_id' => $Transactions[0]["current_id"],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Note: Counter is already incremented, so this transaction number is "used" but no header exists
            // This creates a gap, but prevents duplicates
            throw $e;
        }

        $id = $weighingHeader->id;
        $data["weighing_header_id"] = $id;
        $FirstWeight = null;
        $SecondWeight = null;

        $weighingTransaction = new weighingTransactions();

        if ($settings["type_of_weighing"] == "1" || $settings->tares_enabled == "true") {
            $firstTransaction = new weighingTransactions();
            $firstTransaction->Weight1 = $data["SecondWeight"];
            $firstTransaction->Weight2 = 0;
            $firstTransaction->Weight3 = 0;
            $firstTransaction->Weight4 = 0;
            $firstTransaction->Weight5 = 0;
            $firstTransaction->Weight6 = 0;
            $firstTransaction->WeightTotal = $data["SecondWeight"];
            $firstTransaction->Status = "2";
            $firstTransaction->weighing_header_id = $weighingHeader->id;
            $firstTransaction->site_id = $data["site_id"];
            $firstTransaction->workstation_id = $data["workstation_id"];
            $firstTransaction->company_id = $data["company_id"];
            $firstTransaction->AxelSetups = 0;
        
            $SecondWeight = $this->transactionService->createWeighingTransaction($firstTransaction);
        
            $secondTransaction = $firstTransaction;
            $secondTransaction->Weight1 = $data["FirstWeight"];
            $secondTransaction->WeightTotal = $data["FirstWeight"];
            $secondTransaction->Status = "1"; 
        
            // Create contract entry with data here
            try {
                if (Arr::has($data, 'contract_id') && $data['contract_id'] != null) {
                    $contractTransaction = $this->contractTransactionService->insertItem($data);
                    $data['contract_transaction_id'] = $contractTransaction->id;
                }
            } catch (Exception $e) {
                Log::error($e->getMessage());
            }
            // try {
            //     if (Arr::has($data, 'contract_id') && $data['contract_id'] != null) {
            //         $contract = Contracts::where('id', $data['contract_id'])->first();
            //         $newcontract = Contracts::where('id', $contract->linked_contact_id)->first();
            //         $contractTransaction = ContractTransactions::create([
            //             'contract_id' => $contract->id,
            //             'amount' => abs($firstTransaction->Weight1),
            //             'weighing_header_id' => $weighingHeader->id,
            //             'site_id' => $data['site_id'],
            //             'company_id' => $data['company_id'],
            //         ]);
            //         $data['contract_transaction_id'] = $contractTransaction->id;
                    
            //         // Validation for over transaction
            //         $totalSavedTransaction = ContractTransactions::where('contract_id', $contract->id)->sum('amount');
            //         $eligibleContractAmount = (float) $contract->amount - $totalSavedTransaction;
            //         if ($eligibleContractAmount < $secondTransaction->WeightTotal && $newcontract != null) {
            //             $linkedcontracts = Contracts::where('id', $data['contract_id'])->first();
            //             $contractTransaction->amount = abs($eligibleContractAmount);
            //             $contractTransaction->save();
            //             $contractTransaction = ContractTransactions::create([
            //                 'contract_id' => $linkedcontracts->linked_contact_id,
            //                 'amount' => abs($secondTransaction->WeightTotal - $eligibleContractAmount),
            //                 'weighing_header_id' => $weighingHeader->id,
            //                 'site_id' => $data['site_id'],
            //                 'company_id' => $data['company_id'],
            //             ]);
            //             $data['contract_transaction_id'] = $contractTransaction->id;
            //         } else {
            //             $contractTransaction->amount = abs($secondTransaction->WeightTotal);
            //             $contractTransaction->save();
            //         }
            //     }
            // } catch (Exception $e) {
            //     Log::error($e->getMessage());
            // }
        
            $weighingTransaction = $this->transactionService->createWeighingTransaction($secondTransaction);
        } else if ($settings["type_of_weighing"] != "1") {
            $firstTransaction = new weighingTransactions();
            $firstTransaction->Weight1 = $data["FirstWeight"];
            $firstTransaction->Weight2 = 0;
            $firstTransaction->Weight3 = 0;
            $firstTransaction->Weight4 = 0;
            $firstTransaction->Weight5 = 0;
            $firstTransaction->Weight6 = 0;
            $firstTransaction->WeightTotal = $data["FirstWeight"];
            $firstTransaction->Status = "1";
            $firstTransaction->weighing_header_id = $weighingHeader->id;
            $firstTransaction->site_id = $data["site_id"];
            $firstTransaction->workstation_id = $data["workstation_id"];
            $firstTransaction->company_id = $data["company_id"];
            $firstTransaction->AxelSetups = 0;

            $weighingTransaction = $this->transactionService->createWeighingTransaction($firstTransaction);

            try {
                if (Arr::has($data, 'contract_id') && $data['contract_id'] != null) {
                    $contractTransaction = $this->contractTransactionService->insertItem($data);
                    $data['contract_transaction_id'] = $contractTransaction->id;
                }
            } catch (Exception $e) {
                Log::error($e->getMessage());
            }
        }

        $weighingTransaction->Cameras = [];
        Log::info(print_r($data, true));
        $weighingHeader->FirstUser = self::resolveUserDisplayName($weighingHeader->firstWeightUserId ?? null);
        $weighingHeader->user_name = self::resolveUserDisplayName($weighingHeader->secondWeightUserId ?? null);
        if (Arr::has($data, 'Cameras') && $settings['use_cameras'] == 'Yes') {
            foreach ($data['Cameras'] as $camera) {
                $camera["weighing_transaction_id"] = $weighingTransaction->id;
                $camera["base64"] = CameraController::getImageFromIp($camera["ip_address"]);
                $image = $this->weighingCameraService->insertWeighingCamera($camera);
                array_push($weighingTransaction->Cameras, $image);
            }
        }

        // Queue Xero invoice if ticket is CLOSED on first weigh (single weighing mode)
        if ($data["status"] == "CLOSED") {
            $this->queueXeroInvoice($id, $data, $settings);
        }

        $weighingHeader->FirstWeight = $weighingTransaction;
        $weighingHeader->SecondWeight = $SecondWeight;
        $weighingHeader->Setting = $settings;
        return response()->json($weighingHeader);
    }
    private static function isSharedWorkstationEnabled($siteId): bool
    {
        if (empty($siteId)) {
            return false;
        }

        $sharedWorkstation = DB::table('sites')
            ->where('id', $siteId)
            ->value('shared_workstation');

        return strcasecmp((string)$sharedWorkstation, 'Yes') === 0;
    }

    /**
     * When site_id is omitted (e.g. POST body only had reason), resolve it from the header so
     * loadSingle() can still enforce site/workstation access.
     */
    private static function resolveSiteIdForHeader(string $id, $siteId): string
    {
        if (!empty($siteId)) {
            return (string) $siteId;
        }
        $header = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
            ->first(['site_id']);
        if (!$header) {
            throw new Exception("WeighingHeader not found", 1);
        }

        return (string) $header->site_id;
    }

    public static function loadSingle(string $id, $siteId, $workstationId = null)
    {
        if (empty($siteId)) {
            throw new Exception("Error Processing Request, SiteId Empty", 1);
        }
        $weighingHeader = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
            ->where('site_id', '=', $siteId)
            ->first();

        if (!$weighingHeader) {
            throw new Exception("WeighingHeader not found", 1);
        }

        if (!self::isSharedWorkstationEnabled($siteId)) {
            if (empty($workstationId) || (string)$weighingHeader->workstation_id !== (string)$workstationId) {
                throw new Exception("Access denied for workstation", 1);
            }
        }

        $weighingHeader->id = $id;

        $weighingLines = (new weighingTransactions)
            ->whereRaw("weighing_header_id = UUID_TO_BIN(?, TRUE)", [$id])
            ->where("site_id", "=", $weighingHeader["site_id"])
            ->get(["weighingtransactions.*", DB::raw("BIN_TO_UUID(id, TRUE) AS id2, BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id2")]);

        foreach ($weighingLines as $line) {
            $line['id'] = $line['id2'];
            unset($line['id2']);
            $line['weighing_header_id'] = $line['weighing_header_id2'];
            unset($line['weighing_header_id2']);
        }
        $weighingHeader["weighingLines"] = ($weighingLines == null ? null : $weighingLines);

        $firstUserNameFromLine = null;
        $secondUserNameFromLine = null;
        foreach ($weighingLines as $line) {
            $status = $line['Status'] ?? null;
            if ($status === '1' && !empty($line['user_name'])) {
                $firstUserNameFromLine = $line['user_name'];
            }
            if ($status === '2' && !empty($line['user_name'])) {
                $secondUserNameFromLine = $line['user_name'];
            }
        }
        $weighingHeader['FirstUser'] = self::resolveUserDisplayName($weighingHeader->firstWeightUserId)
            ?: $firstUserNameFromLine;
        $weighingHeader['user_name'] = self::resolveUserDisplayName($weighingHeader->secondWeightUserId)
            ?: $secondUserNameFromLine;

        $contract_transaction = (new ContractTransactions)
            ->whereRaw("weighing_header_id = UUID_TO_BIN(?, TRUE)", [$id])
            ->first(["contract_transactions.*", DB::raw("BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id2")]);

        if (!empty($contract_transaction)) {
            $contract_transaction['weighing_header_id'] = $contract_transaction['weighing_header_id2'];
            unset($contract_transaction['weighing_header_id2']);

            $contract_transaction['contract'] = Contracts::find($contract_transaction['contract_id']);

            $weighingHeader['contractTransaction'] = $contract_transaction;
        }

        if (isset($weighingHeader->contractTransaction) && !empty($weighingHeader->contractTransaction)) {
            $weighingHeader["contract_id"] = $weighingHeader->contractTransaction->contract_id;
            $contract_total_amount = (float) $weighingHeader->contractTransaction->contract->amount;

            $allTransactionSum = ContractTransactions::where('contract_id', $weighingHeader->contractTransaction->contract_id)->sum('amount');
            $remainingContractAmount = (float) $weighingHeader->contractTransaction->contract->amount - $allTransactionSum;
            $linkedContractID = $weighingHeader->contractTransaction->contract->linked_contact_id;
            $remainingLinkedContractAmount = 0;
            if ($linkedContractID != null) {
                if (ContractTransactions::where('contract_id', $linkedContractID) != null) {
                    $allLinkedTransactionSum = ContractTransactions::where('contract_id', $linkedContractID)->sum('amount');
                    $linkedContract = Contracts::where('id', $linkedContractID)->first();
                    $remainingLinkedContractAmount = (float) $linkedContract['amount'] - $allLinkedTransactionSum;
                    $contract_total_amount = $contract_total_amount + $remainingLinkedContractAmount;
                }
            } else {
                $remainingLinkedContractAmount = 0;
            }
            $weighingHeader["contract_total_amount"] = $contract_total_amount;
            $weighingHeader["contract_remaining_amount"] = $remainingContractAmount + $remainingLinkedContractAmount;
        } else {
            $weighingHeader["contract_id"] = null;
            $weighingHeader["contract_total_amount"] = 0;
            $weighingHeader["contract_remaining_amount"] = 0;
        }

        // For ticket/receipt: only show grades when the linked product has grades enabled
        if (!empty($weighingHeader->product_id)) {
            $product = Product::find($weighingHeader->product_id);
            $weighingHeader['product_grades_enabled'] = $product ? ($product->grades_enabled ?? 'No') : 'No';
        } else {
            $weighingHeader['product_grades_enabled'] = 'No';
        }

        return $weighingHeader;
    }

    private static function resolveUserDisplayName($userId): ?string
    {
        if ($userId === null || $userId === '') {
            return null;
        }
        $user = User::query()->find((int) $userId);
        if (!$user) {
            return null;
        }
        $name = trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? ''));

        return $name !== '' ? $name : ($user->email ?? null);
    }

    /**
     * Ensure the JWT user may load this header (company scope; optional fixed site on profile).
     */
    private function assertAuthenticatedUserCanAccessWeighingHeaderPreview($headerRow): void
    {
        $user = $this->user;
        if ($user->company_id !== null && (int) $user->company_id !== (int) $headerRow->company_id) {
            throw new Exception("Access denied for workstation", 1);
        }
        if ($user->site_id !== null && (int) $user->site_id !== (int) $headerRow->site_id) {
            throw new Exception("Access denied for workstation", 1);
        }
    }

    /**
     * Require the authenticated user's role to allow deleting weighing transactions (usertypes.delete_transaction_flag).
     */
    private function assertUserMayDeleteWeighingTransactions(): void
    {
        $roleId = $this->user->role_id ?? null;
        if ($roleId === null || $roleId === '') {
            throw new Exception("Access denied: user role cannot delete weighing transactions", 1);
        }
        $userType = UserType::query()->find((int) $roleId);
        if (!$userType) {
            throw new Exception("Access denied: user role cannot delete weighing transactions", 1);
        }
        $flag = $userType->delete_transaction_flag ?? '';
        if (strcasecmp((string) $flag, 'false') === 0) {
            throw new Exception("Access denied: user role cannot delete weighing transactions", 1);
        }
    }

    /**
     * Authorize delete: header exists for site, company/site scope, role delete flag. No workstation binding.
     */
    private function authorizeWeighingHeaderDelete(string $id, $siteIdFromClient): void
    {
        $siteId = self::resolveSiteIdForHeader($id, $siteIdFromClient);
        $header = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
            ->where('site_id', '=', $siteId)
            ->first(['company_id', 'site_id']);
        if (!$header) {
            throw new Exception("WeighingHeader not found", 1);
        }
        $this->assertAuthenticatedUserCanAccessWeighingHeaderPreview($header);
        $this->assertUserMayDeleteWeighingTransactions();
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $siteId = $_GET['site_id'] ?? "";
            $workstationId = $_GET['workstation_id'] ?? null;

            if ($siteId === "" || $siteId === null) {
                $preview = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
                    ->first(['company_id', 'site_id', 'workstation_id']);
                if (!$preview) {
                    return response()->json(['error' => 'WeighingHeader not found'], 404);
                }
                $this->assertAuthenticatedUserCanAccessWeighingHeaderPreview($preview);
                $siteId = (string) $preview->site_id;
                if ($workstationId === null || $workstationId === "") {
                    $workstationId = $preview->workstation_id;
                }
            }

            $weighingHeader = WeighingHeadersController::loadSingle($id, $siteId, $workstationId);
            return response()->json($weighingHeader);
        } catch (\Throwable $th) {
            $statusCode = strpos($th->getMessage(), 'Access denied') !== false ? 403 : 404;
            return response()->json(['error' => $th->getMessage()], $statusCode);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     * @throws Exception
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $this->user;
        $siteId = $request->input('site_id', $_GET['site_id'] ?? "");
        $workstationId = $request->input('workstation_id', $_GET['workstation_id'] ?? null);

        try {
            self::loadSingle($id, $siteId, $workstationId);
        } catch (\Throwable $th) {
            $statusCode = strpos($th->getMessage(), 'Access denied') !== false ? 403 : 404;
            return response()->json(['error' => $th->getMessage()], $statusCode);
        }

        $weighingTransaction = DB::transaction(function () use ($user, $id, $request) {
            $data = $request->all();
            $data["weighing_header_id"] = $id;

            $FirstWeight = null;
            $SecondWeight = null;
            $settings = settings::find($data['settings_id']);
            if (isset($data["actiontype"]) && $data["actiontype"] == "Verify" && $settings['tares_enabled'] != 'true') {
                $data["status"] = "OPEN";
                $data["Status"] = "V";
                $data["verifyUserId"] = $user->id;
                $SecondWeight = $this->transactionService->createWeighingTransaction($data);
            } else if ($data["reason"] == "") {
                $data["status"] = "CLOSED";
                $data["Status"] = "2";
                $data["secondWeightUserId"] = $user->id;

                // Ensure transaction payload carries correct mass for the second transaction
                // Align with CREATE flow where Weight1 and WeightTotal hold the mass
                if (isset($data["SecondWeight"])) {
                    $data["Weight1"] = $data["SecondWeight"];
                    $data["WeightTotal"] = $data["SecondWeight"];
                }

                $SecondWeight = $this->transactionService->createWeighingTransaction($data);

                $FirstWeight = (new weighingTransactions)
                    ->whereRaw('weighing_header_id = UUID_TO_BIN(?, TRUE)', [$id])
                    ->first(["weighingtransactions.*", DB::raw("BIN_TO_UUID(id, TRUE) as id2, BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id2")]);

                if (!empty($FirstWeight)) {
                    $FirstWeight['id'] = $FirstWeight['id2'];
                    unset($FirstWeight['id2']);

                    $FirstWeight['weighing_header_id'] = $FirstWeight['weighing_header_id2'];
                    unset($FirstWeight['weighing_header_id2']);

                    // Update first transaction mass to match edited FirstWeight
                    if (isset($data["FirstWeight"])) {
                        DB::update(
                            "UPDATE weighingtransactions SET Weight1 = ?, WeightTotal = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = UUID_TO_BIN(?, TRUE)",
                            [
                                $data["FirstWeight"],
                                $data["FirstWeight"],
                                $FirstWeight['id']
                            ]
                        );
                    }
                }
                $net = (float) $data["NettWeight"];

                if (Arr::has($data, 'contract_id') && $data['contract_id'] != null) {
                    $contract = Contracts::find($data['contract_id']); 
                    $newcontract = Contracts::find($contract->linked_contact_id); 
                    $contractTransaction = ContractTransactions::find($data['contractTransaction']['id']); 
                
                    // Total amount already saved under the main contract
                    $totalSavedTransaction = ContractTransactions::where('contract_id', $contract->id)->sum('amount');
                    $eligibleContractAmount = (float) $contract->amount - $totalSavedTransaction;
                
                    // Debugging
                    Log::info('Contract ID: '.$contract->id);
                    Log::info('Eligible Contract Amount: '.$eligibleContractAmount);
                    Log::info('Net Amount: '.$net);
                    Log::info('Linked Contract ID: '.($newcontract ? $newcontract->id : 'None'));
                
                    if ($eligibleContractAmount >= $net) {
                        Log::info('The main contract can handle the transaction.');
                        $contractTransaction->amount = abs($net);
                        $contractTransaction->save();
                    } elseif ($newcontract && $eligibleContractAmount < $net) {
                        Log::info('The main contract cannot fully handle the transaction, checking linked contract.');
                        $contractTransaction->amount = abs($eligibleContractAmount);
                        $contractTransaction->save();
                
                        $totalLinkedSavedTransaction = ContractTransactions::where('contract_id', $newcontract->id)->sum('amount');
                        $eligibleLinkedContractAmount = (float) $newcontract->amount - $totalLinkedSavedTransaction;
                
                        Log::info('Eligible Linked Contract Amount: '.$eligibleLinkedContractAmount);
                
                        if ($eligibleLinkedContractAmount >= $net - $eligibleContractAmount) {
                            Log::info('The linked contract can handle the excess amount.');
                            $contractTransaction = ContractTransactions::create([
                                'contract_id' => $newcontract->id,
                                'amount' => abs($net - $eligibleContractAmount),
                                'weighing_header_id' => $data['weighing_header_id'],
                                'site_id' => $data['site_id'],
                                'company_id' => $data['company_id'],
                            ]);
                            $data['contract_transaction_id'] = $contractTransaction->id;
                        } else {
                            Log::info('Linked contract cannot handle the excess amount.');
                            return response()->json(['error' => 'Linked contract cannot handle the excess amount!'], 400);
                        }
                    } else {
                        Log::info('Neither contract can handle the transaction.');
                        return response()->json(['error' => 'Contract amount over is not allowed!'], 400);
                    }
                }
                

                if ($settings["export_AS400"] != "false") {
                    $product = Product::where('id', '=', $data["product_id"])->first();
                    $BusinessPartner = BusinessPartner::where('id', '=', $data["businesspartner_id"])->where('site_id', '=', $data["site_id"])->first();
                    $WeighingHeader = weighingHeaders::whereRaw('id = UUID_TO_BIN(?, TRUE)', $id)->first();
                    //$file = env('FILE_PATH');
                    $as400 = $this->appendData($WeighingHeader['transaction'], 6, "0"); //TRANSNO                    6
                    $as400 .= $this->appendData($product["code"], 6, "0"); //PRODUCT                    6
                    $as400 .= $this->appendData($data["Custom4"], 18); //F1PX1                      18
                    $as400 .= $this->appendData($data["RegNumber"], 9); //VEHREG                     9
                    $as400 .= $this->appendData($BusinessPartner["code"], 6); //CUSTOMER                   6
                    $as400 .= $this->appendData($data["Custom1"], 13); //COMMENT            30
                    $as400 .= $this->appendData("BS: " . $data["Custom2"], 9);
                    $as400 .= $this->appendData("OS:" . $data["Custom3"], 8);
                    $as400 .= $this->appendData($data["Custom5"], 18); //F2PX1                      18
                    $as400 .= $this->appendData($data["Custom6"], 18); //F3PX1                     18
                    $as400 .= $this->appendData($data["Custom7"], 18); //F4PX1                      18
                    $as400 .= $this->appendData($data["Custom8"], 18); //F5PX1                      18
                    $as400 .= $this->appendData($data["Custom9"], 18); //F6PX1                     18
                    $as400 .= $this->appendData($data["Custom10"], 18); //F7PX1                      18
                    $as400 .= $this->appendData($data["Custom11"], 18); //F8PX1                      18
                    $as400 .= $this->appendData(str_replace("-", "/", explode(' ', $FirstWeight["created_at"])[0]), 10); //W1_D,yyyy/mm/dd,           10
                    $as400 .= $this->appendData(substr(explode(' ', $FirstWeight["created_at"])[1], 0, 5), 8); //W1_T,hh:mm,                8
                    $as400 .= $this->appendData(str_replace("-", "/", explode(' ', $SecondWeight["created_at"])[0]), 10); //W2_D,yyyy/mm/dd,           10
                    $as400 .= $this->appendData(substr(explode(' ', $SecondWeight["created_at"])[1], 0, 5), 8); //W2_T,hh:mm,           8
                    $as400 .= $this->appendData(intval($data["FirstWeight"]), 12); //W1_MASS            12
                    $as400 .= $this->appendData(intval($data["SecondWeight"]), 12); //W2_MASS            12
                    Log::info(print_r($data, true));
                    Log::info($as400);
                    if ($settings["export_AS400"] != "" && $settings["export_AS400"] != "false") {
                        try {
                            file_put_contents($settings["export_AS400"], $as400 . "\r\n", FILE_APPEND | LOCK_EX);
                        } catch (Exception $e) {
                            DB::rollback();
                            throw $e;
                        }
                    }
                }
                
                if (Arr::has($data, 'Cameras') && $settings['use_cameras'] == 'Yes') {
                    foreach ($data['Cameras'] as $camera) {
                        $camera["weighing_transaction_id"] = $SecondWeight->id;
                        $camera["base64"] = CameraController::getImageFromIp($camera["ip_address"]);
                        //                    $imagedata = $camera["weighing_transaction_id"];
                        //
                        //                    list($type, $imagedata) = explode(';', $imagedata);
                        //                    list(, $imagedata) = explode(',', $imagedata);
                        //                    $imagedata = base64_decode($imagedata);
                        //                    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        //                    $charactersLength = strlen($characters);
                        //                    $randomString = '';
                        //                    for ($i = 0; $i < 10; $i++) {
                        //                        $randomString .= $characters[rand(0, $charactersLength - 1)];
                        //                    }
                        //                    file_put_contents("/tmp/$randomString.png", $imagedata);
                        $this->weighingCameraService->insertWeighingCamera($camera);
                    }
                }
            }

            $grossWeight = abs((int) $data['FirstWeight'] - (int) $data['SecondWeight']);
            $data["TotalWeight"] = $grossWeight;

            // Flag invoice_modified if ticket was already invoiced and is being edited
            $existingHeader = weighingHeaders::whereRaw('id = UUID_TO_BIN(?, TRUE)', [$id])->first();
            if ($existingHeader && $existingHeader->xero_invoice_id && $existingHeader->status == 'CLOSED') {
                $data['invoice_modified'] = 1;
            }

            $this->headerService->updateWeighingHeader($id, $data);

            // Queue Xero invoice if ticket just closed (second weight)
            if ($data["status"] == "CLOSED" && (!$existingHeader || !$existingHeader->xero_invoice_id)) {
                $this->queueXeroInvoice($id, $data, $settings);
            }

            $weighingHeader = $this->headerService->getOneWeighingHeader($id);
            $weighingHeader['FirstUser'] = self::resolveUserDisplayName($weighingHeader->firstWeightUserId ?? null);
            $weighingHeader['user_name'] = self::resolveUserDisplayName($weighingHeader->secondWeightUserId ?? null);
            if (isset($data["actiontype"]) && $data["actiontype"] !== "Verify") {
            $FirstWeight->Cameras = ($settings['use_cameras'] == 'Yes') ?
                    $this->weighingCameraService->getByWeighingTransaction($FirstWeight->id) : [];
                $SecondWeight->Cameras = ($settings['use_cameras'] == 'Yes') ?
                    $this->weighingCameraService->getByWeighingTransaction($SecondWeight->id) : [];
            }
            $weighingHeader["FirstWeight"] = $FirstWeight;
            $weighingHeader["SecondWeight"] = $SecondWeight;
            $weighingHeader["TotalWeight"] = $grossWeight;
            $weighingHeader["NettWeight"] = $data["NettWeight"];
            $weighingHeader["Setting"] = $settings;

            return $weighingHeader;
        }, 4);

        return response()->json($weighingTransaction);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $user = $this->user;
        try {
            $this->authorizeWeighingHeaderDelete($id, $_GET['site_id'] ?? "");
            $this->headerService->deleteWeighingHeader($id, $user->id);
            return response()->json(['status' => true]);
        } catch (Exception $e) {
            $statusCode = strpos($e->getMessage(), 'Access denied') !== false ? 403 : 404;
            return response()->json(['status' => false, 'error' => $e->getMessage()], $statusCode);
        }
    }

    public function deleteWithReason(Request $request, $id): JsonResponse
    {
        $user = $this->user;
        try {
            $this->authorizeWeighingHeaderDelete(
                $id,
                $request->input('site_id', $_GET['site_id'] ?? "")
            );
            $this->headerService->deleteWeighingHeader($id, $user->id, $request->all()['reason']);
            return response()->json(['status' => true]);
        } catch (Exception $e) {
            Log::error("{$e->getMessage()}\n{$e->getTraceAsString()}");
            $statusCode = strpos($e->getMessage(), 'Access denied') !== false ? 403 : 404;
            return response()->json(['status' => false, 'error' => $e->getMessage()], $statusCode);
        }
    }

    public function appendData($value, $len, $fill = " ")
    {
        if (strlen($value) < $len) {
            $value = str_pad($value, $len, $fill, STR_PAD_LEFT);
        }
        if (strlen($value) > $len) {
            $value = substr($value, 0, $len);
        }
        return $value;
    }

    // public function secondWeightLoad(): JsonResponse
    // {
    //     $dataSet = [];
    //     $weighId = $_GET['weighId'] ?? "";
    //     $companyId = $_GET['company_id'] ?? "";
    //     $siteId = $_GET['site_id'] ?? "";
    //     $workstationId = $_GET['workstation_id'] ?? "";
    //     // try {
    //     //     $dataSet['weighingHeader'] = WeighingHeadersController::loadSingle($weighId, $siteId);
    //     // } catch (ModelNotFoundException) {
    //     //     return response()->json(['error' => "weighingHeaders not found"], 404);
    //     // }

    //     $weighbridgeId = $dataSet['weighingHeader']->weighbridge_id;
    //     $settingId = $dataSet['weighingHeader']->settings_id;
    //     $dataSet = SettingsController::weighingLoadData($dataSet, $companyId, $siteId, $workstationId, $weighbridgeId, $settingId);
    //     $dataSet = SettingsController::weighingAddData($dataSet, $companyId, $siteId, $workstationId);
    //     return response()->json(['data' => $dataSet], 200);
    // }

    public function secondWeightNewLoad(Request $request): JsonResponse
    {
        $dataSet = [];
        $weighing_header_id = $_GET['weighing_header_id'] ?? "";
        $siteId = $_GET['site_id'] ?? "";
        $workstationId = $_GET['workstation_id'] ?? null;
        $weighingHeader = WeighingHeadersController::loadSingle($weighing_header_id, $siteId, $workstationId);
        
        // try {
        //     $dataSet['weighingHeader'] = WeighingHeadersController::loadSingle($weighId, $siteId);
        // } catch (ModelNotFoundException) {
        //     return response()->json(['error' => "weighingHeaders not found"], 404);
        // }

        $weighbridgeId = $dataSet['weighingHeader']->weighbridge_id;
        $settingId = $dataSet['weighingHeader']->settings_id;
        $companyId = $dataSet['weighingHeader']->company_id;
        $workstationId = $dataSet['weighingHeader']->workstation_id;
        $dataSet = SettingsController::weighingLoadData($dataSet, $companyId, $siteId, $workstationId, $weighbridgeId, $settingId);
        $dataSet = SettingsController::weighingAddData($dataSet, $companyId, $siteId, $workstationId);
        $dataSet = WeighbridgeController::LoadData($companyId, $siteId, $workstationId);
        $dataSet = CameraController::getImageFromIpString($request);

        // $dataSet["use_cameras"] = CameraController::LoadData($companyId, $siteId, $workstationId, $weighbridgeId);

        
        return response()->json(['data' => $dataSet], 200);
    }

    private function queueXeroInvoice(string $headerIdUuid, array $data, $settings): void
    {
        $companyId = $data['company_id'] ?? null;
        if (!$companyId) {
            return;
        }

        $xeroSettings = XeroSettings::where('company_id', $companyId)
            ->where('xero_enabled', true)
            ->where('auto_create_invoices', true)
            ->first();

        // Xero queueing is controlled by Xero settings only; weighing-type invoice
        // setting is intentionally independent and should not gate Xero sync.
        if (!$xeroSettings) {
            return;
        }

        try {
            $bp = isset($data['businesspartner_id']) ? BusinessPartner::find($data['businesspartner_id']) : null;
            $product = isset($data['product_id']) ? Product::find($data['product_id']) : null;

            $invoiceService = app(XeroInvoiceService::class);
            $queueItem = $invoiceService->queueInvoice($headerIdUuid, $companyId, [
                'ticket_number' => $data['transaction'] ?? null,
                'customer_name' => $bp->name ?? null,
                'product_name'  => $product->name ?? null,
                'net_weight'    => $data['NettWeight'] ?? null,
            ]);
            dispatch(new ProcessXeroInvoice($queueItem->id));
        } catch (\Exception $e) {
            Log::error('Xero invoice queue failed: ' . $e->getMessage());
        }
    }
}