<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Site;
use App\Models\User;
use App\Models\UserType;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use ErrorException;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserController extends JwtAuthController
{
    private User $model;
    private string $modelName = "User";

    public function __construct()
    {
        parent::__construct();
        $this->model = new User();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $UserRole = $this->user->role_id;
        $UserCompany = $this->user->company_id;
        $UserSite = $this->user->site_id;
        $UserWorkstations = $this->user->workstations_id;
        //$users = User::all();
        $users = $this->model;
        //$users = $users->select('id','firstname','lastname','contact_num','email','role_id','site_id','workstations_id','company_id');
        if ($UserCompany != null) {
            $users = $users->where('company_id', $UserCompany);
        }
        if ($UserSite != null) {
            $users = $users->where('site_id', $UserSite);
        }
        if ($UserWorkstations != null) {
            $users = $users->where('workstations_id', $UserWorkstations);
        }
        $users = $users->get();
        foreach ($users as $user) {
            if ($user->role_id == null) {
                $user->role = null;
            } else {
                $usertype = UserType::where('id', $user->role_id)->first();
                $user->role = ($usertype == null ? null : $usertype->usertypes);
            }
        }
        foreach ($users as $user) {
            if ($user->company_id == null) {
                $user->company = null;
            } else {
                $company = Company::where('id', $user->company_id)->first();
                $user->company = ($company == null ? null : $company->registered_name);
            }
        }
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'role_id' =>  'required',
            'firstname' => 'required',
            'lastname' => 'required',
            'fingerprint' => 'required',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            if (!isset($data['company_id']) || empty($data['company_id'])) {
                $data['company_id'] = NULL;
            }
            if (!isset($data['site_id']) || empty($data['site_id'])) {
                $data['site_id'] = NULL;
            }
            if (!isset($data['workstations_id']) || empty($data['workstations_id'])) {
                $data['workstations_id'] = NULL;
            }

            $data['password'] = Hash::make($data['password']);
            $user = $this->model->create($data);
            return response()->json($user);
        } catch (Exception $e) {
             //Log::error($e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->model->select('id', 'firstname', 'lastname', 'contact_num', 'email', 'role_id', 'site_id', 'workstations_id', 'company_id')->where('id', '=', $id)->first();

        if (!$user) {
            return $this->error("$this->modelName not found", 404);
        }

        $companies = new Company();
        $companyId = $user->company_id;
        $siteId = $user->site_id;
        $workstationId = $user->workstations_id;
        $user->Log = "CompanyId show = $companyId,";
        if (!$companyId) {
            $user->companies = $companies->get();
        } else {
            $user->companies = $companies->where('id', $companyId)->get();
        }
        foreach ($user->companies as $company) {
            if (!$siteId) {
                $sites = Site::where('company_id', $company->id)->get();
            } else {
                $sites = [Site::find($siteId)];
            }
            $user->Log .= "CompanyId = $company->id,";
            $company->sites = $sites;
            foreach ($company->sites as $site) {

                $user->Log .= "site_id = $site->id,";
                if (!$workstationId) {
                    $Workstation = WorkStations::where('site_id', $site->id)->get();
                } else {
                    $Workstation = [WorkStations::find($workstationId)];
                }
                $site->workstations = $Workstation;
                foreach ($site->workstations as $workstation) {
                    $Weighbridge = Weighbridge::where('workstation_id', $workstation->id)->get();
                    $workstation->weighbridges = $Weighbridge;
                }
            }
        }

        return response()->json($user);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'role_id' =>  'required',
            'firstname' => 'required',
            'lastname' => 'required',
            'fingerprint' => 'required',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $user = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $user->update($request->all());
        $pass = $user->password;
        $user->password = $user->password == "" ? $pass : Hash::make($user->password);
        $user->update();
        return response()->json($user);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $user = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $user->delete();
        return response()->json($user);
    }
}
