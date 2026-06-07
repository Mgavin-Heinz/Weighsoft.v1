<?php

namespace App\Http\Controllers;

use App\Models\Pallet;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    // updated index to use $request instead of $_GET
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id', '');
        $siteId = $request->query('site_id', '');
        $data = $this->LoadData($companyId, $siteId);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        // added some validation
        $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'company_id' => 'required',
            'site_id' => 'required',
        ]);

        $item = $this->model->create($request->all());
        return response()->json($item);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $pallet = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($pallet);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $pallet = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        // added validation for update too
        $request->validate([
            'code' => 'string',
            'name' => 'string',
        ]);

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
