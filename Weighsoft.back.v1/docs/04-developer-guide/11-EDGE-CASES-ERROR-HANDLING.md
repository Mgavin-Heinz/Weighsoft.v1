# Edge Cases and Error Handling

## Overview

This document covers edge cases, error scenarios, special conditions, and important implementation details that may not be immediately obvious from the main documentation.

## Critical Implementation Details

### UUID Handling Edge Cases

#### Race Condition in `getLastUpdatedItem()`

**Location:** `app/Services/WeighingHeaderService.php::getLastUpdatedItem()`

**Issue:** Uses `ORDER BY updated_at DESC LIMIT 1` to get the last inserted item. This can fail if:
- Multiple inserts happen in the same millisecond
- Database clock is not synchronized
- Transaction isolation level allows concurrent reads

**Current Implementation:**
```php
public function getLastUpdatedItem()
{
    $sql = "
        SELECT weighingheaders.*, BIN_TO_UUID(id, TRUE) as id2
        FROM weighingheaders
        ORDER BY updated_at DESC
        LIMIT 1;
    ";
    return DB::select($sql)[0];
}
```

**Risk:** In high-concurrency scenarios, this may return the wrong record.

**Recommendation:** Use `LAST_INSERT_ID()` or return the UUID from the insert operation directly.

#### UUID Conversion in Queries

**Pattern:** All UUID queries use `UUID_TO_BIN(?, TRUE)` and `BIN_TO_UUID(id, TRUE)`.

**Edge Case:** If a UUID string is malformed or invalid, the query will fail silently or return no results.

**Error Handling:** No explicit validation of UUID format before querying.

### Field Preservation in Updates

**Location:** `app/Services/WeighingHeaderService.php::updateWeighingHeader()`

**Important Detail:** The update method uses a "preserve fields" pattern:

```php
$preserveFields = [
    'RegNumber', 'RegNumber2', 'RegNumber3',
    'Custom1', 'Custom2', ... // All custom fields
    'businesspartner_id', 'product_id', ...
];

foreach ($preserveFields as $field) {
    if (array_key_exists($field, $weighingHeader)) {
        $setParts[] = "$field = ?";
        $parameters[] = $weighingHeader[$field];
    }
}
```

**Behavior:** 
- Fields NOT in the `$weighingHeader` array are **preserved** (not updated)
- Fields explicitly set to `null` in the array **will be updated to null**
- This is intentional to allow partial updates

**Edge Case:** If you want to clear a field, you must explicitly pass `null`. Simply omitting the field will preserve the existing value.

### SQL Syntax Error in ContractTransactionService

**Location:** `app/Services/ContractTransactionService.php::getOne()` line 60

**Issue:** SQL syntax error:
```php
DB::raw("UUID_TO_BIN(id, TRUE) as id2. UUID_TO_BIN(weighing_header_id, TRUE) as weighing_header_id2")
```

**Problem:** Missing comma between `id2` and `UUID_TO_BIN`.

**Should be:**
```php
DB::raw("BIN_TO_UUID(id, TRUE) as id2, BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id2")
```

**Impact:** This method likely doesn't work correctly. Needs to be fixed.

### Status Filter Logic

**Location:** `app/Services/WeighingHeaderService.php::getWeighingHeaders()`

**Important Detail:** Status filter uses `<>` (not equals) instead of `=`:

```php
if (isset($status) && !empty($status)) {
    array_push($filters, "status <> ?");
    array_push($parameters, $_GET['status']);
}
```

**Behavior:** This **excludes** records with the specified status, rather than including them.

**Example:** If `status=CLOSED`, the query returns all records **except** CLOSED ones.

**This may be intentional** for filtering out certain statuses, but it's counter-intuitive.

## Error Handling Patterns

### Contract Transaction Error Handling

**Location:** `app/Services/ContractTransactionService.php::insertItem()`

**Pattern:**
```php
try {
    DB::insert($sql, $params);
} catch (\Exception $e) {
    Log::error('Error inserting contract transaction: ' . $e->getMessage());
    Log::error('SQL Query: ' . $sql);
    Log::error('Parameters: ' . json_encode($params));
    throw $e; // Re-throw
}
```

**Behavior:**
- Errors are logged with full context
- Exception is re-thrown (not swallowed)
- Caller must handle the exception

**Edge Case:** If logging fails, the exception is still thrown, but context may be lost.

### AS/400 Export Error Handling

**Location:** `app/Http/Controllers/WeighingHeadersController.php::update()`

**Pattern:**
```php
if ($settings["export_AS400"] != "false") {
    // ... build export string ...
    try {
        file_put_contents($settings["export_AS400"], $as400 . "\r\n", FILE_APPEND | LOCK_EX);
    } catch (Exception $e) {
        DB::rollback(); // Rollback entire transaction
        throw $e;
    }
}
```

**Behavior:**
- If file write fails, **entire database transaction is rolled back**
- This means the weighing update is **not saved** if export fails

**Impact:** High - Export failure prevents weighing completion.

**Recommendation:** Consider making export non-blocking or using a queue.

### Weighing Header Deletion

**Location:** `app/Services/WeighingHeaderService.php::deleteWeighingHeader()`

**Pattern:** Soft delete with reason:
```php
UPDATE weighingheaders
SET reason = ?, deleted_at = ?, deletedUserId = ?
WHERE id = UUID_TO_BIN(?, TRUE)
```

**Behavior:**
- Uses soft delete (sets `deleted_at`)
- Stores deletion reason
- Stores user who deleted
- **Does not delete related transactions or cameras**

**Edge Case:** Related `weighingtransactions` and `weighingcameras` are not automatically deleted. They remain in the database.

## Data Validation Edge Cases

### Empty String vs Null Handling

**Pattern:** Throughout the codebase, empty strings and null are treated differently:

```php
if (isset($data['businesspartner_id']) && ($data['businesspartner_id'] == "" || $data['businesspartner_id'] == null)) {
    unset($data['businesspartner_id']);
}
```

**Behavior:**
- Empty strings (`""`) are converted to `null` by unsetting
- This prevents storing empty strings in the database
- **But:** If a field is required and you pass `""`, it may pass validation but fail at database level

### Numeric String Validation

**Location:** Frontend `weighing_create.js`

**Pattern:**
```javascript
function isNumericString(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}
```

**Edge Cases:**
- Leading/trailing spaces: `" 123 "` - **FAILS** (not trimmed)
- Scientific notation: `"1e5"` - **FAILS**
- Thousand separators: `"1,000"` - **FAILS**
- Empty string: `""` - **FAILS**
- Null/undefined: **FAILS** (may cause error)

**Recommendation:** Trim values before validation.

### Weight Value Edge Cases

**Location:** `app/Http/Controllers/WeighingHeadersController.php::update()`

**Pattern:**
```php
$grossWeight = abs((int) $data['FirstWeight'] - (int) $data['SecondWeight']);
```

**Edge Cases:**
- **Negative weights:** Converted to positive via `abs()`
- **Decimal weights:** Truncated to integer via `(int)`
- **String weights:** Converted to integer (may lose precision)
- **Null weights:** Converted to 0

**Impact:** 
- Decimal precision is lost
- Negative differences become positive (may be intentional for gross weight)

## Business Logic Edge Cases

### Contract Amount Exceeding

**Location:** `app/Http/Controllers/WeighingHeadersController.php::update()`

**Pattern:** Linked contract handling:
```php
if ($eligibleContractAmount >= $net) {
    // Use main contract
} elseif ($newcontract && $eligibleContractAmount < $net) {
    // Split between main and linked contract
    if ($eligibleLinkedContractAmount >= $net - $eligibleContractAmount) {
        // Create transaction for excess
    } else {
        return response()->json(['error' => 'Linked contract cannot handle the excess amount!'], 400);
    }
} else {
    return response()->json(['error' => 'Contract amount over is not allowed!'], 400);
}
```

**Edge Cases:**
- **Exact match:** `eligibleContractAmount == $net` - Uses main contract only
- **Slight overage:** If linked contract exists, splits the amount
- **No linked contract:** Returns error if main contract insufficient
- **Linked contract insufficient:** Returns error

**Important:** The system **allows** exceeding contract amounts if a linked contract exists and has capacity.

### Status Determination Logic

**Location:** `app/Http/Controllers/WeighingHeadersController.php::store()`

**Pattern:**
```php
if ($settings["silo_verification"] == "Yes" && $data["SiloOverride"] != "Yes") {
    $data["status"] = "VERIFY";
} else if ($settings["type_of_weighing"] != "1" && $settings["tares_enabled"] != "true") {
    $data["status"] = "OPEN";
} else {
    $data["status"] = "CLOSED";
}
```

**Edge Cases:**
1. **Silo verification enabled + no override:** Status = VERIFY
2. **Double weighing + tares disabled:** Status = OPEN
3. **All other cases:** Status = CLOSED

**Important:** Single weighing (`type_of_weighing == "1"`) with tares disabled results in CLOSED status immediately.

### Transaction Number Generation

**Location:** `app/Http/Controllers/WeighingHeadersController.php::store()`

**Pattern:**
```php
$Transactions = $Transactions->where('company_id', '=', $data['company_id']);
$Transactions = $Transactions->where('site_id', '=', $data['site_id']);
$Transactions = $Transactions->where('settings_id', '=', $data['settings_id']);
$Transactions = $Transactions->get();

if (count($Transactions) == 0) {
    $Transaction = [];
    $Transaction["current_id"] = 1;
    $Transactions = [(new Transactions)->create($Transaction)];
}

$data["transaction"] = $settings["prefix"] . $Transactions[0]["current_id"];
$Transactions[0]["current_id"] = $Transactions[0]["current_id"] + 1;
$Transactions[0]->save();
```

**Edge Cases:**
- **Race condition:** If two requests create transactions simultaneously, they may get the same number
- **No transaction record:** Creates new record with `current_id = 1`
- **Transaction number format:** `{prefix}{number}` (e.g., "WB001")

**Risk:** In high-concurrency scenarios, duplicate transaction numbers are possible.

**Recommendation:** Use database transactions with row locking.

### Weight Ordering in Single Weighing

**Location:** `app/Http/Controllers/WeighingHeadersController.php::store()`

**Pattern:** For single weighing or tares enabled:
```php
if ($settings["type_of_weighing"] == "1" || $settings->tares_enabled == "true") {
    $firstTransaction->Weight1 = $data["SecondWeight"]; // Note: SecondWeight first!
    $firstTransaction->Status = "2";
    
    $secondTransaction->Weight1 = $data["FirstWeight"]; // Then FirstWeight
    $secondTransaction->Status = "1";
}
```

**Important:** The weights are **reversed** in the transaction records:
- First transaction stores `SecondWeight` with Status "2"
- Second transaction stores `FirstWeight` with Status "1"

**This may be intentional** to match the order they were entered, but it's counter-intuitive.

## Data Loading Edge Cases

### Static LoadData Methods

**Pattern:** Multiple controllers have static `LoadData()` methods that throw exceptions:

```php
public static function LoadData($companyId, $siteId, $workstationId)
{
    if (empty($workstationId) || empty($siteId) || empty($companyId)) {
        throw new Exception("Please select Company, Site, and Workstation", 1);
    }
    // ...
}
```

**Edge Cases:**
- **Empty string:** `""` is considered empty, throws exception
- **Null:** Throws exception
- **Zero:** `0` is considered empty by `empty()`, throws exception
- **Whitespace:** Not trimmed, may pass `empty()` check

**Recommendation:** Use explicit null checks and trim strings.

### Product/Haulier Data Loading Validation

**Location:** Frontend `weighing_create.js`

**Pattern:**
```javascript
if (vm.Setting.use_product_list == "Yes" && vm.Single.product_id && 
    (!vm.selected_product || !vm.selected_product.report)) {
    Error = Error + "Product data not fully loaded. Please reselect Product.\n";
}
```

**Edge Case:** 
- Product ID is set, but `selected_product` object is missing or incomplete
- This can happen if:
  - Product was deleted after selection
  - Product data failed to load
  - Race condition in data loading

**Behavior:** Prevents save and requires user to reselect.

## Configuration Edge Cases

### Settings Field Types

**Pattern:** Many settings fields use string values for boolean logic:

```php
if ($settings["tares_enabled"] == "true") { // String comparison
if ($settings["enable_moisture"] == "true") {
if ($settings["export_AS400"] != "false") { // Note: checks for "false" string
```

**Edge Cases:**
- `"true"` (string) vs `true` (boolean) - Only string works
- `"True"` (capitalized) - **FAILS** (case-sensitive)
- `"1"` or `1` - **FAILS** (not recognized as true)
- Empty string `""` - **FAILS** (not recognized as false)

**Impact:** Settings must be stored as lowercase strings `"true"` or `"false"`.

### Export AS/400 Configuration

**Pattern:**
```php
if ($settings["export_AS400"] != "false" && $settings["export_AS400"] != "") {
    // Export
}
```

**Edge Cases:**
- Empty string `""` - **DISABLES** export
- `"false"` - **DISABLES** export
- `"False"` - **ENABLES** export (case-sensitive)
- `null` - **ENABLES** export (not checked)
- File path string - **ENABLES** export

**Behavior:** Export is enabled if the field is any non-empty string that is not exactly `"false"`.

## Frontend Edge Cases

### WebSocket Connection Management

**Location:** Frontend `weighing_create.js` and `weighing_update.js`

**Pattern:**
```javascript
vm.stopWebSocket(); // Stop before save
// ... save operation ...
// WebSocket may or may not restart
```

**Edge Cases:**
- **Save fails:** WebSocket may remain stopped
- **Multiple saves:** WebSocket may be stopped multiple times
- **Navigation during save:** WebSocket may not be cleaned up
- **Connection loss:** No automatic reconnection logic visible

**Impact:** Weight updates may stop working after failed saves.

### Camera Interval Cleanup

**Location:** Frontend `weighing_update.js`

**Pattern:**
```javascript
if (vm.Cameras && vm.Cameras.length > 0) {
    vm.Cameras.forEach(function(mapData) {
        if (angular.isDefined(mapData.CameraTick)) {
            clearInterval(mapData.CameraTick);
        }
    });
}
```

**Edge Case:** 
- Syntax error: `angular.isDefined(mapData.CameraTick);` followed by `{` - the condition is not actually used
- Should be: `if (angular.isDefined(mapData.CameraTick)) {`

**Impact:** Intervals may not be cleaned up properly, causing memory leaks.

### Data Preservation During Save

**Location:** Frontend `weighing_update.js`

**Pattern:**
```javascript
vm.preservedSelections = {
    businessPartner: vm.selected_businessPartner ? angular.copy(vm.selected_businessPartner) : null,
    // ...
};
```

**Edge Case:**
- If `selected_businessPartner` is an object with circular references, `angular.copy()` may fail
- If object is very large, copying may be slow
- If save takes a long time, preserved data may become stale

## Known Issues

### TODO Comments

**Location:** `app/Console/Commands/SendDailyEmail.php` line 13

**Comment:** `//TODO:Remove`

**Status:** Unclear what should be removed. Command may be deprecated.

### Debug Mode Handling

**Location:** `app/Services/ReportEmailer.php` and `app/Mail/Report.php`

**Pattern:**
```php
$this->debug = App::hasDebugModeEnabled();
if ($this->debug) {
    // Additional logging or behavior
}
```

**Behavior:** Debug mode affects email sending behavior, but exact differences are not documented.

## Recommendations

### High Priority

1. **Fix SQL syntax error** in `ContractTransactionService::getOne()`
2. **Fix camera interval cleanup** syntax error in frontend
3. **Add UUID validation** before database queries
4. **Fix race condition** in transaction number generation
5. **Document status filter behavior** (exclusion vs inclusion)

### Medium Priority

1. **Make AS/400 export non-blocking** or use queue
2. **Add transaction locking** for concurrent operations
3. **Improve error messages** for better debugging
4. **Add input trimming** for string validations
5. **Document debug mode behavior**

### Low Priority

1. **Clarify weight ordering** in transaction records
2. **Standardize boolean settings** (use actual booleans)
3. **Add automatic WebSocket reconnection**
4. **Review and remove TODO comments**

## Testing Recommendations

### Edge Cases to Test

1. **Concurrent transaction creation** - Verify no duplicate numbers
2. **UUID format validation** - Test with invalid UUIDs
3. **Empty string vs null** - Verify consistent behavior
4. **Settings case sensitivity** - Test with capitalized values
5. **Export failure scenarios** - Verify transaction rollback
6. **Contract amount exceeding** - Test all split scenarios
7. **WebSocket disconnection** - Verify cleanup and reconnection
8. **Camera interval cleanup** - Verify no memory leaks

## Related Documentation

- **[07-BUSINESS-LOGIC.md](./07-BUSINESS-LOGIC.md)** - Main business logic documentation
- **[10-BUSINESS-RULES-VALIDATION.md](./10-BUSINESS-RULES-VALIDATION.md)** - Validation rules
- **[04-INTEGRATIONS.md](./04-INTEGRATIONS.md)** - Integration details including AS/400 export

