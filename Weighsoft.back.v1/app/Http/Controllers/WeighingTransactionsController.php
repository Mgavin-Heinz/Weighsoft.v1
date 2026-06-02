<?php

namespace App\Http\Controllers;

use App\Models\weighingTransactions;
use App\Services\WeighingCameraService;
use App\Services\WeighingTransactionService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WeighingTransactionsController extends JwtAuthController
{
    private weighingTransactions $model;
    private WeighingTransactionService $transactionService;
    private WeighingCameraService $weighingCameraService;

    public function __construct(WeighingTransactionService $transactionService, WeighingCameraService $weighingCameraService)
    {
        parent::__construct();
        $this->model = new weighingTransactions();
        $this->transactionService = $transactionService;
        $this->weighingCameraService = $weighingCameraService;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $sql = "
            SELECT
                bin_to_uuid(id, TRUE) AS id,
                Status,
                Weight1,
                Weight2,
                Weight3,
                Weight4,
                Weight5,
                Weight6,
                WeightTotal,
                bin_to_uuid(weighing_header_id, TRUE) AS weighing_header_id,
                site_id,
                workstation_id,
                company_id,
                updated_at,
                created_at,
                AxelSetups
            FROM
                weighingtransactions
            ";

        $filters = array("deleted_at IS NULL");
        $parameters = array();

        if (isset($_GET) && isset($_GET['company_id'])) {
            array_push($filters, "company_id = ?");
            array_push($parameters, $_GET['company_id']);
        }

        if (isset($_GET) && isset($_GET['site_id'])) {
            array_push($filters, "site_id = ?");
            array_push($parameters, $_GET['site_id']);
        }

        if (isset($_GET) && isset($_GET['workstation_id'])) {
            array_push($filters, "workstation_id = ?");
            array_push($parameters, $_GET['workstation_id']);
        }

        if (isset($_GET) && isset($_GET['weighing_header'])) {
            array_push($filters, "weighing_header_id = UUID_TO_BIN(?, TRUE)");
            array_push($parameters, $_GET['weighing_header']);
        }

        if (isset($_GET) && isset($_GET['weighing_transactions'])) {
            array_push($filters, "id = UUID_TO_BIN(?, TRUE)");
            array_push($parameters, $_GET['weighing_transactions']);
        }

        $sql .= " WHERE " . implode(" AND ", $filters);

        try {
            $weighingTransactions = DB::select($sql, $parameters);
        } catch (Exception $e)  {
            Log::error($e->getMessage() . "\n" . $e->getTraceAsString());
            return response('', 500)->json("There was a problem");
        }

        foreach ($weighingTransactions as $weighingTransaction) {
            $weighingTransaction->Cameras = $this->weighingCameraService->getByWeighingTransaction($weighingTransaction->id);
            $weighingTransaction->created_at = Carbon::parse($weighingTransaction->created_at)->format('Y-m-d H:i:s');
            $weighingTransaction->updated_at = Carbon::parse($weighingTransaction->updated_at)->format('Y-m-d H:i:s');
        }

        return response()->json($weighingTransactions);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->all();

        $weighingTransaction = $this->transactionService->createWeighingTransaction($data);

        return response()->json($weighingTransaction);
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $sql = "
            SELECT
                bin_to_uuid(id, TRUE) AS id,
                Status,
                Weight1,
                Weight2,
                Weight3,
                Weight4,
                Weight5,
                Weight6,
                WeightTotal,
                bin_to_uuid(weighing_header_id, TRUE) AS weighing_header_id,
                site_id,
                workstation_id,
                company_id,
                updated_at,
                created_at,
                AxelSetups
            FROM
                weighingtransactions
            WHERE
                id = UUID_TO_BIN(?)";

        $weighingTransactions = DB::select($sql, [$id]);

        if (count($weighingTransactions) == 0) {
            return $this->error('WeighingTransaction not found', 404);
        }

        return response()->json($weighingTransactions[0]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $sql = "
            UPDATE
                weighingtransactions
            SET
                Status = :Status,
                Weight1 = :Weight1,
                Weight2 = :Weight2,
                Weight3 = :Weight3,
                Weight4 = :Weight4,
                Weight5 = :Weight5,
                Weight6 = :Weight6,
                WeightTotal = :WeightTotal,
                weighing_header_id = BIN_TO_UUID(:weighing_header_id, TRUE),
                site_id = :site_id,
                workstation_id = :workstation_id,
                company_id = :company_id,
                updated_at = CURRENT_TIMESTAMP(),
                AxelSetups = :AxelSetups
            WHERE
                id = UUID_TO_BIN(:id, TRUE);
        ";

        $parameters = $request->all();
        $parameters["id"] = $id;
        $weighingTransaction = DB::update($sql, $parameters);

        return response()->json($weighingTransaction);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param string $id
     * @return JsonResponse
     * @throws Exception
     */
    public function destroy(string $id): JsonResponse
    {
        $weighingTransaction = $this->transactionService->deleteWeighingTransaction($id);

        return response()->json($weighingTransaction);
    }
}
