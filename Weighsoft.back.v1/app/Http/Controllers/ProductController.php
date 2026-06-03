<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends JwtAuthController
{
    private Product $model;
    private string $modelName;

    public function __construct()
    {
        parent::__construct();
        $this->model = new Product();
        $this->modelName = "Product";
    }

    public static function LoadData($companyId)
    {
        $query = new Product();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }

        $data = $query->orderBy('code')->get();

        $companies = (new Company())
            ->whereIn('id', array_unique(array_map(fn ($item) => $item['company_id'], $data->toArray())))
            ->get(['id', 'registered_name']);
        $companyDict = array();
        foreach ($companies as $company) {
            $companyDict[$company->id] = $company;
        }

        foreach ($data as $product) {
            $company = $companyDict[$product->company_id];
            $product->company = ($company == null ? null : $company->registered_name);

            $product["displayName"] = $product->name . "(" . $product->code . ")";
            $product["report"] = $product->code . "<br>" . $product->name . "<br>";
        }
        return $data;
    }

    // Fix: inject Request and use $request->query() instead of $_GET
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->query('company_id', '');
        $data = $this->LoadData($companyId);
        return response()->json($data);
    }

    // Fix: validate input before creating
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|max:50',
            'name'       => 'required|string|max:100',
            'company_id' => 'required|integer|exists:companies,id',
        ]);

        $product = $this->model->create($data);
        return response()->json($product, 201);
    }

    public function show($id): JsonResponse
    {
        try {
            $product = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($product);
    }

    // Fix: correct parameter order (Request first, then $id)
    // Fix: validate input before updating
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $product = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $data = $request->validate([
            'code'       => 'sometimes|string|max:50',
            'name'       => 'sometimes|string|max:100',
            'company_id' => 'sometimes|integer|exists:companies,id',
        ]);

        $product->update($data);
        return response()->json($product);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $product = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $product->delete();
        return response()->json($product);
    }
}
