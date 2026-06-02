# ESP32 Relay Control Integration

## Overview

The Weighsoft system integrates with ESP32-based relay controllers to manage boom gates and traffic lights at weighbridge entrances and exits. **ESP32 device configuration is managed at the workstation level**, allowing persistent control access before, during, and after weighing transactions.

Each workstation can have up to 6 relay-controlled devices:

1. **Incoming Boom** - Controls entrance boom gate (Open/Close)
2. **Exiting Boom** - Controls exit boom gate (Open/Close)
3. **Incoming Red Light** - Entrance red light (On/Off)
4. **Incoming Green Light** - Entrance green light (On/Off)
5. **Exiting Red Light** - Exit red light (On/Off)
6. **Exiting Green Light** - Exit green light (On/Off)

## Architecture

### ⚠️ **IMPORTANT ARCHITECTURAL CHANGE (v0.10.10)**

**ESP32 device configuration has been moved from the `weighbridges` table to the `workstations` table.**

**Reason:** Boom and light controls need to be accessible independent of the weighing transaction lifecycle. Previously, controls were only available during transaction creation/editing. Now, controls are accessible via a floating panel that persists across all screens.

### Communication Flow

```
Weighsoft UI (AngularJS)
    ↓ Navbar Button Click
Floating Control Panel Directive
    ↓ Load Workstation Data
Backend API (/api/workstations/{id})
    ↓ HTTP POST
ESP32 Backend Proxy (/api/esp32/relay)
    ↓ JWT Authentication
ESP32 Device (Relay Controller)
    ↓ GPIO Control
Physical Relay Module
    ↓ Power Control
Boom Gate / Traffic Light
```

**Key Points:**
- **Workstation-level configuration**: Each workstation stores ESP32 IP addresses and relay numbers
- **Floating control panel**: Always accessible via navbar button when a workstation is selected
- **Backend proxy**: Laravel proxy handles JWT authentication to ESP32 devices
- **Each device controls up to 8 relays**: Multiple entities can share the same IP with different relay numbers
- **RESTful API**: Modern REST API design with proper error handling

## ESP32 Relay Controller API

### Authentication

The ESP32 devices use **JWT (JSON Web Token)** authentication:

1. **Sign In**: POST to `/rest/signIn` with username/password
2. **Receive Token**: ESP32 returns JWT token
3. **Authenticated Requests**: Include token in `Authorization: Bearer {token}` header

**Default Credentials:**
- Username: `admin`
- Password: `admin`

### Endpoints

#### Sign In
```
POST http://{device_ip}/rest/signIn
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Control Relay
```
POST http://{device_ip}/rest/relayState
Authorization: Bearer {token}
Content-Type: application/json

{
  "relay1": true,   // true = ON, false = OFF
  "relay2": false,
  "relay3": true
  // ... up to relay8
}

Response (200 OK):
{
  "relay1": true,
  "relay2": false,
  // ... all relay states
}
```

#### Get Relay States
```
GET http://{device_ip}/rest/relayState
Authorization: Bearer {token}

Response:
{
  "relay1": true,
  "relay2": false,
  // ... all relay states
}
```

## Device Semantics

### Boom Gate Control

| Action | Relay State | Physical State |
|--------|-------------|----------------|
| Open   | `true`      | Boom raised (traffic can pass) |
| Close  | `false`     | Boom lowered (traffic blocked) |

**UI Buttons:**
- **Open** (Green button) - Raises the boom gate
- **Close** (Red button) - Lowers the boom gate

### Traffic Light Control

Red and green lights are separate relays; each is controlled independently (On/Off).

| Action | Relay State | Physical State |
|--------|-------------|----------------|
| On     | `true`      | Light illuminated |
| Off    | `false`     | Light off |

**UI Buttons (per light):**
- **On** - Turns that light on (relay ON)
- **Off** - Turns that light off (relay OFF)

There are four light entities: Incoming Red, Incoming Green, Exiting Red, Exiting Green.

## Database Schema

### Workstations Table

Twelve columns store ESP32 device configuration (6 entities × IP + relay):

```sql
incoming_boom_ip             VARCHAR(255)  -- e.g., '10.159.66.202'
incoming_boom_relay          TINYINT       -- e.g., 1 (relay number 1-8)
exiting_boom_ip              VARCHAR(255)
exiting_boom_relay           TINYINT       -- e.g., 2
incoming_red_light_ip        VARCHAR(255)
incoming_red_light_relay     TINYINT       -- e.g., 3
incoming_green_light_ip      VARCHAR(255)
incoming_green_light_relay   TINYINT       -- e.g., 4
exiting_red_light_ip         VARCHAR(255)
exiting_red_light_relay      TINYINT       -- e.g., 5
exiting_green_light_ip       VARCHAR(255)
exiting_green_light_relay    TINYINT       -- e.g., 6
```

**Key Points:**
- All fields are nullable (optional)
- Multiple entities can share the same IP with different relay numbers
- Example: One ESP32 at `10.159.66.202` can control all 6 devices on relays 1-6

**Migrations:**
- **Add to Workstations:** `2025_12_17_000001_add_esp32_fields_to_workstations_table.php`
- **Six relay lights (replace combined lights):** `2026_01_27_000001_workstations_six_relay_lights.php`
- **Remove from Weighbridges:** `2025_12_17_000002_drop_esp32_fields_from_weighbridges_table.php`

**SQL Scripts (non-Laravel):**
- `database_scripts/11-addBoomLightIPsToWorkstations.sql`
- `database_scripts/12-addRelayNumbersToWorkstations.sql`
- `database_scripts/13-dropEsp32FieldsFromWeighbridges.sql`

## Backend Implementation

### Model: WorkStations

Location: `app/Models/WorkStations.php`

```php
protected $fillable = [
    'workstation_type',
    'workstation_name',
    'workstation_active',
    'site_id',
    'company_id',
    'incoming_boom_ip',
    'incoming_boom_relay',
    'exiting_boom_ip',
    'exiting_boom_relay',
    'incoming_red_light_ip',
    'incoming_red_light_relay',
    'incoming_green_light_ip',
    'incoming_green_light_relay',
    'exiting_red_light_ip',
    'exiting_red_light_relay',
    'exiting_green_light_ip',
    'exiting_green_light_relay'
];
```

### Controller: ESP32RelayController

Location: `app/Http/Controllers/ESP32RelayController.php`

**Purpose:** Backend proxy for ESP32 authentication and relay control

**Methods:**

#### `controlRelay(Request $request): JsonResponse`
Controls a relay on an ESP32 device.

**Request:**
```json
{
  "ip": "10.159.66.202",
  "relay_number": 1,
  "state": true
}
```

**Process:**
1. Validate request (IP and relay_number required)
2. Get/cache JWT token for the device
3. Send authenticated request to ESP32
4. Return response to frontend

**Response:**
```json
{
  "relay1": true,
  "relay2": false,
  // ... all relay states
}
```

#### `getRelayStates(Request $request): JsonResponse`
Retrieves all relay states from an ESP32 device.

**Request:**
```
GET /api/esp32/relay?ip=10.159.66.202
```

**Response:**
```json
{
  "relay1": true,
  "relay2": false,
  // ... relay1-relay8 states
}
```

### Routes

Location: `routes/api.php`

```php
// ESP32 Relay Control Proxy (authenticated)
Route::post('esp32/relay', [ESP32RelayController::class, 'controlRelay']);
Route::get('esp32/relay', [ESP32RelayController::class, 'getRelayStates']);
```

**Authentication:** JWT required (extends `JwtAuthController`)

### CORS Middleware

Location: `app/Http/Middleware/Cors.php`

**Critical:** Handles OPTIONS preflight requests before JWT authentication:

```php
public function handle(Request $request, Closure $next)
{
    // Handle preflight OPTIONS request
    if ($request->isMethod('OPTIONS')) {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Authorization,Accept,Origin,...')
            ->header('Access-Control-Max-Age', '86400');
    }
    
    return $next($request)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Authorization,Accept,Origin,...');
}
```

## Frontend Implementation

### Floating Control Panel Directive

Location: `app/js/directives/esp32/esp32_control_panel.directive.js`

**Purpose:** Provides a persistent, floating control panel for boom/light control

**Features:**
- Opens on demand via navbar button
- Loads workstation data dynamically
- Shows only configured devices
- Closes with overlay click or close button
- Error handling with toastr notifications

**Event-Driven Architecture:**
```javascript
// Broadcast event to open panel
$rootScope.$broadcast('esp32:openControlPanel', workstationId);

// Directive listens for event
$rootScope.$on('esp32:openControlPanel', function(event, workstationId) {
    ctrl.loadWorkstation(workstationId);
    ctrl.open();
});
```

**Controller Methods:**
- `loadWorkstation(workstationId)` - Fetches workstation data from API
- `controlIncomingBoom(action)` - Controls incoming boom (open/close)
- `controlExitingBoom(action)` - Controls exiting boom (open/close)
- `controlIncomingRedLight(state)` - Controls incoming red light (on/off)
- `controlIncomingGreenLight(state)` - Controls incoming green light (on/off)
- `controlExitingRedLight(state)` - Controls exiting red light (on/off)
- `controlExitingGreenLight(state)` - Controls exiting green light (on/off)
- `hasAnyControls()` - Checks if any ESP32 devices are configured

### Template

Location: `app/tpls/directives/esp32_control_panel.html`

**Design:**
- Fixed position overlay (z-index: 9999)
- Centered modal panel
- Loading state indicator
- Warning message if no devices configured
- Responsive button layout (2 columns)
- Bootstrap styling with custom CSS

### Service: `$esp32Control`

Location: `app/js/services.js`

**Method:**

```javascript
controlRelay: function(ip, relayNumber, state) {
    return Restangular.all('esp32/relay').post({
        ip: ip,
        relay_number: relayNumber,
        state: state
    });
}
```

**Usage:**
```javascript
$esp32Control.controlRelay('10.159.66.202', 1, true)
    .then(function(response) {
        toastr.success('Relay turned ON');
    })
    .catch(function(error) {
        toastr.error('Failed to control relay: ' + error.message);
    });
```

### Main Controller Integration

Location: `app/js/controllers/main.js`

```javascript
$scope.openEsp32Control = function() {
    $rootScope.$broadcast('esp32:openControlPanel', $rootScope.Params.workstation_id);
};
```

### Navbar Button

Location: `app/tpls/layout/user-info-navbar.html`

```html
<li class="fullscreen">
  <a href="" ng-click="openEsp32Control()" 
     title="Boom & Light Control" 
     ng-if="$root.Params && $root.Params.workstation_id">
    <i class="fa-toggle-on"></i>
  </a>
</li>
```

**Visibility:** Only shows when a workstation is selected (`$root.Params.workstation_id`)

### App Body Integration

Location: `app/tpls/layout/app-body.html`

```html
<div class="main-content">
    <user-info-navbar ng-show="layoutOptions.horizontalMenu.isVisible == false"></user-info-navbar>
    <ui-view class="main-content-view"></ui-view>
    <esp32-control-panel></esp32-control-panel> <!-- Floating panel -->
    <site-footer></site-footer>
</div>
```

### Workstation Configuration

Location: `app/js/controllers/workstations.js`, `app/tpls/workstations/list.html`

**Form Fields:**
- Incoming Boom IP & Relay Number
- Exiting Boom IP & Relay Number
- Incoming Red Light IP & Relay Number
- Incoming Green Light IP & Relay Number
- Exiting Red Light IP & Relay Number
- Exiting Green Light IP & Relay Number

**Test Buttons:**
Each configured device has a test button that turns the relay ON for 1 second, then OFF.

**Schema:**
```javascript
vm.schema = {
    type: "object",
    properties: {
        // ... workstation fields
        incoming_boom_ip: { type: "string", title: "Incoming Boom IP" },
        incoming_boom_relay: { type: "integer", title: "Incoming Boom Relay (1-8)" },
        // ... other ESP32 fields
    }
};
```

## Configuration

### Workstation Setup

1. Navigate to **Workstations** management
2. Edit or create a workstation
3. Scroll to "ESP32 Boom & Light Control Settings"
4. Enter device configuration:
   - **IP Address**: Device IP (e.g., `10.159.66.202`)
   - **Relay Number**: 1-8 (which relay on that device)
5. Click **Test** button to verify each device
6. Save the workstation

**Example Configuration (One ESP32 controlling all 6 devices):**
- Incoming Boom IP: `10.159.66.202`, Relay: `1`
- Exiting Boom IP: `10.159.66.202`, Relay: `2`
- Incoming Red Light IP: `10.159.66.202`, Relay: `3`
- Incoming Green Light IP: `10.159.66.202`, Relay: `4`
- Exiting Red Light IP: `10.159.66.202`, Relay: `5`
- Exiting Green Light IP: `10.159.66.202`, Relay: `6`

### ESP32 Device Setup

1. Flash ESP32 with relay control firmware (from `Weighsoft Relay Control` project)
2. Configure WiFi network (device must be accessible from backend server)
3. Configure authentication credentials (`admin`/`admin`)
4. Configure relay polarity (active HIGH or LOW) based on relay module
5. Test relay operation via device web UI
6. Note device IP address for Weighsoft configuration

## Usage

### Accessing Controls

1. **Select Workstation**: Navigate to any screen (Companies, Weighing, etc.)
2. **Ensure workstation is selected** in the top navigation
3. **Click boom/light icon** in the navbar (top-right)
4. **Floating panel opens** with configured controls
5. **Click buttons** to control devices
6. **Close panel** with X button or click outside

### Expected Behavior

- **Success:** Green toastr notification, button feedback
- **Error:** Red toastr notification with error message
- **Loading:** Spinner indicator during API call
- **No Panel:** If no workstation selected, navbar button doesn't appear
- **No Devices:** If no ESP32 devices configured, warning message shows

### Benefits of Floating Panel Architecture

✅ **Always Accessible**: Controls available before, during, and after transactions
✅ **Persistent**: Panel can remain open while navigating between screens
✅ **Context-Aware**: Automatically loads current workstation's devices
✅ **Independent**: Not tied to weighing transaction lifecycle
✅ **Solves Original Problem**: Can close boom after saving transaction

## Error Handling

### Frontend Errors

1. **No Workstation Selected**
   - Message: "No workstation selected"
   - Action: Select company/site/workstation in top navigation

2. **Device Not Configured**
   - Message: "Incoming/Exiting boom or red/green light not configured for this workstation"
   - Action: Configure IP and relay in workstation settings

3. **Network Errors**
   - Message: "Failed to control device: Network Error"
   - Causes: Backend offline, CORS issues, network problems

4. **ESP32 Device Offline**
   - Message: "Failed to control device: timeout"
   - Causes: ESP32 powered off, wrong IP, WiFi disconnected

5. **Authentication Failed**
   - Message: "Failed to control device: 401 Unauthorized"
   - Solution: Check ESP32 credentials in backend controller

### Backend Errors

**ESP32RelayController.php** handles:
- JWT token caching and refresh
- Authentication failures
- Network timeouts
- Invalid requests

**Error Response Format:**
```json
{
  "error": true,
  "message": "Device offline or unreachable"
}
```

## Troubleshooting

### Floating Panel Not Opening

1. **Check workstation selection**: Navbar button only shows when workstation selected
2. **Check console**: Look for JavaScript errors
3. **Check directive loading**: Ensure `esp32_control_panel.directive.js` is loaded in `index.html`

### Device Not Responding

1. **Check device power**: Ensure ESP32 is powered on
2. **Check network**: Ping device IP from backend server
3. **Check IP address**: Verify IP is correct in workstation settings
4. **Check WiFi**: Ensure device connected to WiFi (check device LED)
5. **Check authentication**: Default credentials are `admin`/`admin`

### Wrong Relay Activating

- Verify relay number (1-8) in workstation settings
- Check device configuration (relay mapping)
- Test directly via ESP32 web UI

### Relay State Not Matching

- Relay polarity might be inverted (active HIGH vs LOW)
- Check ESP32 configuration for `active_high` setting
- Test via device web UI to confirm correct polarity

### Backend 404 Errors

1. **Clear route cache**: `php artisan route:clear`
2. **Restart Docker containers**: `docker-compose restart weighsoft-back`
3. **Check routes**: `php artisan route:list | grep esp32`

### CORS Errors

- Ensure `Cors.php` middleware handles OPTIONS requests before authentication
- Check `Access-Control-Max-Age` header (should be 86400)
- Clear browser cache and hard refresh (Ctrl+Shift+R)

## Security Considerations

### Network Security

- **Backend Proxy**: All ESP32 communication proxied through Laravel backend
- **JWT Authentication**: Weighsoft UI users must authenticate to access backend
- **ESP32 Authentication**: Backend authenticates to ESP32 devices with JWT
- **Token Caching**: JWT tokens cached to reduce authentication overhead
- **Isolated Network**: Place ESP32 devices on isolated VLAN if possible

### Physical Security

- **Device Access**: Physically secure ESP32 devices
- **Relay Modules**: Protect relay modules from tampering
- **Emergency Stop**: Ensure physical emergency stop for safety

## Testing

### Unit Testing

1. **ESP32 Device**: Use device web UI to test relay switching
2. **Backend API**:
   ```bash
   curl -X POST http://backend-url/api/esp32/relay \
     -H "Authorization: Bearer {jwt_token}" \
     -H "Content-Type: application/json" \
     -d '{"ip":"10.159.66.202","relay_number":1,"state":true}'
   ```

### Integration Testing

1. Configure workstation with test IP addresses and relay numbers
2. Navigate to any screen and select the workstation
3. Click navbar boom/light icon
4. Verify floating panel opens
5. Test each button in control panel
6. Verify physical device responds correctly
7. Test error scenarios (device offline, wrong IP)

### Workstation Configuration Testing

1. Navigate to Workstations management
2. Edit or create a workstation
3. Enter test IP addresses and relay numbers
4. Click test button for each device
5. Verify relay turns ON for 1 second, then OFF
6. Save workstation and verify settings persist

## Migration Guide

### Migrating from Weighbridge-Level to Workstation-Level

If you have existing data in the `weighbridges` table:

1. **Backup Database**: Always backup before migration
2. **Manual Data Migration**: Copy ESP32 settings from weighbridges to workstations:
   ```sql
   UPDATE workstations ws
   JOIN weighbridges wb ON ws.id = wb.workstation_id
   SET ws.incoming_boom_ip = wb.incoming_boom_ip,
       ws.incoming_boom_relay = wb.incoming_boom_relay,
       ws.exiting_boom_ip = wb.exiting_boom_ip,
       ws.exiting_boom_relay = wb.exiting_boom_relay,
       ws.incoming_light_ip = wb.incoming_light_ip,
       ws.incoming_light_relay = wb.incoming_light_relay,
       ws.exiting_light_ip = wb.exiting_light_ip,
       ws.exiting_light_relay = wb.exiting_light_relay;
   ```
3. **Run Migrations**:
   ```bash
   php artisan migrate
   ```
   Or run SQL scripts manually:
   - `11-addBoomLightIPsToWorkstations.sql`
   - `12-addRelayNumbersToWorkstations.sql`
   - `13-dropEsp32FieldsFromWeighbridges.sql`
4. **Test**: Verify controls work via floating panel
5. **Cleanup**: Old weighbridge ESP32 fields automatically dropped

## Version History

- **0.10.11** - **Six relay entities: separate Red and Green lights**
  - Replaced combined "Incoming Light" / "Exiting Light" (one relay each) with four entities: Incoming Red, Incoming Green, Exiting Red, Exiting Green (each On/Off).
  - Migration `2026_01_27_000001_workstations_six_relay_lights.php` adds 8 columns, drops 4; copies legacy light config into green columns.
  - Work Station settings form and test panel updated for 6 relay types.
  - Floating control panel shows On/Off for each red and green light.

- **0.10.10** - **ARCHITECTURAL CHANGE: Moved ESP32 controls to workstation level**
  - Moved ESP32 fields from weighbridges to workstations table
  - Created floating control panel directive
  - Added navbar button for always-accessible controls
  - Removed inline controls from weighing screens
  - Updated backend proxy with JWT authentication
  - Added workstation configuration form with test buttons
  
- **0.10.4** - Initial implementation of ESP32 relay control integration
  - Added 8 fields (IP + relay) to weighbridges table
  - Created `$esp32Control` service
  - Added control buttons to weighing screens
  - Aligned with actual ESP32 relay API format

## References

- **ESP32 Firmware**: `Weighsoft Relay Control` project
- **Backend Migrations**:
  - `database/migrations/2025_12_17_000001_add_esp32_fields_to_workstations_table.php`
  - `database/migrations/2026_01_27_000001_workstations_six_relay_lights.php`
  - `database/migrations/2025_12_17_000002_drop_esp32_fields_from_weighbridges_table.php`
- **SQL Scripts**:
  - `database_scripts/11-addBoomLightIPsToWorkstations.sql`
  - `database_scripts/12-addRelayNumbersToWorkstations.sql`
  - `database_scripts/13-dropEsp32FieldsFromWeighbridges.sql`
- **Backend Controller**: `app/Http/Controllers/ESP32RelayController.php`
- **Backend Model**: `app/Models/WorkStations.php`
- **Frontend Directive**: `app/js/directives/esp32/esp32_control_panel.directive.js`
- **Frontend Template**: `app/tpls/directives/esp32_control_panel.html`
- **Frontend Service**: `app/js/services.js` - `$esp32Control`
- **Workstation Controller**: `app/js/controllers/workstations.js`
- **Workstation Template**: `app/tpls/workstations/list.html`
