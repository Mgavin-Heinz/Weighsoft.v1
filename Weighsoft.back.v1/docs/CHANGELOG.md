# Weighsoft System Changelog

## Version 0.10.10 (December 17, 2025)

### 🎯 Major Feature: ESP32 Workstation-Level Controls

**ARCHITECTURAL CHANGE**: ESP32 boom and light controls moved from weighbridge level to workstation level with floating control panel.

#### New Features

- ✅ **Floating Control Panel**: Always-accessible boom/light controls via navbar button
- ✅ **Workstation-Level Configuration**: ESP32 settings managed in workstation management
- ✅ **Test Buttons**: Test each device during configuration (1-second ON/OFF pulse)
- ✅ **Persistent Access**: Controls available before, during, and after weighing transactions
- ✅ **Event-Driven Architecture**: Panel opens on-demand via broadcast event

#### Database Changes

**Added to `workstations` table:**
- `incoming_boom_ip` (VARCHAR 255)
- `incoming_boom_relay` (TINYINT)
- `exiting_boom_ip` (VARCHAR 255)
- `exiting_boom_relay` (TINYINT)
- `incoming_light_ip` (VARCHAR 255)
- `incoming_light_relay` (TINYINT)
- `exiting_light_ip` (VARCHAR 255)
- `exiting_light_relay` (TINYINT)

**Removed from `weighbridges` table:**
- All 8 ESP32 fields (IPs and relay numbers)

#### Frontend Changes

**New Files:**
- `app/js/directives/esp32/esp32_control_panel.directive.js` - Floating panel directive
- `app/tpls/directives/esp32_control_panel.html` - Floating panel template
- `docs/06-features/ESP32-WORKSTATION-CONTROLS.md` - Feature documentation

**Updated Files:**
- `app/js/controllers/main.js` - Added `openEsp32Control()` function
- `app/js/controllers/workstations.js` - Added ESP32 fields and test functions
- `app/tpls/layout/user-info-navbar.html` - Added boom/light control button
- `app/tpls/layout/app-body.html` - Added directive element
- `app/tpls/workstations/list.html` - Added ESP32 configuration section with test buttons
- `index.html` - Added directive script

**Removed Code:**
- `app/js/controllers/weighing_create.js` - Removed ESP32 control functions
- `app/js/controllers/weighing_update.js` - Removed ESP32 control functions
- `app/tpls/weighing/create.html` - Removed embedded control panel
- `app/tpls/weighing/update.html` - Removed embedded control panel
- `app/tpls/weighbridges/list.html` - Removed ESP32 configuration section

#### Backend Changes

**New Files:**
- `database/migrations/2025_12_17_000001_add_esp32_fields_to_workstations_table.php`
- `database/migrations/2025_12_17_000002_drop_esp32_fields_from_weighbridges_table.php`
- `database_scripts/11-addBoomLightIPsToWorkstations.sql`
- `database_scripts/12-addRelayNumbersToWorkstations.sql`
- `database_scripts/13-dropEsp32FieldsFromWeighbridges.sql`

**Updated Files:**
- `app/Models/WorkStations.php` - Added 8 ESP32 fields to `$fillable`
- `app/Models/Weighbridge.php` - Removed 8 ESP32 fields from `$fillable`

**Unchanged (works as-is):**
- `app/Http/Controllers/ESP32RelayController.php` - Backend proxy (no changes needed)
- `routes/api.php` - ESP32 routes (already registered)

#### Documentation Changes

**New/Updated:**
- `docs/05-integrations/ESP32-RELAY-INTEGRATION.md` - **MAJOR UPDATE**: Rewritten for workstation-level architecture
- `docs/06-features/ESP32-WORKSTATION-CONTROLS.md` - **NEW**: Feature specification and migration guide
- `docs/README.md` - Updated version to 0.10.10

#### Problem Solved

**Original Issue**: Users could open boom gates during weighing transaction creation, but after saving the transaction, the controls disappeared. This made it impossible to close the boom without creating a new transaction.

**Solution**: Controls are now accessible anytime via a floating panel, independent of the weighing transaction lifecycle.

#### Breaking Changes

⚠️ **Migration Required**: ESP32 settings must be moved from weighbridges to workstations

**If you have existing ESP32 configurations:**
1. Backup database
2. Run migration or SQL scripts 11, 12, 13
3. Manually copy settings from weighbridges to workstations (SQL provided in feature docs)
4. Test floating panel functionality

#### Deployment

```bash
# Backend
cd Weighsoft.back.v1
./build.sh  # or build.bat on Windows
docker-compose up -d

# Frontend
cd Weighsoft.ui.v1
./build.sh  # or build.bat on Windows
docker-compose up -d

# Clear caches
docker exec weighsoft-back php artisan route:clear
docker exec weighsoft-back php artisan config:clear
```

---

## Version 0.10.4 (November 30, 2025)

### 🚀 Feature: ESP32 Relay Control Integration (Initial)

- ✅ Added ESP32 relay control for boom gates and traffic lights
- ✅ Added 8 fields to weighbridges table (4 IPs + 4 relay numbers)
- ✅ Created `$esp32Control` service for frontend
- ✅ Created `ESP32RelayController` backend proxy with JWT authentication
- ✅ Added control buttons to weighing create/update screens
- ✅ Integrated with `Weighsoft Relay Control` ESP32 firmware
- ✅ Documentation: `ESP32-RELAY-INTEGRATION.md`

---

## Version 0.10.3 (December 9, 2025)

### 🐛 Fixes

- Fixed duplicate transaction ID issue with counter increment
- Improved transaction counter reliability

---

## Earlier Versions

See `docs/archive/` for historical documentation.

