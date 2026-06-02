<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * ESP32 Relay Control Proxy Controller
 * 
 * Proxies relay control requests from the frontend to ESP32 devices.
 * Uses JWT authentication with the ESP8266React framework.
 * Solves CORS issues and provides centralized logging.
 */
class ESP32RelayController extends JwtAuthController
{
    /**
     * ESP32 device credentials
     */
    private const ESP32_USERNAME = 'admin';
    private const ESP32_PASSWORD = 'admin';
    
    /**
     * JWT token cache TTL (in seconds) - 1 hour
     */
    private const TOKEN_CACHE_TTL = 3600;

    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Authenticate with ESP32 device and get JWT token
     * 
     * @param string $ip ESP32 device IP address
     * @return string|null JWT token or null on failure
     */
    private function getJwtToken(string $ip): ?string
    {
        // Check if we have a cached token for this device
        $cacheKey = "esp32_jwt_token_{$ip}";
        $cachedToken = Cache::get($cacheKey);
        
        if ($cachedToken) {
            Log::debug('[ESP32 JWT] Using cached token', ['ip' => $ip]);
            return $cachedToken;
        }

        // Authenticate with the device to get a new token
        $signInUrl = "http://{$ip}/rest/signIn";
        
        try {
            Log::info('[ESP32 JWT] Authenticating to get token', [
                'ip' => $ip,
                'url' => $signInUrl
            ]);

            $response = Http::timeout(5)->post($signInUrl, [
                'username' => self::ESP32_USERNAME,
                'password' => self::ESP32_PASSWORD
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['access_token'] ?? null;
                
                if ($token) {
                    // Cache the token for future requests
                    Cache::put($cacheKey, $token, self::TOKEN_CACHE_TTL);
                    
                    Log::info('[ESP32 JWT] Authentication successful, token cached', [
                        'ip' => $ip,
                        'token_length' => strlen($token)
                    ]);
                    
                    return $token;
                } else {
                    Log::error('[ESP32 JWT] No access_token in response', [
                        'ip' => $ip,
                        'response' => $data
                    ]);
                }
            } else {
                Log::error('[ESP32 JWT] Authentication failed', [
                    'ip' => $ip,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[ESP32 JWT] Connection failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);
            throw new \Exception('Connection timed out - ESP32 device not reachable');
        } catch (\Exception $e) {
            Log::error('[ESP32 JWT] Authentication error', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        return null;
    }

    /**
     * Make an authenticated request to ESP32 device
     * 
     * @param string $method HTTP method (GET, POST, etc.)
     * @param string $url Full URL to request
     * @param array $data Request payload (for POST requests)
     * @return \Illuminate\Http\Client\Response
     * @throws \Exception If authentication fails
     */
    private function makeAuthenticatedRequest(string $method, string $url, array $data = [])
    {
        // Extract IP from URL for token lookup
        preg_match('/http:\/\/([^\/]+)\//', $url, $matches);
        $ip = $matches[1] ?? null;
        
        if (!$ip) {
            throw new \Exception('Could not extract IP from URL');
        }

        // Get JWT token
        $token = $this->getJwtToken($ip);
        
        if (!$token) {
            throw new \Exception('Failed to authenticate with ESP32 device');
        }

        // Make request with Bearer token
        $request = Http::withToken($token)->timeout(5);
        
        if (strtoupper($method) === 'POST') {
            return $request->post($url, $data);
        } else {
            return $request->get($url);
        }
    }

    /**
     * Control a specific relay on an ESP32 device
     * 
     * POST /api/esp32/relay
     * Body: {
     *   "ip": "192.168.1.100",
     *   "relay_number": 1,
     *   "state": true
     * }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function controlRelay(Request $request): JsonResponse
    {
        Log::info('[ESP32 Relay] controlRelay method called', [
            'user' => $this->user ? $this->user->id : 'NULL',
            'request_data' => $request->all()
        ]);
        
        $ip = $request->input('ip');
        $relayNumber = $request->input('relay_number');
        $state = $request->input('state');

        // Validate inputs
        if (!$ip || !$relayNumber) {
            return response()->json([
                'error' => 'IP address and relay number are required'
            ], 400);
        }

        if ($relayNumber < 1 || $relayNumber > 8) {
            return response()->json([
                'error' => 'Relay number must be between 1 and 8'
            ], 400);
        }

        if (!is_bool($state)) {
            return response()->json([
                'error' => 'State must be a boolean (true/false)'
            ], 400);
        }

        // Build the payload for ESP32
        $relayKey = "relay{$relayNumber}";
        $payload = [
            $relayKey => $state
        ];

        // Build the ESP32 URL
        $url = "http://{$ip}/rest/relayState";

        try {
            Log::info('[ESP32 Relay] Control request', [
                'user_id' => $this->user->id ?? 'unknown',
                'ip' => $ip,
                'relay_number' => $relayNumber,
                'state' => $state ? 'ON' : 'OFF',
                'url' => $url,
                'payload' => $payload
            ]);

            // Make authenticated request using JWT token
            $response = $this->makeAuthenticatedRequest('POST', $url, $payload);

            if ($response->successful()) {
                Log::info('[ESP32 Relay] Control successful', [
                    'ip' => $ip,
                    'relay_number' => $relayNumber,
                    'response' => $response->json()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Relay {$relayNumber} set to " . ($state ? 'ON' : 'OFF'),
                    'data' => $response->json()
                ]);
            } else {
                Log::error('[ESP32 Relay] Control failed', [
                    'ip' => $ip,
                    'relay_number' => $relayNumber,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return response()->json([
                    'error' => 'ESP32 device returned error',
                    'status' => $response->status(),
                    'details' => $response->body()
                ], $response->status());
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[ESP32 Relay] Connection failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to connect to ESP32 device',
                'message' => 'Device may be offline or unreachable',
                'ip' => $ip
            ], 503);
        } catch (\Exception $e) {
            // Check if this is a timeout or connection issue (should be 503)
            if (strpos($e->getMessage(), 'timed out') !== false || 
                strpos($e->getMessage(), 'Connection') !== false ||
                strpos($e->getMessage(), 'not reachable') !== false) {
                Log::error('[ESP32 Relay] Connection timeout', [
                    'ip' => $ip,
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'error' => 'ESP32 device not reachable',
                    'message' => 'Connection timed out. Check if device is online and network is accessible.',
                    'ip' => $ip
                ], 503);
            }
            
            // Check if this is an authentication failure (also 503 - service unavailable)
            if (strpos($e->getMessage(), 'authenticate') !== false) {
                Log::error('[ESP32 Relay] ESP32 authentication failed', [
                    'ip' => $ip,
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'error' => 'ESP32 device authentication failed',
                    'message' => 'Could not authenticate with ESP32 device. Service unavailable.',
                    'ip' => $ip
                ], 503);
            }

            Log::error('[ESP32 Relay] Unexpected error', [
                'ip' => $ip,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current state of all relays from an ESP32 device
     * 
     * GET /api/esp32/relay?ip=192.168.1.100
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRelayStates(Request $request): JsonResponse
    {
        $ip = $request->query('ip');

        if (!$ip) {
            return response()->json([
                'error' => 'IP address is required'
            ], 400);
        }

        $url = "http://{$ip}/rest/relayState";

        try {
            Log::info('[ESP32 Relay] Get states request', [
                'user_id' => $this->user->id ?? 'unknown',
                'ip' => $ip,
                'url' => $url
            ]);

            // Make authenticated request using JWT token
            $response = $this->makeAuthenticatedRequest('GET', $url);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json()
                ]);
            } else {
                Log::error('[ESP32 Relay] Get states failed', [
                    'ip' => $ip,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return response()->json([
                    'error' => 'ESP32 device returned error',
                    'status' => $response->status()
                ], $response->status());
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[ESP32 Relay] Connection failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to connect to ESP32 device',
                'message' => 'Device may be offline or unreachable',
                'ip' => $ip
            ], 503);
        } catch (\Exception $e) {
            // Check if this is a timeout or connection issue (should be 503)
            if (strpos($e->getMessage(), 'timed out') !== false || 
                strpos($e->getMessage(), 'Connection') !== false ||
                strpos($e->getMessage(), 'not reachable') !== false) {
                Log::error('[ESP32 Relay] Connection timeout', [
                    'ip' => $ip,
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'error' => 'ESP32 device not reachable',
                    'message' => 'Connection timed out. Check if device is online and network is accessible.',
                    'ip' => $ip
                ], 503);
            }
            
            // Check if this is an authentication failure (also 503 - service unavailable)
            if (strpos($e->getMessage(), 'authenticate') !== false) {
                Log::error('[ESP32 Relay] ESP32 authentication failed', [
                    'ip' => $ip,
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'error' => 'ESP32 device authentication failed',
                    'message' => 'Could not authenticate with ESP32 device. Service unavailable.',
                    'ip' => $ip
                ], 503);
            }

            Log::error('[ESP32 Relay] Unexpected error', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Unexpected error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

