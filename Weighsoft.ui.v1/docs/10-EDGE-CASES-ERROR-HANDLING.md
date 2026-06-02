# Frontend Edge Cases and Error Handling

## Overview

This document covers edge cases, error scenarios, special conditions, and important implementation details specific to the Weighsoft frontend (AngularJS) application.

## Critical Implementation Details

### Camera Interval Cleanup Bug

**Location:** `app/js/controllers/weighing_create.js` line 1152 and `weighing_update.js` line 909

**Issue:** Syntax error in interval cleanup:

```javascript
vm.Cameras.forEach(function (mapData) {
    angular.isDefined(mapData.CameraTick);  // This line does nothing!
    {  // This block always executes
        $interval.cancel(mapData.CameraTick);
    }
});
```

**Problem:** `angular.isDefined()` returns a boolean but doesn't affect control flow. The cleanup block always executes, which may cause errors if `CameraTick` is undefined.

**Should be:**
```javascript
vm.Cameras.forEach(function (mapData) {
    if (angular.isDefined(mapData.CameraTick)) {
        $interval.cancel(mapData.CameraTick);
    }
});
```

**Impact:** May cause JavaScript errors when trying to cancel undefined intervals.

**Status:** Bug exists in both `weighing_create.js` and `weighing_update.js`.

### WebSocket Connection Management

**Location:** `app/js/controllers/weighing_create.js` and `weighing_update.js`

**Pattern:**
```javascript
vm.stopWebSocket(); // Stop before save
// ... save operation ...
vm.closeWebSocket(); // Close on success
vm.restartWebSocket(); // Restart on failure
```

**Edge Cases:**

1. **Save fails:** WebSocket is restarted, but if restart fails, weight updates stop working
2. **Multiple saves:** If user clicks save multiple times, WebSocket may be stopped/started multiple times
3. **Navigation during save:** If user navigates away during save, WebSocket may not be cleaned up
4. **Connection loss:** No automatic reconnection logic visible
5. **Controller destroy:** Cleanup in `$scope.$on('$destroy')` may not fire if navigation is immediate

**Impact:** Weight updates may stop working after failed saves or navigation.

**Recommendation:** Add connection state tracking and automatic reconnection logic.

### Data Preservation During Save

**Location:** `app/js/controllers/weighing_update.js` line 931

**Pattern:**
```javascript
vm.preservedSelections = {
    businessPartner: vm.selected_businessPartner ? angular.copy(vm.selected_businessPartner) : null,
    haulier: vm.selected_haulier ? angular.copy(vm.selected_haulier) : null,
    product: vm.selected_product ? angular.copy(vm.selected_product) : null,
    contract: vm.selected_contract ? angular.copy(vm.selected_contract) : null,
    pallet: vm.selected_pallet ? angular.copy(vm.selected_pallet) : null
};
```

**Edge Cases:**

1. **Circular references:** If objects have circular references, `angular.copy()` may fail or create infinite loops
2. **Large objects:** If objects are very large, copying may be slow and block UI
3. **Stale data:** If save takes a long time, preserved data may become stale
4. **Memory usage:** Multiple copies of large objects increase memory usage

**Impact:** May cause performance issues or errors with complex data structures.

### Numeric String Validation

**Location:** `app/js/controllers/weighing_create.js` line 1048

**Pattern:**
```javascript
function isNumericString(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}
```

**Edge Cases:**

1. **Leading/trailing spaces:** `" 123 "` - **FAILS** (not trimmed)
2. **Scientific notation:** `"1e5"` - **FAILS**
3. **Thousand separators:** `"1,000"` - **FAILS**
4. **Empty string:** `""` - **FAILS**
5. **Null/undefined:** **FAILS** (may cause error)
6. **Whitespace only:** `"   "` - **FAILS**
7. **Multiple decimals:** `"12.34.56"` - **FAILS** (correctly)

**Impact:** Users may enter valid-looking numbers that fail validation.

**Recommendation:** Trim values before validation:
```javascript
function isNumericString(value) {
    if (value == null || value === '') return false;
    return /^-?\d+(\.\d+)?$/.test(String(value).trim());
}
```

### Weight Value Edge Cases

**Location:** `app/js/controllers/weighing_create.js` lines 1116-1141

**Pattern:**
```javascript
if (vm.Site.measure_type === 'kg') {
    if (vm.Single.FirstWeight > 60000) {
        Error = Error + "Warning weight is above 60 Tons.\n";
        vm.isSaving = false;
    }
}
if (vm.Site.measure_type === 't') {
    if (vm.Single.FirstWeight > 60) {
        Error = Error + "Warning weight is above 60 Tons.\n";
        vm.isSaving = false;
    }
}
```

**Edge Cases:**

1. **String comparison:** If `FirstWeight` is a string, `>` comparison may not work as expected
2. **Null/undefined:** Comparison with null/undefined may cause errors
3. **Negative weights:** Negative weights are allowed (no check)
4. **Zero weight:** Zero weight is allowed (no check)
5. **Very large numbers:** No upper limit check (only warning at 60 tons)

**Impact:** Invalid weight values may pass validation or cause errors.

**Recommendation:** Convert to number before comparison:
```javascript
const firstWeight = parseFloat(vm.Single.FirstWeight);
if (!isNaN(firstWeight) && firstWeight > 60000) {
    // ...
}
```

### Data Loading Validation

**Location:** `app/js/controllers/weighing_create.js` lines 1012-1038

**Pattern:**
```javascript
if (vm.Setting.business_partner == "Yes" && vm.Single.businesspartner_id && 
    (!vm.selected_businessPartner || !vm.selected_businessPartner.report)) {
    Error = Error + "Business Partner data not fully loaded. Please reselect Business Partner.\n";
    vm.isSaving = false;
}
```

**Edge Cases:**

1. **ID set but object missing:** Product/Haulier/Business Partner ID is set, but the selected object is missing
2. **Object missing report property:** Object exists but doesn't have `report` property
3. **Race condition:** Data loading completes after validation runs
4. **Deleted entity:** Entity was deleted after selection but before save
5. **Network failure:** Data loading failed silently

**Impact:** Users may be unable to save even though they've made valid selections.

**Behavior:** Prevents save and requires user to reselect.

### Empty String vs Null Handling

**Pattern:** Throughout controllers, empty strings and null are treated differently:

```javascript
if (vm.Single.RegNumber == null || vm.Single.RegNumber == "") {
    Error = Error + "Please enter the Numberplate.\n";
}
```

**Edge Cases:**

1. **Empty string vs null:** Both are checked, but behavior may differ
2. **Whitespace:** `"   "` (whitespace only) - **PASSES** (not trimmed)
3. **Undefined:** `undefined` - **PASSES** (not checked)
4. **Zero:** `0` - **PASSES** (may be valid for some fields)

**Impact:** Invalid data may pass validation.

**Recommendation:** Use consistent validation:
```javascript
if (!vm.Single.RegNumber || !vm.Single.RegNumber.trim()) {
    Error = Error + "Please enter the Numberplate.\n";
}
```

### Numberplate Verification

**Location:** `app/js/controllers/weighing_create.js` lines 1083-1092

**Pattern:**
```javascript
if (
    vm.Setting.numberplate_recognition == "Yes" &&
    vm.Setting.numberplate_1 == "Yes" &&
    vm.Single.actiontype != "Edit" &&
    (vm.Single.NumberplateVerify == "danger" || vm.Single.NumberplateVerify == "warning")
) {
    Error = Error + "Please Verify Numberplate.\n";
    vm.isSaving = false;
}
```

**Edge Cases:**

1. **Edit mode:** Verification is skipped in Edit mode (`actiontype == "Edit"`)
2. **Verification states:** Only "danger" and "warning" are checked, other states may pass
3. **Settings combination:** Requires both `numberplate_recognition` and `numberplate_1` to be "Yes"
4. **Case sensitivity:** String comparisons are case-sensitive

**Impact:** Numberplate verification may be bypassed in Edit mode.

### Custom Field Validation

**Location:** `app/js/controllers/weighing_create.js` lines 1094-1110

**Pattern:**
```javascript
for (let i = 1; i <= 20; i++) {
    let input = vm.Setting[`user_defined_input${i}`];
    let customField = vm.Single[`Custom${i}`];
    
    if (input == 'SC' && (customField == null || customField == "")) {
        Error = Error + `Please enter CustomField ${i}.\n`;
        vm.isSaving = false;
    }
    
    if (input == "TC" && (customField == null || customField == "")) {
        Error = Error + `Please enter CustomField ${i}.\n`;
        vm.isSaving = false;
    }
}
```

**Edge Cases:**

1. **Input types:** Only 'SC' (String Custom) and 'TC' (Text Custom) are validated
2. **Other input types:** 'N' (None), 'DD' (Dropdown), etc. are not validated
3. **Whitespace:** Whitespace-only strings pass validation
4. **Case sensitivity:** String comparison is case-sensitive ('SC' vs 'sc')

**Impact:** Some custom field types may not be properly validated.

### Weight Calculation Edge Cases

**Location:** `app/js/controllers/weighing_create.js` lines 1159-1174

**Pattern:**
```javascript
if (vm.Setting.type_of_weighing !== "1" && vm.Setting.tares_enabled !== 'true') {
    vm.Single.SecondWeight = 0;
} else {
    vm.Single.NettWeight = vm.nettWeight > 0 ? vm.nettWeight : Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
    vm.Single.TotalWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
}

if (vm.Setting.type_of_weighing === "1") {
    vm.Single.SecondWeight = 0;
}
```

**Edge Cases:**

1. **Single weighing:** SecondWeight is set to 0, but calculation still uses it
2. **Negative net weight:** `Math.abs()` ensures positive, but may hide calculation errors
3. **Zero weights:** If both weights are 0, net weight is 0 (may be invalid)
4. **Calculation order:** NettWeight uses `vm.nettWeight` if > 0, otherwise calculates from weights
5. **Tares enabled:** Different calculation path when tares are enabled

**Impact:** Net weight calculation may not match expected values in edge cases.

### Print Flow Edge Cases

**Location:** `app/js/controllers/weighing_create.js` lines 1194-1214

**Pattern:**
```javascript
if (vm.Setting.print_ticket !== "2" && vm.Setting.print_ticket !== 'N') {
    vm.SetReportingData(data);
    setTimeout(function () {
        window.print();
        setTimeout(function () {
            // Cleanup and navigation
        }, 100);
    }, 100);
}
```

**Edge Cases:**

1. **Print dialog cancellation:** If user cancels print dialog, cleanup still runs
2. **Print settings:** Only checks for "2" and "N", other values may enable printing
3. **Timing:** Fixed 100ms delays may not be sufficient on slow systems
4. **Navigation during print:** If user navigates during print, cleanup may not run
5. **Multiple prints:** If save is called multiple times, multiple print dialogs may open

**Impact:** Print flow may not work correctly in all scenarios.

### Error Handling Patterns

**Location:** Throughout controllers

**Pattern:**
```javascript
Restangular.all("weighingheaders")
    .post(vm.Single)
    .then(
        function (data) {
            // Success handler
        },
        function (response) {
            $rootScope.Error(response);
            vm.isSaving = false;
            vm.restartWebSocket();
        }
    );
```

**Edge Cases:**

1. **Error response format:** Assumes `$rootScope.Error()` can handle all response formats
2. **Network timeout:** No explicit timeout handling
3. **Partial failures:** If some operations succeed and others fail, state may be inconsistent
4. **Error recovery:** WebSocket is restarted, but other state may not be reset

**Impact:** Errors may not be handled gracefully in all scenarios.

### State Preservation

**Location:** `app/js/controllers/weighing_create.js` and `weighing_update.js`

**Pattern:**
```javascript
vm.HeaderSingle = {
    company_id: $stateParams.company_id,
    site_id: $stateParams.site_id,
    workstation_id: $stateParams.workstation_id,
    // ...
};
```

**Edge Cases:**

1. **Missing parameters:** If state parameters are missing, values are undefined
2. **Parameter changes:** If parameters change after initialization, values may be stale
3. **Navigation:** State parameters may be lost on navigation
4. **Browser back/forward:** State parameters may not be preserved

**Impact:** Application state may be lost or incorrect.

### Data Table Edge Cases

**Location:** Various list controllers

**Pattern:** DataTables initialization with various options

**Edge Cases:**

1. **Empty data:** DataTables may not initialize correctly with empty arrays
2. **Large datasets:** Performance may degrade with very large datasets
3. **Column visibility:** Hidden columns may cause layout issues
4. **Responsive mode:** May not work correctly on all screen sizes
5. **Export functionality:** May fail with special characters in data

**Impact:** Data tables may not work correctly in all scenarios.

### Lazy Loading Edge Cases

**Location:** `app/js/routes.js`

**Pattern:** `oc.lazyLoad` for loading assets on demand

**Edge Cases:**

1. **Asset loading failure:** If asset fails to load, state may not be accessible
2. **Network issues:** Slow networks may cause timeouts
3. **Asset conflicts:** Multiple states loading same assets may cause conflicts
4. **Cache issues:** Cached assets may be stale

**Impact:** States may not load correctly if assets fail to load.

## Known Issues

### TODO Comments

**Location:** `app/js/controllers/weighing_old.js`

**Comments:**
- Line 706: `//TODO : Check single Company, site`
- Line 1099: `//TODO: Fix contracts`
- Line 1467: `//TODO only once the weighbridge is loaded ??`
- Line 1610: `//TODO: vm.deriveContractStatus();`
- Line 1674: `//TODO: Retest Delete Form`

**Status:** These TODOs indicate incomplete or untested functionality in the legacy controller.

**Note:** `weighing_old.js` appears to be a legacy controller that may not be actively used.

### Debug Console Logs

**Location:** Multiple controllers

**Pattern:**
```javascript
console.log("VALUE FROM WEIGHT:", value, pass);
console.log("FirstWeight: " + vm.Single.FirstWeight);
console.log("SecondWeight: " + vm.Single.SecondWeight);
console.log('SAVE SINGLE', vm.Single);
console.log('SAVE DATA', data);
```

**Status:** Debug console logs are present in production code.

**Impact:** May expose sensitive data in browser console.

**Recommendation:** Remove or conditionally enable debug logs in production.

### Commented Code

**Location:** `app/js/controllers/weighing_create.js` lines 1111-1115

**Pattern:**
```javascript
// if (vm.Single.actiontype === "Edit" && vm.Single.contract_id != vm.selected_contract.linked_contract_id)
// {
//     const excessContractAmount = vm.Single.contract_remaining_amount - Math.abs(vm.nettWeight);
//     if (excessContractAmount < 0) Error = Error + "You have exceeded the contract amount by " + Math.abs(excessContractAmount) + " kgs \n Please reduce and retake the weighing.";
// }
```

**Status:** Contract amount validation is commented out.

**Impact:** Contract amount exceeding may not be validated in Edit mode.

## Recommendations

### High Priority

1. **Fix camera interval cleanup** syntax error in `weighing_create.js` and `weighing_update.js`
2. **Add input trimming** for string validations
3. **Improve WebSocket error handling** and reconnection logic
4. **Remove debug console logs** from production code
5. **Fix numeric validation** to handle edge cases

### Medium Priority

1. **Improve error messages** for better user experience
2. **Add timeout handling** for API calls
3. **Improve state preservation** across navigation
4. **Add loading indicators** for long operations
5. **Document print flow** behavior

### Low Priority

1. **Review and remove TODO comments**
2. **Clean up commented code**
3. **Standardize error handling** patterns
4. **Add unit tests** for edge cases
5. **Improve data table** error handling

## Testing Recommendations

### Edge Cases to Test

1. **WebSocket disconnection** - Verify cleanup and reconnection
2. **Camera interval cleanup** - Verify no memory leaks
3. **Numeric validation** - Test with spaces, scientific notation, etc.
4. **Weight calculations** - Test with zero, negative, and very large values
5. **Data loading failures** - Test with network errors
6. **State navigation** - Test parameter preservation
7. **Print flow** - Test with print dialog cancellation
8. **Custom field validation** - Test all input types
9. **Numberplate verification** - Test all verification states
10. **Save race conditions** - Test multiple rapid saves

## Related Documentation

- **[09-SETTINGS-WEIGHING-INTEGRATION.md](./09-SETTINGS-WEIGHING-INTEGRATION.md)** - Settings and weighing integration
- **[01-CONTROLLERS.md](./01-CONTROLLERS.md)** - Controller documentation
- **[05-APPLICATION-INITIALIZATION.md](./05-APPLICATION-INITIALIZATION.md)** - Error handling patterns
- **[08-WIDGETS-FACTORIES.md](./08-WIDGETS-FACTORIES.md)** - WebSocket factory documentation

