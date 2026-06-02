<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Haulier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HaulierController extends JwtAuthController
{
    private Haulier $model;
    private string $modelName;

    public function __construct()
    {
        parent::__construct();
        $this->model = new Haulier();
        $this->modelName = "Haulier";
    }

    public static function LoadData($companyId, $siteId)
    {
        $query = new Haulier();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }
        if ($siteId != "") {
            $query = $query->where('site_id', '=', $siteId);
        }

        $data = $query->orderBy('code')->get();

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn ($item) => $item['company_id'], $data->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        foreach ($data as $haulier) {
            $company = $companyDict[$haulier->company_id];
            $haulier->company = ($company == null ? null : $company->registered_name);
            $haulier['displayName'] = e($haulier->name) . ' (' . e($haulier->code) . ')';
            $haulier['report'] = e($haulier->name) . ' (' . e($haulier->code) . ')';
        }
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

    public function store(Request $request): JsonResponse
    {
        $hauliers = $this->model->create($request->all());

        return response()->json($hauliers);
    }

    public function destroy($id): JsonResponse
    {
        try {
            $haulier = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $haulier->delete();
        return response()->json($haulier);
    }

    public function show($id): JsonResponse
    {
        try {
            $haulier = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        // Load company to check if smart_hauliers is enabled
        $company = Company::find($haulier->company_id);
        $haulier->company_smart_hauliers = $company ? $company->smart_hauliers : false;

        // If smart_hauliers is enabled, load linked RFID vehicles
        if ($haulier->company_smart_hauliers) {
            $vehicles = $haulier->vehicles()
                ->orderBy('registration_number')
                ->get(['id', 'registration_number', 'rfid', 'haulier_id', 'company_id', 'site_id']);
            
            // Format vehicles for display
            $haulier->linked_vehicles = $vehicles->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'registration_number' => $vehicle->registration_number,
                    'rfid' => $vehicle->rfid,
                ];
            });
        } else {
            $haulier->linked_vehicles = [];
        }

        return response()->json($haulier);
    }

    public function update($id, Request $request): JsonResponse
    {
        try {
            $haulier = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $haulier->update($request->all());
        return response()->json($haulier);
    }
}
