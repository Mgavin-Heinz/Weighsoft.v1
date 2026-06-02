<?php

namespace App\Http\Controllers;

use App\Models\BusinessPartner;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class BusinessPartnerController extends JwtAuthController
{
    private BusinessPartner $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new BusinessPartner();
    }
    static function tryGetValue($array, $key) {
        try {
            return (array_key_exists($key, $array)) ? $array[$key] : NULL;
        } catch (\Throwable $th) {
           Log::error($th->getMessage());
           return NULL;
        }
    }
    public static function LoadData($companyId, $siteId)
    {
        $query = new BusinessPartner();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }
        if ($siteId != "") {
            $query = $query->where('site_id', '=', $siteId);
        }

        $data = $query->orderBy('code')->get();

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn($item) => $item['company_id'], $data->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        foreach ($data as $businessPartner) {
            $company = BusinessPartnerController::tryGetValue($companyDict, $businessPartner->company_id);
            $businessPartner->company = ($company == null ? null : $company->registered_name);
            $businessPartner['displayName'] = e($businessPartner->name) . ' (' . e($businessPartner->code) . ')';
            $businessPartner['report'] = e($businessPartner->name) . ' (' . e($businessPartner->code) . ')';
        }
        return $data;
    }
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     *
     * @SWG\Get(
     *     path="/api/businesspartner",
     *     description="Returns dashboard overview.",
     *     operationId="api.businesspartner.index",
     *     produces={"application/json"},
     *     tags={"businesspartner"},
     *     @SWG\Response(
     *         response=200,
     *         description="Business Partner overview."
     *     ),
     *     @SWG\Response(
     *         response=401,
     *         description="Unauthorized action.",
     *     )
     * )
     */
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
        try {
            $data = $this->LoadData($companyId, $siteId);
            return response()->json($data);
        } catch (\Throwable $th) {
            return response()->json(["error" => $th->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {

        $businessPartner = $this->model->create($request->all());

        return response()->json($businessPartner);
    }

    public function destroy($id): Response|JsonResponse
    {
        $item = $this->model->find($id);

        if (!$item) {
            return response()->json([], 404);
        }

        $item->delete();
        return response()->json(['success' => true]);
    }

    public function show($id): JsonResponse|Response
    {
        $businessPartner = $this->model->find($id);

        if (!$businessPartner)
            return response("", 404);

        // Load company to check if smart_hauliers is enabled
        $company = Company::find($businessPartner->company_id);
        $businessPartner->company_smart_hauliers = $company ? $company->smart_hauliers : false;

        // If smart_hauliers is enabled, load linked hauliers
        if ($businessPartner->company_smart_hauliers) {
            $hauliers = $businessPartner->hauliers()
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'business_partner_id']);
            
            // Format hauliers for display
            $businessPartner->linked_hauliers = $hauliers->map(function($haulier) {
                return [
                    'id' => $haulier->id,
                    'code' => $haulier->code,
                    'name' => $haulier->name,
                    'displayName' => $haulier->name . ' (' . $haulier->code . ')',
                ];
            });
        } else {
            $businessPartner->linked_hauliers = [];
        }

        return response()->json($businessPartner);
    }

    public function update($id, Request $request): Response|JsonResponse
    {
        $businessPartner = $this->model->find($id);

        if (!$businessPartner) {
            return response("", 404);
        }
        $item = $request->all();
        $item = $this->setDefaults($item);

        $businessPartner->update($item);

        return response()->json($businessPartner);
    }

    private function setDefaults($item)
    {
        if (!isset($item['code']) || empty($item['code']))
            $item['code'] = '';
        //        if (!isset($item['code']) || empty($item['va']))
//            $item['code'] = '';

        return $item;
    }
}
