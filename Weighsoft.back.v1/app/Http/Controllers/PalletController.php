<?php

namespace App\Http\Controllers;

use App\Models\Pallet;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PalletController extends JwtAuthController
{
    private Pallet $model;
    private string $modelName;

    public function __construct() {
        parent::__construct();
        $this->model = new Pallet();
        $this->modelName = "Pallet";
    }
    public static function LoadData($companyId, $siteId)
    {
        $query = new Pallet();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }
        if ($siteId != "") {
            $query = $query->where('site_id', '=', $siteId);
        }
        
        $data = $query->get();
        return $data;
    }
    public function index(): JsonResponse
    {
        $companyId = "";
        $siteId = "";
        if (isset($_GET) && isset($_GET['company_id'])) {
            $companyId = $_GET['company_id'];
        }
        if (isset($_GET) && isset($_GET['site_id'])) {
            $siteId = $_GET['site_id'];
        }
        $data = $this->LoadData($companyId, $siteId);
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $item = $this->model->create($request->all());
        return response()->json($item);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $pallet = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($pallet);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $pallet = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $pallet->update($request->all());
        return response()->json($pallet);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $pallet = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $pallet->delete();
        return response()->json($pallet);
    }

    public function deleteWithReason(Request $request, int $id): JsonResponse
    {
        try {
            $contract = $this->model->findOrFail($id);
            $contract->update(['reason' => $request->all()['reason']]);
            $contract->delete();
            return response()->json(['status' => true]);
        } catch (ModelNotFoundException){
            return $this->error("$this->modelName not found", 404);
        }
    }
}
