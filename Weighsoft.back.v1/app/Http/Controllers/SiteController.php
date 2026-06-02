<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Site;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends JwtAuthController
{
    private Site $model;
    private string $modelName = "Site";

    public function __construct()
    {
        parent::__construct();
        $this->model = new Site();
    }

    public function index(): JsonResponse
    {
        $sites = $this->model;
        if (isset($_GET) && isset($_GET['company_id'])) {
            $sites = $sites->where('company_id', '=', $_GET['company_id']);
        }
        $sites = $sites->get();

        foreach ($sites as $site) {
            $workstations = WorkStations::where('site_id', $site->id)->get();
            $site->workstation = $workstations;
            foreach ($workstations as $workstation) {
                $weighbridge = Weighbridge::where('workstation_id', $workstation->id)->get();
                $workstation->weighbridge = $weighbridge;
            }
        }

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn ($item) => $item['company_id'], $sites->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        foreach ($sites as $site) {
            $company = $companyDict[$site->company_id] ?? null;
            $site->company ??= ($company == null ? null : $company->registered_name);
        }

        return response()->json($sites);
    }

    public function store(Request $request): JsonResponse
    {
        $item = $this->setDefaults($request->all());
        $sites = $this->model->create($item);
        return response()->json($sites);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $site = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $workstations = WorkStations::where('site_id', $site->id)->get();
        $site->workstation = $workstations;
        foreach ($workstations as $workstation) {
            $weighbridge = Weighbridge::where('workstation_id', $workstation->id)->get();
            $workstation->weighbridge = $weighbridge;
        }

        return response()->json($site);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $site = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $item = $this->setDefaults($request->all());
        $site->update($item);
        return response()->json($site);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $site = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $site->delete();
        return response()->json([
            'status' => true,
        ]);
    }

    private function setDefaults($item)
    {
        if (!isset($item['custom_header_text']) || empty($item['custom_header_text']))
            $item['custom_header_text'] = '';
        if (!isset($item['custom_footer_text']) || empty($item['custom_footer_text']))
            $item['custom_footer_text'] = '';
        if (!isset($item['measure_type']) || empty($item['measure_type']))
            $item['measure_type'] = 'KG';
        if (!isset($item['deduct_flow']) || empty($item['deduct_flow']))
            $item['deduct_flow'] = 'default';

        return $item;
    }
}
