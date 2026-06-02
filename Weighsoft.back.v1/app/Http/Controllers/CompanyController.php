<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Site;
use App\Models\User;
use App\Models\WorkStations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends JwtAuthController
{
    private Company $model;

    public function __construct() {
        parent::__construct();
        $this->model = new Company();
    }

    public function index(): JsonResponse
    {
        $companyId = $this->user->company_id;
        if (!$companyId || ($this->user->role_id == 1) || ($this->user->role_id == 2)) {
            $companies = $this->model::all();
        } else {
            $companies = [Company::find($companyId)];
        }
        return response()->json($companies);
    }

    public function store(Request $request): JsonResponse
    {
        $item = $request->all();
        $validator = Validator::make($item, [
            'code' =>  'required',
            'registered_name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        if (!isset($item['tel'])) {
            $item['tel'] = '';
        }
        if (!isset($item['fax'])) {
            $item['fax'] = '';
        }
        if (!isset($item['email'])) {
            $item['email'] = '';
        }
        if (!isset($item['registration_number'])) {
            $item['registration_number'] = '';
        }
        if (!isset($item['vat_nr'])) {
            $item['vat_nr'] = '';
        }
        if (!isset($item['contact_person'])) {
            $item['contact_person'] = '';
        }
        if (!isset($item['cell'])) {
            $item['cell'] = '';
        }
        if (!isset($item['street'])) {
            $item['street'] = '';
        }
        if (!isset($item['suburb1'])) {
            $item['suburb1'] = '';
        }
        if (!isset($item['city1'])) {
            $item['city1'] = '';
        }
        if (!isset($item['postal_code1'])) {
            $item['postal_code1'] = '';
        }
        if (!isset($item['po_box'])) {
            $item['po_box'] = '';
        }
        if (!isset($item['suburb2'])) {
            $item['suburb2'] = '';
        }
        if (!isset($item['city2'])) {
            $item['city2'] = '';
        }
        if (!isset($item['postal_code2'])) {
            $item['postal_code2'] = '';
        }
        if (!isset($item['display_custom_logo_img'])) {
            $item['display_custom_logo_img'] = '';
        }
        if (!isset($item['smart_hauliers'])) {
            $item['smart_hauliers'] = 0;
        }

        $company = $this->model->create($item);
        return response()->json($company);
    }

    public function show($id): JsonResponse
    {
        $company = $this->model->find($id);
        if (!$company) {
            return response()->json([
                'message' => 'Invalid company ID.',
            ], 404);
        }

        $sites = Site::where('company_id', $company->id)->get();
        foreach ($sites as $site) {
            $workstations = WorkStations::where('site_id', $site->id)->get();

            $site->point = $workstations;
            $site->workstationList = $workstations->implode('workstation_name', ', ');
        }
        $company->site = $sites;

        $users = User::where('company_id', $company->id)->get();
        $company->user = $users;

        return response()->json($company);
    }
    
    public function updateLogoImage(Request $request)
    {
        Log::info("Starting updateLogoImage");
        $image = $request->file;
        $id = $request->input('id');
        $option = $request->input('option');

        if ($image) {
            $base64Image = base64_encode(file_get_contents($image));

            $company = $this->model->find($id);

            if (!$company) {
                return response()->json(['message' => 'Company not found'], 404);
            }
            if ($option == 'logo')
                $company->display_custom_logo_img = $base64Image;
            $company->save();

            return response()->json(['message' => $base64Image], 200);
        } else {
            return response()->json(['message' => 'Image not found'], 400);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = $request->all();
        $validator = Validator::make($item, [
            'code' =>  'required',
            'registered_name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $company = $this->model->find($id);
        if (!$company) {
            return response()->json(['status' => false, 'message' => 'Company ID not found'], 404);
        }

        $item = $request->all();
        $item['tel'] = $item['tel'] ?: '';
        $item['fax'] = $item['fax'] ?: '';
        $item['email'] = $item['email'] ?: '';
        $item['registration_number'] = $item['registration_number'] ?: '';
        $item['vat_nr'] = $item['vat_nr'] ?: '';
        $item['contact_person'] = $item['contact_person'] ?: '';
        $item['cell'] = $item['cell'] ?: '';
        $item['street'] = $item['street'] ?: '';
        $item['suburb1'] = $item['suburb1'] ?: '';
        $item['city1'] = $item['city1'] ?: '';
        $item['postal_code1'] = $item['postal_code1'] ?: '';
        $item['po_box'] = $item['po_box'] ?: '';
        $item['suburb2'] = $item['suburb2'] ?: '';
        $item['city2'] = $item['city2'] ?: '';
        $item['postal_code2'] = $item['postal_code2'] ?: '';
        $item['display_custom_logo_img'] = $item['display_custom_logo_img'] ?: '';
        $item['smart_hauliers'] = $item['smart_hauliers'] ?? 0;

        $company->update($item);

        return response()->json($company);
    }

    public function destroy($id): JsonResponse
    {
        $item = $this->model->find($id);

        if (!$item) {
            return response()->json(['status' => false, 'message' => 'Company ID not found'], 404);
        }

        $item->delete();
        return response()->json([
            'status' => true,
        ]);
    }
}
