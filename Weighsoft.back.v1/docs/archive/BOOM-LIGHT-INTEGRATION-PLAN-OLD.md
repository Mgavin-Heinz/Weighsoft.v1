# Boom and Light Integration Plan

## Overview

Add 4 entities to weighbridge configuration:
1. **Incoming Boom** - IP address, JSON control (open/close)
2. **Exiting Boom** - IP address, JSON control (open/close)
3. **Incoming Light** - IP address, JSON control (on/off)
4. **Exiting Light** - IP address, JSON control (on/off)

## Architecture Approach

### Option 1: Direct Frontend Control (Recommended)
- Frontend sends JSON directly to device IPs
- No backend API needed
- Simpler, faster
- Similar to how scale service works

### Option 2: Backend Proxy
- Frontend calls backend API
- Backend sends JSON to device IPs
- More control, logging, error handling
- More complex

**Recommendation: Option 1** (matches existing scale service pattern)

## Implementation Steps

### Step 1: Database Migration
Add 4 new fields to `weighbridges` table:
- `incoming_boom_ip` (string, nullable)
- `exiting_boom_ip` (string, nullable)
- `incoming_light_ip` (string, nullable)
- `exiting_light_ip` (string, nullable)

### Step 2: Backend Updates
1. **Migration:** Add columns to weighbridges table
2. **Model:** Add fields to `$fillable` array
3. **Controller:** Add defaults in `setDefaults()` method

### Step 3: Frontend Weighbridge Configuration
1. **Form:** Add 4 IP address input fields in weighbridge form
2. **Validation:** Optional IP format validation
3. **Save:** Include new fields when saving weighbridge

### Step 4: Frontend Service/Factory
Create service to control boom/light devices:
- `controlBoom(ip, action)` - action: 'open' or 'close'
- `controlLight(ip, action)` - action: 'on' or 'off'
- Uses `$http.post()` to send JSON to device IPs

### Step 5: Weighing Screen Integration
Add controls to `weighing_create.js` and `weighing_update.js`:
- Buttons for each device (Incoming Boom Open/Close, etc.)
- Use weighbridge data loaded from settings
- Call service methods to control devices
- Show status/feedback

## JSON Format Assumptions

**Boom Control:**
```json
POST http://{ip}/boom
{
  "action": "open" | "close"
}
```

**Light Control:**
```json
POST http://{ip}/light
{
  "action": "on" | "off"
}
```

*Note: Actual JSON format may differ - will need to confirm with device specifications*

## Files to Modify

### Backend
1. `database/migrations/YYYY_MM_DD_add_boom_light_to_weighbridges.php` (NEW)
2. `database_scripts/9-addBoomLightIPs.sql` (NEW - for systems without migrations)
3. `app/Models/Weighbridge.php`
4. `app/Http/Controllers/WeighbridgeController.php`

**Note:** Database scripts should use simple ALTER TABLE statements rather than complex stored procedures. Keep SQL scripts straightforward and easy to understand.

### Frontend
1. `app/js/controllers/weighbridge.js` - Add form fields
2. `app/js/services.js` or new factory - Boom/Light control service
3. `app/js/controllers/weighing_create.js` - Add controls
4. `app/js/controllers/weighing_update.js` - Add controls
5. `app/tpls/weighbridge/weighbridge.html` - Add form fields
6. `app/tpls/weighing/create.html` - Add control buttons
7. `app/tpls/weighing/update.html` - Add control buttons

## Questions to Confirm

1. **JSON Format:** What is the exact JSON format the devices expect?
2. **Endpoint:** What is the endpoint path? (e.g., `/boom`, `/light`, `/control`, etc.)
3. **HTTP Method:** POST only, or also GET/PUT?
4. **Response:** What response format do devices return?
5. **Error Handling:** How should we handle device offline/unreachable?
6. **Auto Control:** Should booms/lights auto-control based on weighing status, or manual only?

## Next Steps

1. Confirm JSON format and endpoints with device specifications
2. Create database migration
3. Update backend model and controller
4. Update frontend weighbridge form
5. Create control service
6. Add controls to weighing screens
7. Test with actual devices

