<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Grade;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lcobucci\JWT\Token;

class GradeController extends JwtAuthController
{

    private Grade $model;
    private string $modelName;

    public function __construct() {
        parent::__construct();
        $this->model = new Grade();
        $this->modelName = 'Grade';
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $grades = $this->model;
        if (isset($_GET) && isset($_GET['company'])) {
            $grades = Grade::where('company_type', '=', $_GET['company'])->get();
        }
        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn($item) => $item->company_id, $grades->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }
        foreach ($grades as $grade) {
            $company = $companyDict[$grade->id];
            $grade->company = ($company == null ? null : $company->registered_name);
        }
        return response()->json($grades);
    }

    public function store(Request $request): JsonResponse
    {

        $grade = $this->model->create($request->all());

        return response()->json($grade);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $grade = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $grade->delete();
        return response()->json($grade);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $grade = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($grade);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        try {
            $grade = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $grade->update($request->all());
        return response()->json($grade);
    }

}
