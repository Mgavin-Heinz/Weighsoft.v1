# Smart Hauliers - Bug Fixes Log

## Bug #1: 500 Error on `/api/rfidvehicle` endpoint

**Reported:** Console error when loading RFID Vehicles page
**Status:** ✅ FIXED
**Commit:** e5be6a1

### Symptoms:
```
:5000/api/rfidvehicle?token=...  
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

### Root Causes:

1. **Typo in query filter:**
   ```php
   // ❌ BEFORE (WRONG)
   ->where('company_type', '=', $_GET['company'])
   
   // ✅ AFTER (CORRECT)
   ->where('company_id', '=', $_GET['company'])
   ```
   - Column `company_type` doesn't exist in `rfid_vehicles` table
   - Should be `company_id`

2. **Missing eager loading:**
   ```php
   // ❌ BEFORE - N+1 query problem
   $rfidVehicles = $rfidVehicles->get();
   
   // ✅ AFTER - Efficient eager loading
   $rfidVehicles = $rfidVehicles->with(['company', 'haulier', 'site'])->get();
   ```

3. **Inefficient company lookup:**
   ```php
   // ❌ BEFORE - Manual dictionary creation
   $companies = (new Company())
       ->whereIn('id', array_unique(array_map($func, $rfidVehicles->toArray())))
       ->get(['id', 'registered_name']);
   
   // ✅ AFTER - Eloquent relationships (automatic)
   $rfidVehicle->company_name = $rfidVehicle->company ? 
       $rfidVehicle->company->registered_name : null;
   ```

4. **Poor error handling:**
   ```php
   // ❌ BEFORE - Returns plain text, no logging
   return response()->json($th->getMessage(), 500);
   
   // ✅ AFTER - Logs error with stack trace, returns JSON
   Log::error('RFIDVehicleController@index error: ' . $th->getMessage());
   Log::error('Stack trace: ' . $th->getTraceAsString());
   return response()->json(['error' => $th->getMessage()], 500);
   ```

### Fix Applied:

**File:** `app/Http/Controllers/RFIDVehicleController.php`

**Changes:**
- Fixed typo: `company_type` → `company_id`
- Added eager loading for relationships: `->with(['company', 'haulier', 'site'])`
- Simplified company name retrieval using Eloquent relationships
- Added formatted fields: `company_name`, `haulier_name`, `site_name`
- Improved error logging with stack trace
- Return proper JSON error response

### Testing:

After fix, the endpoint should return:
```json
[
  {
    "id": 1,
    "registration_number": "ABC123GP",
    "rfid": "12345",
    "haulier_id": 10,
    "site_id": 5,
    "company_id": 3,
    "company_name": "Company Name",
    "haulier_name": "Fast Transport",
    "site_name": "Main Site",
    "company": {...},
    "haulier": {...},
    "site": {...}
  }
]
```

### Prevention:

- ✅ Always check column names match database schema
- ✅ Use eager loading (`->with()`) for relationships
- ✅ Always log errors with stack traces for debugging
- ✅ Return JSON error responses for API endpoints

---

## Future Bug Tracking

Add additional bugs here as they are discovered and fixed.

