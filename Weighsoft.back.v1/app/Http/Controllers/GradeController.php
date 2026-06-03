<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Grade;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends JwtAuthController
{
    private Grade $model;
    private string $modelName;

    public function __construct()
    {
        parent::__construct();
        $this->model = new Grade();
        $this->modelName = 'Grade';
    }

    // Fix: inject Request and use $request->query() instead of $_GET
    // Fix: call ->get() before ->toArray() so $grades is a collection, not a builder
    // Fix: look up $grade->company_id in the dict, not $grade->id
    public function index(Request $request): JsonResponse
    {
        $companyFilter = $request->query('company', '');

        if ($companyFilter !== '') {
            $grades = Grade::where('company_type', '=', $companyFilter)->get();
        } else {
            $grades = $this->model->get();
        }

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn ($item) => $item->company_id, $grades->toArray())))
            ->get(['id', 'registered_name']);

        $companyDict = [];
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        foreach ($grades as $grade) {
            $company = $companyDict[$grade->company_id] ?? null;
            $grade->company = ($company === null ? null : $company->registered_name);
        }

        return response()->json($grades);
    }

    // Fix: validate input before creating
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        $grade = $this->model->create($data);
        return response()->json($grade, 201);
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

    // Fix: correct parameter order (Request first, then $id)
    // Fix: validate input before updating
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $grade = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $data = $request->validate([
            'name'       => 'sometimes|string|max:100',
            'company_id' => 'sometimes|integer|exists:companies,id',
        ]);

        $grade->update($data);
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
}
