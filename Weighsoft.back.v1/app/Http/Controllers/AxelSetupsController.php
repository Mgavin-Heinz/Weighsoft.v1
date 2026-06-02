<?php

namespace App\Http\Controllers;

use App\Models\AxelSetups;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AxelSetupsController extends JwtAuthController
{
    private $fillable, $model;

    public function __construct() {
        parent::__construct();
        $this->model = new AxelSetups();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        Log::info("AxelSetupsController");
        $query = $this->model;
        if (isset($_GET) && isset($_GET['company'])) {
            $query = $query->where('company_id', '=', $_GET['company']);
        }
        if (isset($_GET) && isset($_GET['company_id'])) {
            $query = $query->where('company_id', '=', $_GET['company_id']);
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
            return response()->json([], 404);

        return response()->json($item);
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
        $item = $this->model->find('id', $id);

        if (!$item) {
            return response()->json([], 404);
        }
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
        $item = $this->model->find($id);
        if (!$item)
            return response()->json([], 404);
        $item->delete();
        return response()->json($this->model);
    }
}
