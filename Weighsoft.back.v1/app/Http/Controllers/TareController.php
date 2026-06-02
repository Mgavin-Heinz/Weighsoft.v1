<?php

namespace App\Http\Controllers;

use App\Models\Tare;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Log;
use Illuminate\Support\Carbon;


/**
 * @OA\Tag(
 *     name="Tare",
 *     description="API Endpoints for Tare"
 * )
 */

class TareController extends JwtAuthController
{
    private Tare $model;
    private string $modelName = "Tare";

    public function __construct() {
        parent::__construct();
        $this->model = new Tare();
    }
    public static function LoadData($companyId, $siteId)
    {
        $query = new Tare();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }
        if ($siteId != "") {
            $query = $query->where('site_id', '=', $siteId);
        }
        
        // CRITICAL FIX: Only return tares that haven't expired
        $query = $query->where('expiry_date', '>=', now()->toDateString());
        
        $data = $query->get();
        return $data;
    }
    /**
     * @OA\Get(
     *     path="/api/tare",
     *     tags={"Tare"},
     *     summary="Get all Tares",
     *     description="Returns all Tares from the database",
     *     @OA\Parameter(
     *         name="company_id",
     *         in="query",
     *         description="Filter by company_id",
     *         required=false,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="site_id",
     *         in="query",
     *         description="Filter by site_id",
     *         required=false,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Tare")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $companyId = "";
        $siteId = "";
        if (isset($_GET) && isset($_GET['company_id'])) {
            $companyId = $_GET['company_id'];
        }
        if (isset($_GET) && isset($_GET['site_id'])) {
            $siteId = $_GET['site_id'];
        }
        $data = $this->LoadData($companyId, $siteId);
        return response()->json($data);
    }

    /**
     * @OA\Post(
     *     path="/api/tare",
     *     tags={"Tare"},
     *     summary="Create a new Tare",
     *     description="Creates a new Tare in the database",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $data['expiry_date'] = Carbon::parse($data['expiry_date']);

        $tare = $this->model->create($data);

        return response()->json($tare);
    }

    /**
     * @OA\Get(
     *     path="/api/tare/{id}",
     *     tags={"Tare"},
     *     summary="Get a Tare by ID",
     *     description="Returns a Tare from the database by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID of the Tare to return",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tare not found"
     *     )
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $tare = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        return response()->json($tare);
    }

    /**
     * @OA\Put(
     *     path="/api/tare/{id}",
     *     tags={"Tare"},
     *     summary="Update a Tare by ID",
     *     description="Updates a Tare in the database by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID of the Tare to update",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tare not found"
     *     )
     * )
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $tare = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $data = $request->all();
        unset($data['token']);
        unset($data['updated_at']);
        $data['expiry_date'] = Carbon::parse($data['expiry_date'], 'utc');

        $tare->update($data);
        return response()->json($tare);
    }

    /**
     * @OA\Delete(
     *     path="/api/tare/{id}",
     *     tags={"Tare"},
     *     summary="Delete a Tare by ID",
     *     description="Deletes a Tare from the database by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID of the Tare to delete",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Tare")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tare not found"
     *     )
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $tare = $this->model->findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error("$this->modelName not found", 404);
        }

        $tare->delete();
        return response()->json($tare);
    }

    /**
     * @OA\Delete(
     *     path="/api/tare/{id}/deleteWithReason",
     *     tags={"Tare"},
     *     summary="Delete a Tare by ID with a reason",
     *     description="Deletes a Tare from the database by ID and sets a reason",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID of the Tare to delete",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(
     *                 property="reason",
     *                 type="string",
     *                 description="Reason for deleting the Tare"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="status",
     *                 type="boolean",
     *                 description="True if the Tare was deleted successfully"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tare not found"
     *     )
     * )
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function deleteWithReason(Request $request, int $id): JsonResponse
    {
        try {
            $contract = $this->model->findOrFail($id);
            $contract->update(['reason' => $request->all()['reason']]);
            $contract->delete();
            return response()->json(['status' => true]);
        } catch (ModelNotFoundException){
            return $this->error("$this->modelName not found", 404);
        }
    }
}
