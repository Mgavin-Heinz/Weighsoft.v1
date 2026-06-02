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

    public function __construct() {
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
            ->whereIn('id', array_unique(array_map(fn($item) => $item['company_id'], $data->toArray())))
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
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $companyId = "";
        if (isset($_GET) && isset($_GET['company_id'])) {
            $companyId = $_GET['company_id'];
        }

        $data = $this->LoadData($companyId);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $product = $this->model->create($request->all());

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

    public function show($id): JsonResponse
    {
        try {
            $product = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($product);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        try {
            $product = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $product->update($request->all());
        return response()->json($product);
    }
}
