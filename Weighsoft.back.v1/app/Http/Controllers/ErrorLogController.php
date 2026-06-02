<?php

namespace App\Http\Controllers;

use App\Models\ErrorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ErrorLogController extends JwtAuthController
{
    private ErrorLog $model;
    private string $modelName;

    public function __construct() {
        parent::__construct();
        $this->model = new ErrorLog();
        $this->modelName = "ErrorLog";
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        if (isset($_GET) && isset($_GET['company_id'])) {
            $this->model = $this->model->where('company_id', '=', $_GET['company_id']);
        }
        if (isset($_GET) && isset($_GET['site_id'])) {
            $this->model = $this->model->where('site_id', '=', $_GET['site_id']);
        }
        if (isset($_GET) && isset($_GET['workstation_id'])) {
            $this->model = $this->model->where('workstation_id', '=', $_GET['workstation_id']);
        }
        if (isset($_GET) && isset($_GET['weighbridge_id'])) {
            $this->model = $this->model->where('weighbridge_id', '=', $_GET['weighbridge_id']);
        }
        $this->model = $this->model->get();

        return response()->json($this->model);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $this->model = $this->model->create($request->all());

        return response()->json($this->model);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->model->where('id', '=', $id)->first();

        if (!$item)
            return $this->error("$this->modelName not found", 404);

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
            return $this->error("$this->modelName not found", 404);

        $item->update($request->all());
        return response()->json($this->model);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $item = $this->model->first($id);
        if (!$item)
            return $this->error("$this->modelName not found", 404);

        $item->delete();
        return response()->json($this->model);
    }
}
