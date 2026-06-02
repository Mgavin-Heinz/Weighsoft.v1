<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NumberplateRecognitionService
{
    private const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
    private const MAX_DECODED_SIZE_BYTES = 10485760; // 10MB
    private const REQUEST_TIMEOUT_SECONDS = 30;

    /**
     * Recognize license plate from base64-encoded image using OpenAI Vision API.
     * Returns associative array: success => ['plate_number' => string], failure => ['success' => false, 'error' => string].
     *
     * @param string $base64Image Raw base64 image string (no data URL prefix).
     * @return array{plate_number?: string, success?: bool, error?: string}
     */
    public function recognizeFromBase64(string $base64Image): array
    {
        $apiKey = config('services.openai.api_key');
        if (empty($apiKey)) {
            Log::warning('Numberplate recognition attempted but OPENAI_API_KEY is not set');
            return ['success' => false, 'error' => 'Numberplate recognition is not configured.'];
        }

        $decoded = base64_decode($base64Image, true);
        if ($decoded === false) {
            Log::warning('Numberplate recognition: invalid base64 image');
            return ['success' => false, 'error' => 'Invalid image data.'];
        }
        if (strlen($decoded) > self::MAX_DECODED_SIZE_BYTES) {
            Log::warning('Numberplate recognition: image too large', ['size' => strlen($decoded)]);
            return ['success' => false, 'error' => 'Image too large.'];
        }

        $prompt = $this->getRecognitionPrompt();
        $body = [
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $prompt],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => 'data:image/jpeg;base64,' . $base64Image,
                                'detail' => 'high',
                            ],
                        ],
                    ],
                ],
            ],
            'max_tokens' => 1500,
            'temperature' => 0.1,
            'response_format' => ['type' => 'json_object'],
        ];

        try {
            $response = Http::withToken($apiKey)
                ->timeout(self::REQUEST_TIMEOUT_SECONDS)
                ->post(self::OPENAI_URL, $body);

            if (!$response->successful()) {
                $status = $response->status();
                $body = $response->json();
                $message = $body['error']['message'] ?? $response->body();
                Log::warning('Numberplate recognition OpenAI API error', [
                    'status' => $status,
                    'message' => is_string($message) ? $message : json_encode($message),
                ]);
                return [
                    'success' => false,
                    'error' => $status === 429 ? 'Rate limit exceeded. Please try again shortly.' : 'Recognition failed.',
                ];
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? null;
            if (empty($content)) {
                Log::warning('Numberplate recognition: empty OpenAI response');
                return ['success' => false, 'error' => 'No response from recognition service.'];
            }

            $parsed = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($parsed)) {
                Log::warning('Numberplate recognition: invalid JSON from OpenAI');
                return ['success' => false, 'error' => 'Invalid response from recognition service.'];
            }

            $success = (bool) ($parsed['success'] ?? false);
            $platesFound = (int) ($parsed['plates_found'] ?? 0);
            $plates = $parsed['plates'] ?? [];

            if (!$success || $platesFound < 1 || empty($plates)) {
                Log::info('Numberplate recognition: no plate found in image');
                return ['success' => false, 'error' => 'Numberplate not recognized'];
            }

            $plateNumber = trim((string) ($plates[0]['plate_number'] ?? ''));
            if ($plateNumber === '') {
                Log::info('Numberplate recognition: plate number empty');
                return ['success' => false, 'error' => 'Numberplate not recognized'];
            }

            Log::info('Numberplate recognition: success');
            return ['plate_number' => $plateNumber];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Numberplate recognition: connection or timeout', ['message' => $e->getMessage()]);
            return ['success' => false, 'error' => 'Recognition request timed out or failed.'];
        } catch (\Throwable $e) {
            Log::warning('Numberplate recognition: unexpected error', ['message' => $e->getMessage()]);
            return ['success' => false, 'error' => 'Recognition failed.'];
        }
    }

    private function getRecognitionPrompt(): string
    {
        return <<<'PROMPT'
You are an expert license plate recognition system. Your task is to accurately read and extract license plate numbers from vehicle images with maximum precision.

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Read each character on the license plate CAREFULLY and INDIVIDUALLY, one at a time
2. Pay EXTREME attention to similar-looking characters:
   - 0 (zero) vs O (letter O) - zeros are rounder, O's are more oval
   - 1 (one) vs I (letter I) vs l (lowercase L) - check the shape carefully
   - 5 vs S - 5 has straight lines, S is curved
   - 8 vs B - 8 has two circles, B has a straight line on left
   - 2 vs Z - check the angles and curves
   - 4 vs A - check the shape
3. Preserve EXACT spacing, hyphens, dashes, and formatting as they appear on the plate
4. Read from left to right, character by character, slowly and methodically
5. If any character is unclear or ambiguous, note it in the confidence level
6. Verify the plate number by reading it multiple times before finalizing
7. Look at the ENTIRE plate context - sometimes surrounding characters help identify ambiguous ones

STEP-BY-STEP ANALYSIS PROCESS (FOLLOW CAREFULLY):
1. First, locate all license plates in the image (front, rear, or both)
2. For each plate found, perform this detailed analysis:
   a. Identify the plate's position and orientation
   b. Examine the plate area carefully - note the background color, border, any country/region indicators
   c. Count the total number of characters and spaces
   d. Read each character individually from left to right
   e. Build the complete sequence character by character
   f. Read the entire plate number back and verify each character
   g. Check for any formatting (spaces, hyphens, dashes, etc.) - preserve exactly as shown
3. Double-check your reading by examining the plate one more time, character by character
4. If uncertain about any character, mark confidence as "medium" or "low" accordingly

Please provide a detailed analysis in the following JSON format:
{
    "success": true/false,
    "plates_found": number,
    "plates": [
        {
            "plate_number": "exact plate number as read, preserving all spaces, hyphens, and characters",
            "confidence": "high/medium/low"
        }
    ]
}

If no license plate is found, set "success" to false and "plates_found" to 0.
If a license plate is found, extract the plate number with MAXIMUM ACCURACY - read each character carefully.
Only return valid JSON, no additional text or markdown formatting.
PROMPT;
    }
}
