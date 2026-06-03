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

    // Fix: inject Request and use $request->query() instead of $_GET
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id', '');
        $siteId    = $request->query('site_id', '');

        $data = $this->LoadData($companyId, $siteId);
        return response()->json($data);
    }

    // Fix: validate input before creating
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|max:50',
            'name'       => 'required|string|max:100',
            'company_id' => 'required|integer|exists:companies,id',
            'site_id'    => 'required|integer|exists:sites,id',
        ]);

        $haulier = $this->model->create($data);
        return response()->json($haulier, 201);
    }

    public function show($id): JsonResponse
    {
        try {
            $haulier = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $company = Company::find($haulier->company_id);
        $haulier->company_smart_hauliers = $company ? $company->smart_hauliers : false;

        if ($haulier->company_smart_hauliers) {
            $vehicles = $haulier->vehicles()
                ->orderBy('registration_number')
                ->get(['id', 'registration_number', 'rfid', 'haulier_id', 'company_id', 'site_id']);

            $haulier->linked_vehicles = $vehicles->map(function ($vehicle) {
                return [
                    'id'                  => $vehicle->id,
                    'registration_number' => $vehicle->registration_number,
                    'rfid'                => $vehicle->rfid,
                ];
            });
        } else {
            $haulier->linked_vehicles = [];
        }

        return response()->json($haulier);
    }

    // Fix: correct parameter order (Request first, then $id)
    // Fix: validate input before updating
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $haulier = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $data = $request->validate([
            'code'       => 'sometimes|string|max:50',
            'name'       => 'sometimes|string|max:100',
            'company_id' => 'sometimes|integer|exists:companies,id',
            'site_id'    => 'sometimes|integer|exists:sites,id',
        ]);

        $haulier->update($data);
        return response()->json($haulier);
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
}
