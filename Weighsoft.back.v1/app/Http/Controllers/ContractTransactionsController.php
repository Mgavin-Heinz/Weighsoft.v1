<?php

namespace App\Http\Controllers;

use App\Models\ContractTransactions;
use App\Services\ContractTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractTransactionsController extends JwtAuthController
{
    private ContractTransactions $model;
    private ContractTransactionService $contractTransactionService;
    private string $modelName;

    public function __construct(ContractTransactionService $service)
    {
        parent::__construct();
        $this->model = new ContractTransactions();
        $this->contractTransactionService = $service;
        $this->modelName = "ContractTransactions";
    }

    public function index(): JsonResponse
    {
        $columns = array("contract_transactions.*");

        if (isset($_GET) && isset($_GET['company_id'])) {
            $this->model = $this->model
                ->join('companies', 'companies.id', '=', 'contract_transactions.company_id')
                ->where('contract_transactions.company_id', '=', $_GET['company_id']);

            array_push($columns, "companies.registered_name as company_name");
        }

        if (isset($_GET) && isset($_GET['site_id'])) {
            $this->model = $this->model
                ->join('sites', 'sites.id', '=', 'contract_transactions.site_id')
                ->where('contract_transactions.site_id', '=', $_GET['site_id']);

            array_push($columns, "sites.site_name as site_name");
        }

        $contractQuery = $this->model
            ->join('contracts', 'contracts.id', '=', 'contract_transactions.contract_id')
            ->join('companies', 'companies.id', '=', 'contract_transactions.company_id');

        if (request()->has('contract_id')) {
            $contractQuery->where('contract_transactions.contract_id', request('contract_id'));
        }

        array_push($columns, "contracts.name as contract_name");
        array_push($columns, DB::raw("BIN_TO_UUID(contract_transactions.id, TRUE) as id2, BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id2"));

        $contractQuery = $contractQuery->select($columns);
        $transactions = $contractQuery->get();

        foreach ($transactions as $transaction) {
            $transaction->id = $transaction->id2;
            $transaction->weighing_header_id = $transaction->weighing_header_id2;

            unset($transaction->id2);
            unset($transaction->weighing_header_id2);
        }

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $newItem = $this->contractTransactionService->insertItem($data);
        return response()->json($newItem);
    }

    public function show($id): JsonResponse
    {
        $item = $this->contractTransactionService->getOne($id);
        if (empty($item)) {
            return $this->error("$this->modelName not found", 404);
        }
        return response()->json($item);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $updated = $this->contractTransactionService->updateItem($id, $request->all());
        if (!$updated) {
            return $this->error("$this->modelName not found", 404);
        }
        return response()->json($updated);
    }

    public function destroy($id): JsonResponse
    {
        $deleted = $this->contractTransactionService->deleteItem($id);

        if (!$deleted) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($deleted);
    }
}
