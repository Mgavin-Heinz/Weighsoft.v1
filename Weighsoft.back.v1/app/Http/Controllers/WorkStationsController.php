<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Site;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkStationsController extends JwtAuthController
{
    private WorkStations $model;
    private string $modelName = "Workstation";

    public function __construct() {
        parent::__construct();
        $this->model = new WorkStations();
    }

    public function index(): JsonResponse
    {
        if (isset($_GET) && isset($_GET['company_id'])) {
            $this->model = $this->model->where('company_id', '=', $_GET['company_id']);
        }
        if (isset($_GET) && isset($_GET['site_id'])) {
            $this->model = $this->model->where('site_id', '=', $_GET['site_id']);
        }
        $data = $this->model->get();

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn($item) => $item->company_id, $data->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        $sites = (new Site())
            ->whereIn('id', array_unique(array_map(fn($item) => $item->site_id, $data->toArray())))
            ->get(['id', 'site_name']);
        $siteDict = array();
        foreach ($sites as $site) {
            $siteDict[$site->id] = $site;
        }

        foreach ($data as $workstation) {
            $company = $companyDict[$workstation->company_id];
            $site = $siteDict[$workstation->workstation_id];

            $workstation->company = ($company == null ? null : $company->registered_name);
            $workstation->workstation = ($site == null ? null : $site->site_name);
        }

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $workstation = $this->model->create($request->all());
        return response()->json($workstation);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $workstation = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $weighbridge = Weighbridge::where('workstation_id', $workstation->id)->get();
        $workstation->weighbridge = $weighbridge;

        return response()->json($workstation);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $workstation = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $workstation->update($request->only($workstation->getFillable()));
        return response()->json($workstation);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $workstation = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $workstation->delete();
        return response()->json([
            'status' => true,
        ]);
    }
}
