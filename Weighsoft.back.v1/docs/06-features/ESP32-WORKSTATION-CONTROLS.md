# ESP32 Workstation-Level Controls Feature

## Feature Overview

**Version:** 0.10.10  
**Release Date:** December 17, 2025  
**Status:** ✅ Implemented

### Summary

ESP32 boom and light controls have been **architecturally redesigned** to be managed at the **workstation level** rather than the weighbridge level. This provides persistent, always-accessible controls via a floating panel that remains available before, during, and after weighing transactions.

### Problem Solved

**Original Issue:** Boom and light controls were only accessible while creating or editing a weighing transaction. Once a transaction was saved, the controls disappeared, making it impossible to close a boom gate or change a traffic light without creating a new transaction.

**Solution:** Move ESP32 device configuration to workstations and implement a floating control panel that's accessible from any screen via the navbar.

## Architecture

### Configuration Level: Workstation

ESP32 device settings (IP addresses and relay numbers) are now stored in the `workstations` table instead of the `weighbridges` table.

**Why Workstation Level?**
- ✅ Workstation represents the physical control station where weighing operations occur
- ✅ Workstation persists across multiple weighing transactions
- ✅ One workstation may use multiple weighbridges, but controls are consistent
- ✅ Configuration is more logical and centralized

### User Interface: Floating Panel

A persistent, modal-style floating panel provides boom/light controls:

**Features:**
- **Navbar Button**: Toggle icon in top-right navbar
- **Always Accessible**: Available on any screen when a workstation is selected
- **Auto-Loading**: Automatically loads current workstation's devices
- **Conditional Display**: Only shows configured devices
- **Error Handling**: Toastr notifications for success/failure
- **Responsive Design**: Works on desktop and tablet layouts

### Data Flow

```
User → Navbar Button → Broadcast Event → Directive
  ↓
Directive loads workstation data from API
  ↓
User clicks control button → Service calls backend proxy
  ↓
Backend authenticates to ESP32 with JWT → Controls relay
  ↓
Physical device responds → User sees success/error notification
```

## Database Changes

### New: Workstations Table Columns

Eight new columns added to `workstations` table:

| Column | Type | Description |
|--------|------|-------------|
| `incoming_boom_ip` | VARCHAR(255) | IP address of incoming boom ESP32 device |
| `incoming_boom_relay` | TINYINT | Relay number (1-8) for incoming boom |
| `exiting_boom_ip` | VARCHAR(255) | IP address of exiting boom ESP32 device |
| `exiting_boom_relay` | TINYINT | Relay number (1-8) for exiting boom |
| `incoming_light_ip` | VARCHAR(255) | IP address of incoming light ESP32 device |
| `incoming_light_relay` | TINYINT | Relay number (1-8) for incoming light |
| `exiting_light_ip` | VARCHAR(255) | IP address of exiting light ESP32 device |
| `exiting_light_relay` | TINYINT | Relay number (1-8) for exiting light |

### Removed: Weighbridges Table Columns

The same eight columns were **removed** from the `weighbridges` table:
- `incoming_boom_ip`, `incoming_boom_relay`
- `exiting_boom_ip`, `exiting_boom_relay`
- `incoming_light_ip`, `incoming_light_relay`
- `exiting_light_ip`, `exiting_light_relay`

### Migration Scripts

**Laravel Migrations:**
1. `2025_12_17_000001_add_esp32_fields_to_workstations_table.php`
2. `2025_12_17_000002_drop_esp32_fields_from_weighbridges_table.php`

**SQL Scripts (non-Laravel systems):**
1. `database_scripts/11-addBoomLightIPsToWorkstations.sql`
2. `database_scripts/12-addRelayNumbersToWorkstations.sql`
3. `database_scripts/13-dropEsp32FieldsFromWeighbridges.sql`

## Frontend Implementation

### New: Floating Control Panel Directive

**File:** `app/js/directives/esp32/esp32_control_panel.directive.js`

**Purpose:** Self-contained AngularJS directive that provides the floating panel UI and control logic.

**Key Features:**
- Event-driven architecture (listens for `esp32:openControlPanel` broadcast)
- Loads workstation data dynamically via Restangular
- Controls all 4 devices (incoming/exiting boom/light)
- Loading states and error handling
- Conditional device display (only shows configured devices)

**Template:** `app/tpls/directives/esp32_control_panel.html`
- Modal overlay design (z-index: 9999)
- Responsive button layout
- Shows device IP and relay number
- Close button and overlay click to dismiss

### Updated: Workstation Management

**Files:**
- `app/js/controllers/workstations.js`
- `app/tpls/workstations/list.html`

**New Form Fields:**
- 8 input fields for ESP32 IP addresses and relay numbers
- Organized in fieldset: "ESP32 Boom & Light Control Settings"
- Placeholders guide user input

**Test Functionality:**
- Test button for each configured device
- Turns relay ON for 1 second, then OFF
- Success/error feedback via toastr

### Removed: Weighing Screen Controls

**Files:**
- `app/js/controllers/weighing_create.js` - Removed 4 control functions and `esp32Status`
- `app/js/controllers/weighing_update.js` - Removed 4 control functions and `esp32Status`
- `app/tpls/weighing/create.html` - Removed "Boom & Light Control" panel
- `app/tpls/weighing/update.html` - Removed "Boom & Light Control" panel

**Rationale:** Controls moved to floating panel for better UX and accessibility.

### Removed: Weighbridge Configuration

**Files:**
- `app/tpls/weighbridges/list.html` - Removed ESP32 configuration section

**Rationale:** ESP32 settings now managed at workstation level.

## Backend Implementation

### Updated: WorkStations Model

**File:** `app/Models/WorkStations.php`

Added 8 ESP32 fields to `$fillable` array to allow mass assignment.

### Updated: Weighbridge Model

**File:** `app/Models/Weighbridge.php`

Removed 8 ESP32 fields from `$fillable` array.

### Existing: ESP32RelayController

**File:** `app/Http/Controllers/ESP32RelayController.php`

No changes needed - backend proxy already implemented with JWT authentication.

## User Experience Improvements

### Before (v0.10.4)

❌ Controls only visible during transaction creation/editing  
❌ Controls disappeared after saving transaction  
❌ Couldn't close boom without creating new transaction  
❌ Configuration scattered across multiple weighbridges  

### After (v0.10.10)

✅ Controls always accessible via navbar button  
✅ Controls persist across all screens  
✅ Can close boom anytime workstation is selected  
✅ Centralized configuration at workstation level  
✅ Cleaner weighing screen (no embedded controls)  
✅ Test buttons in configuration screen  

## User Workflow

### Configuration Workflow

1. Navigate to **Workstations** management
2. Edit or create a workstation
3. Scroll to "ESP32 Boom & Light Control Settings"
4. Enter IP address and relay number for each device
5. Click **Test** button to verify each device works
6. Save workstation

### Usage Workflow

1. Select workstation from top navigation
2. Click **boom/light icon** in navbar (top-right)
3. Floating panel opens with available controls
4. Click button to control device (Open/Close, Green/Red)
5. See success/error notification
6. Panel remains open or close with X / click outside
7. Continue working in any screen with controls accessible

## Configuration Examples

### Example 1: Four Separate ESP32 Devices

```
Incoming Boom:  IP: 192.168.1.100, Relay: 1
Exiting Boom:   IP: 192.168.1.101, Relay: 1
Incoming Light: IP: 192.168.1.102, Relay: 1
Exiting Light:  IP: 192.168.1.103, Relay: 1
```

Each device controls one relay (relay 1 on each device).

### Example 2: One ESP32 Controlling All Devices

```
Incoming Boom:  IP: 10.159.66.202, Relay: 1
Exiting Boom:   IP: 10.159.66.202, Relay: 2
Incoming Light: IP: 10.159.66.202, Relay: 3
Exiting Light:  IP: 10.159.66.202, Relay: 4
```

One ESP32 device at `10.159.66.202` controls 4 relays.

### Example 3: Mixed Configuration

```
Incoming Boom:  IP: 10.159.66.202, Relay: 1
Exiting Boom:   IP: 10.159.66.202, Relay: 2
Incoming Light: IP: 192.168.1.105, Relay: 1
Exiting Light:  IP: 192.168.1.105, Relay: 2
```

Two ESP32 devices - one for booms, one for lights.

## Testing

### Configuration Testing

1. ✅ Add ESP32 fields to workstation form
2. ✅ Save workstation with IP addresses and relay numbers
3. ✅ Click test button for each device
4. ✅ Verify relay turns ON for 1 second, then OFF
5. ✅ Verify toastr notifications show success/error

### Floating Panel Testing

1. ✅ Select workstation in navigation
2. ✅ Verify navbar button appears
3. ✅ Click navbar button
4. ✅ Verify floating panel opens
5. ✅ Verify correct devices shown
6. ✅ Click each control button
7. ✅ Verify physical devices respond
8. ✅ Verify toastr notifications
9. ✅ Close panel with X or overlay click
10. ✅ Navigate to different screen with panel open
11. ✅ Verify panel persists

### Migration Testing

1. ✅ Run migrations on test database
2. ✅ Verify new columns exist in workstations table
3. ✅ Verify old columns removed from weighbridges table
4. ✅ Test data migration script (if needed)

## Deployment Checklist

- [ ] **Database Backup**: Backup production database
- [ ] **Run Migrations**: Execute migration 000001 and 000002
- [ ] **Or Run SQL Scripts**: Execute scripts 11, 12, 13 manually
- [ ] **Migrate Data**: Copy ESP32 settings from weighbridges to workstations (if applicable)
- [ ] **Deploy Backend**: Build and deploy backend v0.10.10
- [ ] **Deploy Frontend**: Build and deploy frontend v0.10.10
- [ ] **Clear Caches**: `php artisan route:clear`, `php artisan config:clear`
- [ ] **Restart Containers**: `docker-compose restart`
- [ ] **Test**: Verify floating panel opens and controls work
- [ ] **User Training**: Brief users on new navbar button and floating panel

## Breaking Changes

⚠️ **Database Schema Change**: ESP32 fields moved from `weighbridges` to `workstations` table

**Impact:**
- Existing ESP32 configurations in `weighbridges` table will be lost unless migrated
- Must reconfigure ESP32 settings in workstation management

**Mitigation:**
- Provide SQL script to migrate data from weighbridges to workstations
- Update deployment documentation with migration steps

⚠️ **Frontend API Change**: Weighing controllers no longer have ESP32 control functions

**Impact:**
- Any custom code calling `controlIncomingBoom()`, etc. will fail
- Template references to `System.esp32Status` will error

**Mitigation:**
- Use floating panel directive instead
- Broadcast `esp32:openControlPanel` event to open panel programmatically

## Future Enhancements

### Potential Improvements

1. **Auto-Control Logic**: Automatically open/close booms based on weighing status
2. **Relay Status Polling**: Periodically fetch and display current relay states
3. **Multi-Workstation View**: Panel showing controls for multiple workstations
4. **Scheduled Control**: Time-based automation for boom/light control
5. **Access Control**: Role-based permissions for boom/light control
6. **Audit Logging**: Log all boom/light control actions for security

### Community Feedback

Please provide feedback on:
- Usability of floating panel
- Usefulness of test buttons in configuration
- Need for auto-control features
- Additional features or improvements

## References

- **Main Documentation**: `docs/05-integrations/ESP32-RELAY-INTEGRATION.md`
- **ESP32 Firmware**: `Weighsoft Relay Control` project
- **Backend Migrations**: `database/migrations/2025_12_17_000001_*.php` and `000002_*.php`
- **SQL Scripts**: `database_scripts/11-*.sql`, `12-*.sql`, `13-*.sql`
- **Frontend Directive**: `app/js/directives/esp32/esp32_control_panel.directive.js`
- **Frontend Template**: `app/tpls/directives/esp32_control_panel.html`

## Support

For issues or questions:
1. Check troubleshooting section in main ESP32 integration docs
2. Review frontend console for JavaScript errors
3. Check backend logs for API errors
4. Verify ESP32 device is online and accessible
5. Contact system administrator for assistance

