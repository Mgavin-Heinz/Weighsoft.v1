<?php

namespace App\Http\Controllers;

use App\Services\NumberplateRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NumberplateRecognitionController extends JwtAuthController
{
    private NumberplateRecognitionService $lprService;

    public function __construct()
    {
        parent::__construct();
        $this->lprService = new NumberplateRecognitionService();
    }

    /**
     * Recognize license plate from base64 image. Expects JSON body with imageBase64 (raw base64) or imageDataUrl (data URL).
     */
    public function recognize(Request $request): JsonResponse
    {
        $apiKey = config('services.openai.api_key');
        if (empty($apiKey)) {
            return response()->json(
                ['success' => false, 'error' => 'Numberplate recognition is not configured.'],
                503
            );
        }

        $validator = Validator::make($request->all(), [
            'imageBase64' => 'string',
            'imageDataUrl' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(
                ['success' => false, 'error' => 'Invalid request.'],
                400
            );
        }

        $base64 = $request->input('imageBase64');
        $dataUrl = $request->input('imageDataUrl');

        if (!empty($base64)) {
            $rawBase64 = $base64;
        } elseif (!empty($dataUrl) && preg_match('/^data:image\/[^;]+;base64,(.+)$/s', $dataUrl, $m)) {
            $rawBase64 = $m[1];
        } else {
            return response()->json(
                ['success' => false, 'error' => 'Missing image. Send imageBase64 or imageDataUrl.'],
                400
            );
        }

        $result = $this->lprService->recognizeFromBase64($rawBase64);

        if (isset($result['plate_number'])) {
            return response()->json(['plate_number' => $result['plate_number']]);
        }

        $error = $result['error'] ?? 'Numberplate not recognized';
        return response()->json(['success' => false, 'error' => $error], 422);
    }
}
