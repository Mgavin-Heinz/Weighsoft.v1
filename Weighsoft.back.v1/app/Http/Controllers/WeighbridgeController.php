<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Company;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WeighbridgeController extends JwtAuthController
{
    private Weighbridge $model;
    private string $modelName = "Weighbridge";

    public function __construct()
    {
        parent::__construct();
        $this->model = new Weighbridge();
    }

    public static function LoadData($companyId, $siteId, $workstationId)
    {
        if (empty($workstationId) || empty($siteId) || empty($companyId)) {
            throw new Exception("Please select Company, Site, and Workstation", 1);
        }

        $query = new Weighbridge();
        $conditions = ['company_id' => $companyId, 'site_id' => $siteId, 'workstation_id' => $workstationId];

        foreach ($conditions as $column => $id) {
            if ($id != "") {
                $query = $query->where($column, '=', $id);
            }
        }

        $data = $query->get();

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn($item) => $item['company_id'], $data->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        $workstations = (new WorkStations())
            ->whereIn('id', array_unique(array_map(fn($item) => $item['workstation_id'], $data->toArray())))
            ->get(['id', 'workstation_name']);
        $workstationDict = array();
        foreach ($workstations as $workstation) {
            $workstationDict[$workstation->id] = $workstation;
        }

        foreach ($data as $weighbridge) {
            $company = $companyDict[$weighbridge->company_id];
            $workstation = $workstationDict[$weighbridge->workstation_id];

            $weighbridge->company = ($company == null ? null : $company->registered_name);
            $weighbridge->workstation = ($workstation == null ? null : $workstation->workstation_name);
        }

        return $data;
    }
    public function index(): JsonResponse
    {
        $companyId = $_GET['company_id'] ?? "";
        $siteId = $_GET['site_id'] ?? "";
        $workstationId = $_GET['workstation_id'] ?? "";

        try {
            $data = $this->LoadData($companyId, $siteId, $workstationId);
            return response()->json($data);
        } catch (\Throwable $th) {
            return response()->json(["Message" => "Error, {$th->getMessage()}"], 404);
        }

    }

    public function store(Request $request): JsonResponse
    {
        Log::info(print_r($request->all(), true));
        $item = $this->setDefaults($request->all());
        try {
            $weighbridge = $this->model->create($item);
            return response()->json($weighbridge);
        } catch (Exception $exc) {
            return response()->json($exc, 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        //Log::info("Hello");
        try {
            $weighbridge = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName", 404);
        }

        $camera = Camera::where('weighbridge_id', $weighbridge->id)->get();
        $weighbridge->camera = $camera;

        return response()->json($weighbridge);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $weighbridge = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName", 404);
        }
        $item = $request->all();
        Log::info(print_r($item, true));
        $item = $this->setDefaults($item);

        $weighbridge->update($item);
        return response()->json($weighbridge);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $weighbridge = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName", 404);
        }

        $weighbridge->delete();
        return response()->json([
            'status' => true,
        ]);
    }

    private function setDefaults($item)
    {
        if (!isset($item['port_num']) || empty($item['port_num'])) {
            $item['port_num'] = '';
        }
        if (!isset($item['display_port_num']) || empty($item['display_port_num'])) {
            $item['display_port_num'] = '';
        }
        if (!isset($item['scale'])) {
            $item['scale'] = '';
        }
        if (!isset($item['in_reverse']) || empty($item['in_reverse'])) {
            $item['in_reverse'] = 'No';
        }
        if (!isset($item['weighing_transaction_flag']) || empty($item['weighing_transaction_flag'])) {
            $item['weighing_transaction_flag'] = '';
        }
        if (!isset($item['decimal_places'])) {
            $item['decimal_places'] = '0';
        }
        if (!isset($item['stable_samples'])) {
            $item['stable_samples'] = '0';
        }
        if (!isset($item['manual'])) {
            $item['manual'] = 'No';
        }
        if (!isset($item['weight']) || empty($item['weight'])) {
            $item['weight'] = 0;
        }
        // ESP32 IP addresses
        if (!isset($item['incoming_boom_ip']) || empty($item['incoming_boom_ip'])) {
            $item['incoming_boom_ip'] = null;
        }
        if (!isset($item['exiting_boom_ip']) || empty($item['exiting_boom_ip'])) {
            $item['exiting_boom_ip'] = null;
        }
        if (!isset($item['incoming_light_ip']) || empty($item['incoming_light_ip'])) {
            $item['incoming_light_ip'] = null;
        }
        if (!isset($item['exiting_light_ip']) || empty($item['exiting_light_ip'])) {
            $item['exiting_light_ip'] = null;
        }
        
        // ESP32 relay numbers (1-8)
        if (!isset($item['incoming_boom_relay']) || empty($item['incoming_boom_relay'])) {
            $item['incoming_boom_relay'] = null;
        }
        if (!isset($item['exiting_boom_relay']) || empty($item['exiting_boom_relay'])) {
            $item['exiting_boom_relay'] = null;
        }
        if (!isset($item['incoming_light_relay']) || empty($item['incoming_light_relay'])) {
            $item['incoming_light_relay'] = null;
        }
        if (!isset($item['exiting_light_relay']) || empty($item['exiting_light_relay'])) {
            $item['exiting_light_relay'] = null;
        }
        
        Log::info('Weighbridge data being processed:', ['data' => $item]);
        
        return $item;
    }
}
