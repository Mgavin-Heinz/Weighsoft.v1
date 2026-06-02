<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserTypeController extends JwtAuthController
{
    private UserType $model;
    private string $modelName = "UserType";

    public function __construct() {
        parent::__construct();
        $this->model = new UserType();
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $userRole = $this->model->find($this->user->role_id);
        $level = $userRole["level"];
        $userTypes = $this->model->where('level', '<=', $level)->get();

        return response()->json($userTypes);
    }

    public function store(Request $request): JsonResponse
    {

        $userTypes = $this->model->create($request->all());

        return response()->json($userTypes);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $userType = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $userType->delete();
        return response()->json($userType);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $userType = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($userType);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        try {
            $userType = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $userType->update($request->all());
        return response()->json($userType);
    }}
