# ESP32 Backend Proxy Solution

## Overview

Instead of having the frontend call ESP32 devices directly (which causes CORS errors), the Weighsoft backend now acts as a proxy for all ESP32 relay control requests.

## Architecture

```
Frontend (AngularJS)
    ↓ POST /api/esp32/relay
Laravel Backend (Proxy)
    ↓ POST http://{esp32_ip}/rest/relayState
ESP32 Device (Relay Controller)
    ↓ GPIO Control
Physical Relay
    ↓ Power Control
Boom / Light
```

## Advantages

1. ✅ **No CORS Issues** - Backend-to-backend communication bypasses CORS
2. ✅ **No ESP32 Firmware Changes** - Works with existing ESP32 firmware
3. ✅ **Better Security** - ESP32 doesn't need to be accessible from client browsers
4. ✅ **Centralized Logging** - All relay operations logged in Laravel
5. ✅ **Better Error Handling** - Detailed error messages from backend
6. ✅ **Monitoring** - Track who controls relays and when
7. ✅ **Authentication** - All requests go through JWT authentication

## Backend API

### Control Relay

**Endpoint:** `POST /api/esp32/relay`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "ip": "192.168.1.100",
  "relay_number": 1,
  "state": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Relay 1 set to ON",
  "data": {
    "relay1": true,
    "relay2": false,
    ...
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid parameters
- **503 Service Unavailable** - ESP32 device offline/unreachable
- **500 Internal Server Error** - Unexpected error

### Get Relay States

**Endpoint:** `GET /api/esp32/relay?ip=192.168.1.100`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "relay1": true,
    "relay2": false,
    "relay3": false,
    ...
    "relay8": false
  }
}
```

## Frontend Service

### Updated `$esp32Control` Service

```javascript
.service("$esp32Control", function ($http, Restangular) {
    /**
     * Control a relay via backend proxy
     */
    this.controlRelay = function (ip, relayNumber, state) {
        return Restangular.all('esp32/relay').post({
            ip: ip,
            relay_number: relayNumber,
            state: state
        });
    };
    
    /**
     * Get relay states via backend proxy
     */
    this.getRelayStates = function (ip) {
        return Restangular.one('esp32/relay').get({ ip: ip });
    };
});
```

## Controller Implementation

### ESP32RelayController

**Location:** `app/Http/Controllers/ESP32RelayController.php`

**Features:**
- Extends `JwtAuthController` for authentication
- Uses Laravel HTTP client for ESP32 communication
- 5-second timeout for ESP32 requests
- Comprehensive error handling
- Detailed logging of all operations

**Key Methods:**
1. `controlRelay(Request $request)` - Proxy relay control
2. `getRelayStates(Request $request)` - Proxy state query

## Logging

All ESP32 operations are logged in Laravel logs:

```php
Log::info('[ESP32 Relay] Control request', [
    'user_id' => $this->user->id,
    'ip' => $ip,
    'relay_number' => $relayNumber,
    'state' => $state ? 'ON' : 'OFF'
]);
```

**Log Locations:**
- Success: `storage/logs/laravel.log`
- Errors: `storage/logs/laravel.log`

**Log Prefixes:**
- `[ESP32 Relay] Control request` - Relay control attempt
- `[ESP32 Relay] Control successful` - Successful operation
- `[ESP32 Relay] Control failed` - ESP32 returned error
- `[ESP32 Relay] Connection failed` - Network/timeout error

## Error Handling

### Frontend Error Handling

Controllers should handle errors:

```javascript
$esp32Control.controlRelay(ip, relayNumber, state)
    .then(function(response) {
        toastr.success('Relay controlled successfully');
    })
    .catch(function(error) {
        var message = error.data?.error || error.message || 'Unknown error';
        toastr.error('Failed to control relay: ' + message);
    });
```

### Backend Error Types

1. **Validation Errors (400)**
   - Missing IP address
   - Missing relay number
   - Invalid relay number (not 1-8)
   - Invalid state (not boolean)

2. **Connection Errors (503)**
   - ESP32 device offline
   - Network unreachable
   - Timeout (5 seconds)

3. **ESP32 Errors (varies)**
   - Authentication failed on ESP32
   - Invalid request format
   - Device error

4. **Server Errors (500)**
   - Unexpected PHP exceptions

## Security Considerations

### Authentication
- All requests require valid JWT token
- Only authenticated users can control relays
- User ID logged with every operation

### Network Isolation
- ESP32 devices can be on isolated network
- Only backend server needs access to ESP32 network
- Frontend never directly accesses ESP32 devices

### Logging & Audit Trail
- All operations logged with:
  - User ID
  - Timestamp
  - IP address
  - Relay number
  - Action (ON/OFF)
  - Result (success/failure)

## Testing

### Test Backend Proxy

```bash
# Test control relay (requires JWT token)
curl -X POST http://thelab/api/esp32/relay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "172.23.97.202",
    "relay_number": 1,
    "state": true
  }'

# Test get states
curl -X GET "http://thelab/api/esp32/relay?ip=172.23.97.202" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test from Frontend

1. Log in to Weighsoft UI
2. Navigate to weighing create/update screen
3. Select weighbridge with ESP32 configured
4. Click boom/light control buttons
5. Check browser console for any errors
6. Verify no CORS errors

### Check Laravel Logs

```bash
tail -f storage/logs/laravel.log | grep "ESP32"
```

## Migration Notes

### Changes Made

**Backend:**
- ✅ Created `ESP32RelayController.php`
- ✅ Added routes in `routes/api.php`
- ✅ No database changes needed

**Frontend:**
- ✅ Updated `$esp32Control` service to use backend proxy
- ✅ Changed from direct HTTP to Restangular
- ✅ Controllers remain unchanged (still use same service methods)

### No Changes Required

**ESP32 Firmware:**
- ❌ No firmware changes needed
- ❌ No CORS configuration needed
- ✅ Works with existing firmware as-is

## Troubleshooting

### Backend Logs Show "Connection failed"

**Cause:** Backend can't reach ESP32 device

**Solutions:**
1. Verify ESP32 is powered on
2. Ping ESP32 from backend server
3. Check network connectivity
4. Verify firewall rules
5. Check ESP32 IP address is correct

### "Service Unavailable" Error

**Cause:** 5-second timeout reached

**Solutions:**
1. Check ESP32 device is responding
2. Test ESP32 directly: `curl http://{ip}/rest/relayState`
3. Check network latency
4. Verify ESP32 web server is running

### "Unauthorized" Error

**Cause:** JWT token invalid or expired

**Solutions:**
1. Log out and log back in
2. Check token expiry
3. Verify JWT middleware is working

## Performance

### Latency

- **Direct ESP32 call**: ~50-200ms
- **Via backend proxy**: ~100-300ms (adds ~50-100ms overhead)

### Timeout

- **ESP32 request timeout**: 5 seconds
- **Frontend timeout**: 5 seconds
- **Total max wait**: 5 seconds

### Scalability

- Backend can handle multiple concurrent ESP32 requests
- Laravel queues can be used for bulk operations if needed
- No bottleneck for typical weighing operations

## Future Enhancements

1. **Caching** - Cache relay states to reduce ESP32 requests
2. **Queuing** - Use Laravel queues for batch operations
3. **WebSockets** - Real-time relay state updates
4. **Monitoring Dashboard** - View all ESP32 device statuses
5. **Retry Logic** - Automatic retry on transient failures
6. **Device Health Check** - Periodic ping to verify ESP32 availability

## Version History

- **0.10.5** - Initial implementation of backend proxy for ESP32 relay control

