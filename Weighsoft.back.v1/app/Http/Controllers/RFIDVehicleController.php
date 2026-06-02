<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\RFIDVehicle;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RFIDVehicleController extends JwtAuthController
{
    private RFIDVehicle $model;
    private string $modelName = "RFID Vehicle";

    public function __construct() {
        parent::__construct();
        $this->model = new RFIDVehicle();
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $rfidVehicles = $this->model;
            
            // Support both 'company' and 'company_id' query parameters for backwards compatibility
            if (isset($_GET['company_id'])) {
                $rfidVehicles = $rfidVehicles->where('company_id', '=', $_GET['company_id']);
            } elseif (isset($_GET['company'])) {
                $rfidVehicles = $rfidVehicles->where('company_id', '=', $_GET['company']);
            }

            // Support site filtering
            if (isset($_GET['site_id'])) {
                $rfidVehicles = $rfidVehicles->where('site_id', '=', $_GET['site_id']);
            } elseif (isset($_GET['site'])) {
                $rfidVehicles = $rfidVehicles->where('site_id', '=', $_GET['site']);
            }

            // Eager load relationships for Smart Hauliers feature
            $rfidVehicles = $rfidVehicles->with(['company', 'haulier', 'site'])->get();

            // Add formatted data for frontend
            foreach ($rfidVehicles as $rfidVehicle) {
                $rfidVehicle->company_name = optional($rfidVehicle->company)->registered_name;
                $rfidVehicle->haulier_name = optional($rfidVehicle->haulier)->name;
                $rfidVehicle->site_name = optional($rfidVehicle->site)->site_name;
            }
            
            return response()->json($rfidVehicles);
        } catch (\Throwable $th) {
            Log::error('RFIDVehicleController@index error: ' . $th->getMessage());
            Log::error('Stack trace: ' . $th->getTraceAsString());
            Log::error('Request params: ' . json_encode($_GET));
            return response()->json(['error' => $th->getMessage(), 'message' => 'Failed to load RFID vehicles'], 500);
        }
        
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'registration_number' => 'required|string|max:255',
            'rfid' => 'required|string|max:255',
            'company_id' => 'required|integer|exists:companies,id',
            'site_id' => 'nullable|integer|exists:sites,id',
            'haulier_id' => 'nullable|integer|exists:hauliers,id',
        ]);

        $rfidVehicle = $this->model->create($request->all());

        // Load relationships for response
        $rfidVehicle->load(['company', 'haulier', 'site']);
        $rfidVehicle->company_name = $rfidVehicle->company ? $rfidVehicle->company->registered_name : null;
        $rfidVehicle->haulier_name = $rfidVehicle->haulier ? $rfidVehicle->haulier->name : null;
        $rfidVehicle->site_name = $rfidVehicle->site ? $rfidVehicle->site->site_name : null;

        return response()->json($rfidVehicle);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $rfidVehicle = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $rfidVehicle->delete();
        return response()->json($rfidVehicle);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $rfidVehicle = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($rfidVehicle);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        try {
            $rfidVehicle = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $request->validate([
            'registration_number' => 'sometimes|required|string|max:255',
            'rfid' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer|exists:companies,id',
            'site_id' => 'nullable|integer|exists:sites,id',
            'haulier_id' => 'nullable|integer|exists:hauliers,id',
        ]);

        $rfidVehicle->update($request->all());
        
        // Load relationships for response
        $rfidVehicle->load(['company', 'haulier', 'site']);
        $rfidVehicle->company_name = $rfidVehicle->company ? $rfidVehicle->company->registered_name : null;
        $rfidVehicle->haulier_name = $rfidVehicle->haulier ? $rfidVehicle->haulier->name : null;
        $rfidVehicle->site_name = $rfidVehicle->site ? $rfidVehicle->site->site_name : null;
        
        return response()->json($rfidVehicle);
    }

    /**
     * Lookup vehicle by registration number for auto-selection (Smart Hauliers feature)
     * Used by weighing screens for auto-selecting haulier based on vehicle registration
     * GET /api/rfidvehicle/lookup?registration=ABC123&company_id=21
     */
    public function lookup(Request $request): JsonResponse
    {
        $registration = $request->query('registration');
        $companyId = $request->query('company_id');

        Log::info('[Smart Hauliers] Lookup called', [
            'registration' => $registration,
            'company_id' => $companyId,
            'query_params' => $request->query()
        ]);

        if (!$registration || !$companyId) {
            Log::warning('[Smart Hauliers] Missing required parameters', [
                'registration' => $registration,
                'company_id' => $companyId
            ]);
            return response()->json(['message' => 'Missing registration or company_id'], 400);
        }

        // Trim whitespace and normalize
        $registration = trim($registration);

        // Log all vehicles for this company for debugging
        $allVehicles = RFIDVehicle::where('company_id', $companyId)
            ->select('id', 'registration_number', 'company_id', 'haulier_id')
            ->get();

        Log::info('[Smart Hauliers] All vehicles in company', [
            'count' => $allVehicles->count(),
            'vehicles' => $allVehicles->map(function($v) {
                return [
                    'id' => $v->id,
                    'reg' => $v->registration_number,
                    'reg_lower' => strtolower(trim($v->registration_number)),
                    'haulier_id' => $v->haulier_id
                ];
            })->toArray()
        ]);

        Log::info('[Smart Hauliers] Searching for', [
            'original' => $registration,
            'lower' => strtolower($registration)
        ]);

        // Case-insensitive and whitespace-trimmed lookup
        $vehicle = RFIDVehicle::whereRaw('TRIM(LOWER(registration_number)) = TRIM(LOWER(?))', [$registration])
            ->where('company_id', $companyId)
            ->with(['haulier.businessPartner'])
            ->first();

        if (!$vehicle) {
            Log::warning('[Smart Hauliers] Vehicle not found', [
                'registration' => $registration,
                'company_id' => $companyId
            ]);
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        Log::info('[Smart Hauliers] Vehicle found', [
            'vehicle_id' => $vehicle->id,
            'registration' => $vehicle->registration_number,
            'haulier_id' => $vehicle->haulier_id,
            'has_haulier' => $vehicle->haulier !== null
        ]);

        // Format response with haulier and business partner information
        $response = [
            'id' => $vehicle->id,
            'registration_number' => $vehicle->registration_number,
            'haulier_id' => $vehicle->haulier_id,
        ];

        if ($vehicle->haulier) {
            $response['haulier'] = [
                'id' => $vehicle->haulier->id,
                'code' => $vehicle->haulier->code,
                'name' => $vehicle->haulier->name,
                'displayName' => $vehicle->haulier->name . " (" . $vehicle->haulier->code . ")",
                'business_partner_id' => $vehicle->haulier->business_partner_id,
            ];

            // Add business partner if linked
            if ($vehicle->haulier->businessPartner) {
                $response['haulier']['business_partner'] = [
                    'id' => $vehicle->haulier->businessPartner->id,
                    'code' => $vehicle->haulier->businessPartner->code,
                    'name' => $vehicle->haulier->businessPartner->name,
                    'displayName' => $vehicle->haulier->businessPartner->name . " (" . $vehicle->haulier->businessPartner->code . ")",
                ];
            }
        }

        return response()->json($response);
    }
}

