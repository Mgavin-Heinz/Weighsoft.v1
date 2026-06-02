# ESP32 Relay Control - Correct Design

## Understanding

### ESP32 Device
- **One ESP32** can control up to **8 relays** (relay1 through relay8)
- **API Endpoint**: `POST http://{ip}/rest/relayState`
- **Payload**: `{"relay1": true, "relay2": false, ...}` (can update one or multiple)
- **Response**: `{"relay1": true, "relay2": false, ..., "relay8": false}` (all states)

### Weighbridge Setup
- Each weighbridge has **ONE ESP32 device**
- That device's 8 relays can be assigned to different functions:
  - Relay 1 → Incoming Boom
  - Relay 2 → Exiting Boom
  - Relay 3 → Incoming Light
  - Relay 4 → Exiting Light
  - Relays 5-8 → Future use or other devices

### Entity Types and Logic

**Boom (Gate)**
- `true` (relay ON) = Boom **Open** (traffic can pass)
- `false` (relay OFF) = Boom **Close** (traffic blocked)

**Light (Traffic Signal)**
- `true` (relay ON) = **Green** light (Closed/Safe - weighing in progress)
- `false` (relay OFF) = **Red** light (Open/Caution - ready for traffic)

## Database Schema Changes Needed

### Current (WRONG):
```sql
incoming_boom_ip    VARCHAR(45)
exiting_boom_ip     VARCHAR(45)
incoming_light_ip   VARCHAR(45)
exiting_light_ip    VARCHAR(45)
```

### Correct Design:
```sql
esp32_ip                VARCHAR(45)    -- Single ESP32 device IP
incoming_boom_relay     TINYINT        -- 1-8 (which relay controls incoming boom)
exiting_boom_relay      TINYINT        -- 1-8
incoming_light_relay    TINYINT        -- 1-8
exiting_light_relay     TINYINT        -- 1-8
```

## Frontend Service Design

### ESP32 Control Service

```javascript
.service("$esp32Control", function ($http) {
    /**
     * Control a specific relay on an ESP32 device
     * @param {string} ip - ESP32 device IP address
     * @param {number} relayNumber - Relay number (1-8)
     * @param {boolean} state - true (ON) or false (OFF)
     * @returns {Promise}
     */
    this.controlRelay = function (ip, relayNumber, state) {
        if (!ip || !relayNumber) {
            return Promise.reject({ error: 'IP address and relay number required' });
        }
        
        if (relayNumber < 1 || relayNumber > 8) {
            return Promise.reject({ error: 'Relay number must be 1-8' });
        }
        
        var payload = {};
        payload['relay' + relayNumber] = state;
        
        return $http.post('http://' + ip + '/rest/relayState', payload, {
            timeout: 5000
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Get current state of all relays
     * @param {string} ip - ESP32 device IP address
     * @returns {Promise} - Resolves with {relay1: bool, relay2: bool, ...}
     */
    this.getRelayStates = function (ip) {
        return $http.get('http://' + ip + '/rest/relayState', {
            timeout: 5000
        }).then(function(response) {
            return response.data;
        });
    };
});
```

## Controller Design

### Weighing Create/Update Controllers

```javascript
// Initialize ESP32 configuration when weighbridge is selected
vm.SelectOnChange = function(type) {
    if (type === 'weighbridge') {
        // Load ESP32 configuration
        vm.esp32 = {
            ip: vm.WeighBridge.esp32_ip,
            incoming_boom_relay: vm.WeighBridge.incoming_boom_relay,
            exiting_boom_relay: vm.WeighBridge.exiting_boom_relay,
            incoming_light_relay: vm.WeighBridge.incoming_light_relay,
            exiting_light_relay: vm.WeighBridge.exiting_light_relay
        };
    }
};

// Boom control - actions: 'open' or 'close'
vm.controlIncomingBoom = function(action) {
    if (!vm.esp32.ip || !vm.esp32.incoming_boom_relay) {
        swal("Error", "Incoming boom not configured", "error");
        return;
    }
    
    // Boom logic: open = true (relay ON), close = false (relay OFF)
    var state = (action === 'open');
    
    $rootScope.Start();
    $esp32Control.controlRelay(vm.esp32.ip, vm.esp32.incoming_boom_relay, state)
        .then(function() {
            $rootScope.Loaded();
            toastr.success('Incoming boom ' + action + ' command sent');
        })
        .catch(function(error) {
            $rootScope.Loaded();
            toastr.error('Failed to control boom: ' + (error.message || 'Unknown error'));
        });
};

// Light control - actions: 'green' or 'red'
vm.controlIncomingLight = function(action) {
    if (!vm.esp32.ip || !vm.esp32.incoming_light_relay) {
        swal("Error", "Incoming light not configured", "error");
        return;
    }
    
    // Light logic: green = true (relay ON, closed/safe), red = false (relay OFF, open/caution)
    var state = (action === 'green');
    
    $rootScope.Start();
    $esp32Control.controlRelay(vm.esp32.ip, vm.esp32.incoming_light_relay, state)
        .then(function() {
            $rootScope.Loaded();
            toastr.success('Incoming light ' + action + ' command sent');
        })
        .catch(function(error) {
            $rootScope.Loaded();
            toastr.error('Failed to control light: ' + (error.message || 'Unknown error'));
        });
};

// Similar for exiting boom and light...
```

## UI Template Design

```html
<!-- Only show if ESP32 is configured -->
<div ng-if="System.esp32.ip">
    <div class="panel panel-warning">
        <div class="panel-heading">
            <h3>ESP32 Relay Control ({{System.esp32.ip}})</h3>
        </div>
        <div class="panel-body">
            <div class="row">
                <!-- Incoming Boom -->
                <div class="col-md-3" ng-if="System.esp32.incoming_boom_relay">
                    <label>Incoming Boom (Relay {{System.esp32.incoming_boom_relay}})</label>
                    <div class="btn-group btn-group-justified">
                        <button class="btn btn-success" ng-click="System.controlIncomingBoom('open')">
                            <i class="fa fa-arrow-up"></i> Open
                        </button>
                        <button class="btn btn-danger" ng-click="System.controlIncomingBoom('close')">
                            <i class="fa fa-arrow-down"></i> Close
                        </button>
                    </div>
                </div>
                
                <!-- Incoming Light -->
                <div class="col-md-3" ng-if="System.esp32.incoming_light_relay">
                    <label>Incoming Light (Relay {{System.esp32.incoming_light_relay}})</label>
                    <div class="btn-group btn-group-justified">
                        <button class="btn btn-success" ng-click="System.controlIncomingLight('green')">
                            <i class="fa fa-circle"></i> Green
                        </button>
                        <button class="btn btn-danger" ng-click="System.controlIncomingLight('red')">
                            <i class="fa fa-circle"></i> Red
                        </button>
                    </div>
                    <small class="text-muted">Green=Safe, Red=Caution</small>
                </div>
                
                <!-- Exiting Boom -->
                <!-- Similar structure -->
                
                <!-- Exiting Light -->
                <!-- Similar structure -->
            </div>
        </div>
    </div>
</div>
```

## Migration Path

### Step 1: New Migration
```php
Schema::table('weighbridges', function (Blueprint $table) {
    // Add new fields
    $table->string('esp32_ip', 45)->nullable();
    $table->tinyInteger('incoming_boom_relay')->nullable();
    $table->tinyInteger('exiting_boom_relay')->nullable();
    $table->tinyInteger('incoming_light_relay')->nullable();
    $table->tinyInteger('exiting_light_relay')->nullable();
    
    // Keep old fields for migration (will remove later)
    // incoming_boom_ip, exiting_boom_ip, incoming_light_ip, exiting_light_ip
});
```

### Step 2: Data Migration (if needed)
If existing data has separate IPs, need manual migration or assume all were on different devices.

### Step 3: Remove Old Fields (later migration)
After confirming new system works, remove the old IP fields.

## Benefits of Correct Design

1. ✅ **Accurate to ESP32 API** - Uses correct endpoint and payload format
2. ✅ **Scalable** - Can easily add more relay-controlled entities
3. ✅ **Flexible** - Multiple entities can use same ESP32 device
4. ✅ **Clear separation** - Entity logic (boom vs light) in controller, not service
5. ✅ **Status query** - Can GET current state of all relays
6. ✅ **Efficient** - Only one ESP32 device per weighbridge (typical setup)

## Implementation Checklist

- [ ] Create new migration with correct fields
- [ ] Update Weighbridge model `$fillable`
- [ ] Update WeighbridgeController `setDefaults()`
- [ ] Rewrite `$esp32Control` service with `controlRelay()` and `getRelayStates()`
- [ ] Update weighing_create.js controller
- [ ] Update weighing_update.js controller
- [ ] Update create.html template
- [ ] Update update.html template
- [ ] Update weighbridge configuration form (list.html)
- [ ] Update QA testing documentation
- [ ] Test with actual ESP32 device

