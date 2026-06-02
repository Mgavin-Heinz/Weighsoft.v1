<?php

namespace App\Http\Controllers;

use App\Models\settings;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SettingsController extends JwtAuthController
{
    private settings $model;
    private string $modelName = "Setting";

    public function __construct()
    {
        parent::__construct();
        $this->model = new settings();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $query = $this->model;

        if (isset($_GET)) {
            if (!empty($_GET['company_id'])) {
                $query = $query->where("company_id", "=", $_GET['company_id']);
            }

            // if (!empty($_GET['site_id'])) {
            //     $query = $query->where('site_id', "=", $_GET['site_id']);
            // }

            // if (!empty($_GET['workstation_id'])) {
            //     $query = $query->where('workstation_id', '=', $_GET['workstation_id']);
            // }
        }

        $data = $query->get();

        if (empty($data)) {
            return response()->json([]);
        }

        return response()->json([$data]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $item = $request->all();
        $item = $this->setDefaults($item);

        $data = $this->model->create($item);

        return response()->json($data);
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
            $setting = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($setting);
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
            $setting = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $item = $request->all();
        $item = $this->setDefaults($item);

        $setting->update($item);
        return response()->json($setting);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $setting = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $setting->delete();
        return response()->json($setting);
    }
    public function updateImage(Request $request)
    {
        Log::info("Starting updateImage");
        $image = $request->file;
        $id = $request->input('id');
        $option = $request->input('option');

        if ($image) {
            $base64Image = base64_encode(file_get_contents($image));

            // Assuming you have a "settings" model:
            $setting = settings::find($id);

            if (!$setting) {
                return response()->json(['message' => 'Setting not found'], 404);
            }
            if ($option == 'header')
                $setting->display_custom_header_img = $base64Image;
            if ($option == 'footer')
                $setting->display_custom_footer_img = $base64Image;
            $setting->save();

            return response()->json(['message' => $base64Image], 200);
        } else {
            return response()->json(['message' => 'Image not found'], 400);
        }
    }
    private function setDefaults($item)
    {

        $item['AS_400_path'] = $item['AS_400_path'] ?? "";
        $item['user_defined_val2'] = $item['user_defined_val2'] ?? ' ';
        $item['user_defined_val3'] = $item['user_defined_val3'] ?? ' ';
        $item['user_defined_val4'] = $item['user_defined_val4'] ?? ' ';
        $item['user_defined_val5'] = $item['user_defined_val5'] ?? ' ';
        $item['user_defined_val6'] = $item['user_defined_val6'] ?? ' ';
        $item['user_defined_val7'] = $item['user_defined_val7'] ?? ' ';
        $item['user_defined_val8'] = $item['user_defined_val8'] ?? ' ';
        $item['user_defined_val9'] = $item['user_defined_val9'] ?? ' ';
        $item['user_defined_val10'] = $item['user_defined_val10'] ?? ' ';

        $item['user_defined_rep2'] = $item['user_defined_rep2'] ?? '';
        $item['user_defined_rep3'] = $item['user_defined_rep3'] ?? '';
        $item['user_defined_rep4'] = $item['user_defined_rep4'] ?? '';
        $item['user_defined_rep5'] = $item['user_defined_rep5'] ?? '';
        $item['user_defined_rep6'] = $item['user_defined_rep6'] ?? '';
        $item['user_defined_rep7'] = $item['user_defined_rep7'] ?? '';
        $item['user_defined_rep8'] = $item['user_defined_rep8'] ?? '';
        $item['user_defined_rep9'] = $item['user_defined_rep9'] ?? '';
        $item['user_defined_rep10'] = $item['user_defined_rep10'] ?? '';

        return $item;
    }
    public static function weighingAddData($dataSet, $companyId, $siteId, $workstationId)
    {
        if (empty($workstationId) || empty($siteId) || empty($companyId)) {
            return response()->json(['error' => "Please select Company, Site, and Workstation"], 400);
        }
        $dataSet["Settings"] = settings::select('id', 'name')->where('company_id', $companyId)->get();
        $dataSet["Weighbridges"] = WeighbridgeController::LoadData($companyId, $siteId, $workstationId);
        return $dataSet;
    }
    public function weighingAdd(): JsonResponse
    {
        $dataSet = [];
        $companyId = $_GET['company_id'] ?? "";
        $siteId = $_GET['site_id'] ?? "";
        $workstationId = $_GET['workstation_id'] ?? "";
        $dataSet = SettingsController::weighingAddData($dataSet, $companyId, $siteId, $workstationId);
        return response()->json(['data' => $dataSet], 200);
    }
    public static function weighingLoadData($dataSet, $companyId, $siteId, $workstationId, $weighbridgeId, $id)
    {
        if (empty($workstationId) || empty($siteId) || empty($companyId) || empty($id)) {
            return response()->json(['error' => "Please select Company, Site, and Workstation"], 400);
        }
        try {
            $dataSet["Setting"] = settings::findOrFail($id);
        } catch (ModelNotFoundException) {
            return response()->json(['error' => "Setting not found"], 404);
        }
        if ($dataSet["Setting"]->haulier == "Yes") {
            $dataSet["haulier"] = HaulierController::LoadData($companyId, $siteId);
        }
        if ($dataSet["Setting"]->tares_enabled == "true") {
            $dataSet["stored_tares"] = TareController::LoadData($companyId, $siteId);
        }
        if ($dataSet["Setting"]->business_partner == "Yes") {
            $dataSet["business_partner"] = BusinessPartnerController::LoadData($companyId, $siteId);
        }
        if ($dataSet["Setting"]->use_product_list == "Yes") {
            $dataSet["use_product_list"] = ProductController::LoadData($companyId);
        }
        if ($dataSet["Setting"]->use_cameras == "Yes") {
            $dataSet["use_cameras"] = CameraController::LoadData($companyId, $siteId, $workstationId, $weighbridgeId);
        }
        if ($dataSet["Setting"]->pallet_enabled == "true") {
            $dataSet["pallet_enabled"] = PalletController::LoadData($companyId, $siteId);
        }
        if ($dataSet["Setting"]->contract_enabled == "true") {
            $dataSet["contract_enabled"] = ContractsController::LoadData($companyId, $siteId);
        }
        return $dataSet;
    }
    public function weighingLoad(): JsonResponse
    {
        $dataSet = [];
        $companyId = $_GET['company_id'] ?? "";
        $siteId = $_GET['site_id'] ?? "";
        $workstationId = $_GET['workstation_id'] ?? "";
        $weighbridgeId = $_GET['weighbridge_id'] ?? "";
        $id = $_GET['settingId'] ?? "";
        $dataSet = SettingsController::weighingLoadData($dataSet, $companyId, $siteId, $workstationId, $weighbridgeId, $id);
        return response()->json(['data' => $dataSet], 200);
    }
}
