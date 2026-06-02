<?php


namespace App\Http\Controllers;


use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Exceptions\UserNotDefinedException;

class JwtAuthController extends Controller
{
    protected $user;

    protected function __construct() {
        $this->middleware('auth:api');
        try {
            $this->user = auth()->user();
            if (!$this->user) {
                return response('Not Found', 404);
            }
        } catch (Exception $e) {
            //Log::error($e);
            return response('Token Error', 401);
        }
        return null;
    }

    protected function error(string $message, int $code): JsonResponse
    {
        return response()->json(['status' => false, 'message' => $message], $code);
    }
}
