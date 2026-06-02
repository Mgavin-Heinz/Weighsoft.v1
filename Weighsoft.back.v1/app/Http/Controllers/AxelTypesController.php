<?php

namespace App\Http\Controllers;

use App\Models\AxelTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AxelTypesController extends JwtAuthController
{
    private AxelTypes $model;

    public function __construct() {
        parent::__construct();
        $this->model = new AxelTypes();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $query = $this->model;
        if (isset($_GET) && isset($_GET['company'])) {
            $query = $this->model->where('company_id', '=', $_GET['company']);
        }
        if (isset($_GET) && isset($_GET['company_id'])) {
            $query = $this->model->where('company_id', '=', $_GET['company_id']);
        }

        $data = $query->get();

        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $item = $this->model->create($data);

        return response()->json($item);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->model->find($id);

        if (!$item)
            return response()->json([],404);

        return response()->json($this->model);
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
        $item = $this->model->find($id);
        if (!$item)
            return response()->json([], 404);
        $item->update($request->all());

        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $item = AxelTypes::find($id);

        if (!$item) {
            return response()->json([], 404);
        }

        $item->delete();

        return response()->json($item);
    }
}
