# Business Rules and Validation Logic

## Overview

This document provides comprehensive documentation of all business rules, validation logic, and constraints in the Weighsoft system. This complements the business logic documentation by focusing on validation rules, constraints, and edge cases.

## Weight Validation Rules

### Numeric Validation

**Rule:** All weight values must be valid numeric strings.

**Validation:**
```javascript
function isNumericString(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
}
```

**Applies To:**
- `FirstWeight` - Must be numeric
- `SecondWeight` - Must be numeric

**Error Message:**
- "Text is invalid for FirstWeight, Please enter a number."
- "Text is invalid for SecondWeight, Please enter a number."

### Maximum Weight Warnings

**Rule:** Weight values above 60 tons trigger a warning.

**Validation by Measure Type:**

**For `kg` (kilograms):**
```javascript
if (vm.Site.measure_type === 'kg') {
    if (vm.Single.FirstWeight > 60000) {
        Error += "Warning weight is above 60 Tons.\n";
    }
    if (vm.Single.SecondWeight > 60000) {
        Error += "Warning weight is above 60 Tons.\n";
    }
}
```

**For `t` (tons):**
```javascript
if (vm.Site.measure_type === 't') {
    if (vm.Single.FirstWeight > 60) {
        Error += "Warning weight is above 60 Tons.\n";
    }
    if (vm.Single.SecondWeight > 60) {
        Error += "Warning weight is above 60 Tons.\n";
    }
}
```

**Note:** This is a warning, not a hard error. The save operation is blocked (`vm.isSaving = false`) but the user is informed.

### Weight Entry Requirements

**Rule:** Weight entry requirements depend on weighing type.

**Single Weighing (type_of_weighing = "1"):**
- `SecondWeight` must be entered (cannot be 0)
- `FirstWeight` is optional for new entries

**Double Weighing (type_of_weighing = "2"):**
- Both `FirstWeight` and `SecondWeight` must be entered
- Neither can be 0

**Validation:**
```javascript
// Single weighing requires second weight
if (vm.Setting.type_of_weighing == "1" && vm.Single.SecondWeight == 0) {
    Error += "Please enter Second Weight.\n";
}

// Double weighing requires both weights
if (vm.Setting.type_of_weighing == "2" && 
    (vm.Single.FirstWeight == 0 || vm.Single.SecondWeight == 0)) {
    Error += "Please enter both First and Second Weights.\n";
}

// For existing records, second weight is always required
if (typeof vm.Single.id !== "undefined" && 
    (typeof vm.Single.SecondWeight === "undefined" || vm.Single.SecondWeight == 0)) {
    Error += "Please enter the second weight.\n";
}
```

## Stable Weight Sampling

### Overview

**Purpose:** Ensure weight readings are stable before accepting them.

**Configuration:** `weighbridges.stable_samples` - Number of consecutive stable samples required.

### Sampling Logic

**Rule:** Weight must remain the same for `stable_samples` consecutive readings.

**Process:**
1. Maintain array of weight samples (`weightSamples`)
2. On each weight reading:
   - If weight equals last sample: Add to array
   - If weight differs: Reset array with new weight
3. Keep array length limited to `requiredStableSamples`
4. When array length equals `requiredStableSamples`: Weight is stable

**Implementation:**
```javascript
const requiredStableSamples = parseInt(vm.WeighBridge.stable_samples);

if (vm.weightSamples.length === 0 || 
    vm.weightSamples[vm.weightSamples.length - 1] === newWeight) {
    vm.weightSamples.push(newWeight);
    
    // Keep array length limited
    if (vm.weightSamples.length > requiredStableSamples) {
        vm.weightSamples.shift(); // Remove oldest
    }
} else {
    vm.weightSamples = [newWeight]; // Reset on change
}

// Check stability
if (vm.weightSamples.length === requiredStableSamples) {
    // Weight is stable
    vm.submit = false; // Enable save button
} else {
    // Weight is unstable
    if (parseInt(vm.WeighBridge.stable_samples) > 5) {
        vm.submit = true; // Disable save button
    }
}
```

### Special Cases

**High Sample Count (> 5):**
- Save button is disabled until stable
- Prevents premature weight capture

**Low Sample Count (≤ 5):**
- Save button may remain enabled
- Faster weight capture for quick operations

## Required Field Validation

### Settings-Based Requirements

**Rule:** Required fields depend on settings configuration.

**Business Partner:**
```javascript
if (vm.Setting.business_partner == "Yes" && 
    !vm.Single.businesspartner_id) {
    Error += "Please select Business Partner.\n";
}
```

**Product:**
```javascript
if (vm.Setting.use_product_list == "Yes" && 
    !vm.Single.product_id) {
    Error += "Please select Product.\n";
}
```

**Haulier:**
```javascript
if (vm.Setting.haulier == "Yes" && 
    !vm.Single.haulier_id) {
    Error += "Please select Haulier.\n";
}
```

**Settings ID:**
```javascript
if (typeof vm.Single.settings_id === "undefined" || 
    vm.Single.settings_id == null) {
    Error += "Please select Settings.\n";
}
```

### Data Loading Validation

**Rule:** Selected entities must have fully loaded data.

**Product Data:**
```javascript
if (vm.Setting.use_product_list == "Yes" && 
    vm.Single.product_id && 
    (!vm.selected_product || !vm.selected_product.report)) {
    Error += "Product data not fully loaded. Please reselect Product.\n";
}
```

**Haulier Data:**
```javascript
if (vm.Setting.haulier == "Yes" && 
    vm.Single.haulier_id && 
    (!vm.selected_haulier || !vm.selected_haulier.report)) {
    Error += "Haulier data not fully loaded. Please reselect Haulier.\n";
}
```

**Business Partner Data:**
```javascript
if (vm.Setting.business_partner == "Yes" && 
    vm.Single.businesspartner_id && 
    (!vm.selected_businessPartner || !vm.selected_businessPartner.report)) {
    Error += "Business Partner data not fully loaded. Please reselect Business Partner.\n";
}
```

## Numberplate Validation

### Required Numberplate

**Rule:** If numberplate is enabled, it must be entered.

**Validation:**
```javascript
if (vm.Setting.numberplate_1 == "Yes" && 
    (vm.Single.RegNumber == null || vm.Single.RegNumber == "")) {
    Error += "Please enter the Numberplate.\n";
}
```

### Numberplate Verification

**Rule:** If numberplate recognition is enabled, verification status must be valid.

**Validation:**
```javascript
if (vm.Setting.numberplate_recognition == "Yes" &&
    vm.Setting.numberplate_1 == "Yes" &&
    vm.Single.actiontype != "Edit" &&
    (vm.Single.NumberplateVerify == "danger" || 
     vm.Single.NumberplateVerify == "warning")) {
    Error += "Please Verify Numberplate.\n";
}
```

**Verification Statuses:**
- `"success"` - Verified (allowed)
- `"warning"` - Needs verification (blocked)
- `"danger"` - Failed verification (blocked)

**Note:** Verification is not required for "Edit" action type.

## Custom Field Validation

### Required Custom Fields

**Rule:** Custom fields with input type "SC" (Single Choice) or "TC" (Text Choice) are required if enabled.

**Validation:**
```javascript
for (let i = 1; i <= 20; i++) {
    let input = vm.Setting[`user_defined_input${i}`];
    let customField = vm.Single[`Custom${i}`];
    
    if (input == 'SC' && (customField == null || customField == "")) {
        Error += `Please enter CustomField ${i}.\n`;
    }
    
    if (input == "TC" && (customField == null || customField == "")) {
        Error += `Please enter CustomField ${i}.\n`;
    }
}
```

**Input Types:**
- `"SC"` - Single Choice (dropdown) - Required
- `"TC"` - Text Choice (text input) - Required
- Other types - Optional

## Tare Validation Rules

### Tare and Weighing Type Incompatibility

**Rule:** Stored tares cannot be used with single weighing.

**Validation:**
```javascript
if (vm.Single.tares_enabled === "true" && 
    vm.Single.type_of_weighing === '1') {
    Error = Error + "Can't do tares with single weighing. \n";
}
```

**Reason:** Single weighing requires only one weight, but tares require two weights (first weight + tare weight).

## Contract Validation Rules

### Contract Amount Tracking

**Rule:** Contract fulfillment is tracked but exceeding is allowed (with linked contracts).

**Calculation:**
```javascript
// Contract status
vm.contractStatus.promised = vm.selected_contract.amount;
vm.contractStatus.delivered = delivered; // Sum of contract transactions
vm.contractStatus.remaining = vm.contractStatus.promised - vm.contractStatus.delivered;
```

**Note:** There is commented code for contract amount validation:
```javascript
// Commented out - contract exceeding is allowed
// const excessContractAmount = vm.Single.contract_remaining_amount - Math.abs(vm.nettWeight);
// if (excessContractAmount < 0) {
//     Error = Error + "You have exceeded the contract amount by " + 
//             Math.abs(excessContractAmount) + " kgs \n Please reduce and retake the weighing.";
// }
```

**Current Behavior:** Contract amount can be exceeded. Excess can go to linked contract if configured.

## WebSocket Weight Capture Rules

### Save Operation Protection

**Rule:** WebSocket must be stopped during save to prevent weight changes.

**Implementation:**
```javascript
vm.save = function() {
    if (vm.isSaving) return; // Prevent multiple clicks
    
    vm.isSaving = true;
    vm.stopWebSocket(); // Stop weight capture
    
    // ... save logic ...
    
    // On success:
    vm.closeWebSocket(); // Close permanently
    
    // On failure:
    vm.restartWebSocket(); // Restart for retry
};
```

### Weight Capture During Save

**Rule:** Weight changes during save are prevented.

**Protection:**
- WebSocket stopped before save
- `isSaving` flag prevents multiple saves
- Weight samples preserved during save

## Action Type Rules

### New vs Edit Behavior

**Rule:** Different validation and behavior based on action type.

**New Action (`actiontype = "New"`):**
- Full validation required
- Numberplate verification required (if enabled)
- All required fields must be present
- Contract status calculated

**Edit Action (`actiontype = "Edit"`):**
- Numberplate verification not required
- Some validations may be relaxed
- Existing data preserved

**Implementation:**
```javascript
vm.Single.actiontype = "New"; // For new weighing
vm.Single.actiontype = "Edit"; // For updating existing
```

## Second Weight Rules

### Conditional Second Weight

**Rule:** Second weight behavior depends on weighing type and tares.

**Single Weighing with Tares:**
```javascript
if (vm.Setting.type_of_weighing !== "1" && 
    vm.Setting.tares_enabled !== 'true') {
    vm.Single.SecondWeight = 0; // Clear second weight
}
```

**Single Weighing (No Tares):**
```javascript
if (vm.Setting.type_of_weighing === "1") {
    vm.Single.SecondWeight = 0; // Always 0 for single weighing
}
```

**Double Weighing:**
- Second weight is required
- Must be captured separately
- Used for net weight calculation

## Status Transition Rules

### Status Change Validation

**Rule:** Status transitions must follow valid paths.

**Valid Transitions:**
- `CREATE` → `OPEN` (awaiting second weight)
- `CREATE` → `VERIFY` (silo verification required)
- `CREATE` → `CLOSED` (single weighing, no verification)
- `OPEN` → `CLOSED` (second weight captured)
- `VERIFY` → `CLOSED` (verification complete)
- Any → `DELETED` (soft delete)

**Invalid Transitions:**
- `CLOSED` → `OPEN` (cannot reopen closed transaction)
- `DELETED` → `OPEN` (must restore first)

### Verification Requirements

**Rule:** Verification status determines if manual verification is required.

**Silo Verification:**
```javascript
if (settings.silo_verification == "Yes" && 
    SiloOverride != "Yes") {
    status = "VERIFY";
}
```

**Silo Override:**
- If `SiloOverride == "Yes"`: Status can be `CLOSED` directly
- Bypasses verification requirement

## Data Preservation Rules

### Selection Preservation

**Rule:** Selected entities must be preserved during save to prevent race conditions.

**Implementation:**
```javascript
vm.preservedSelections = {
    businessPartner: vm.selected_businessPartner ? angular.copy(vm.selected_businessPartner) : null,
    haulier: vm.selected_haulier ? angular.copy(vm.selected_haulier) : null,
    product: vm.selected_product ? angular.copy(vm.selected_product) : null,
    contract: vm.selected_contract ? angular.copy(vm.selected_contract) : null,
    pallet: vm.selected_pallet ? angular.copy(vm.selected_pallet) : null
};
```

**Purpose:** Prevent data loss if selections change during async save operation.

## Calculation Validation Rules

### Net Weight Calculation

**Rule:** Net weight must be positive after all deductions.

**Validation:**
```javascript
vm.nettWeight = Math.abs(vm.Single.SecondWeight - vm.Single.FirstWeight);
// Apply deductions
vm.nettWeight = vm.nettWeight - (vm.Single.handlingCharges || 0) - 
                (vm.Single.moistureDeduction || 0) - (vm.Single.pallet_charges || 0);
```

**Note:** Net weight uses absolute value to ensure positive result.

### Division by Zero Protection

**Rule:** All percentage calculations must handle zero denominators.

**Moisture Calculation:**
```javascript
if (prescribedMoisture >= 100) {
    // Handle edge case
    moistureCoefficient = 0;
} else {
    moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture);
}
```

## Error Handling Rules

### Validation Error Display

**Rule:** All validation errors are collected and displayed together.

**Implementation:**
```javascript
let Error = "";

// Collect all errors
if (condition1) Error += "Error 1.\n";
if (condition2) Error += "Error 2.\n";
// ... more validations ...

// Display all errors at once
if (Error != "") {
    swal("Oops...", Error, "error");
    $rootScope.Loaded();
    return; // Stop save operation
}
```

**Benefits:**
- User sees all errors at once
- Prevents multiple save attempts
- Better user experience

## Business Rules Summary

### Critical Rules

1. **Weight Validation:**
   - Must be numeric
   - Max 60 tons (warning)
   - Required based on weighing type

2. **Stable Weight Sampling:**
   - Configurable sample count
   - Prevents premature capture
   - High sample count disables save button

3. **Required Fields:**
   - Settings-based requirements
   - Data must be fully loaded
   - Custom fields based on input type

4. **Numberplate:**
   - Required if enabled
   - Verification required for recognition

5. **Tare Incompatibility:**
   - Cannot use with single weighing

6. **Status Transitions:**
   - Must follow valid paths
   - Verification requirements

7. **WebSocket Protection:**
   - Stopped during save
   - Restarted on failure

8. **Data Preservation:**
   - Selections preserved during save
   - Prevents race conditions

### Validation Order

1. Settings selection validation
2. Required field validation
3. Data loading validation
4. Weight validation (numeric, max)
5. Weighing type validation
6. Tare validation
7. Numberplate validation
8. Custom field validation
9. Contract validation (if applicable)
10. Final save operation

## Error Messages Reference

### Common Error Messages

- "Please select Settings."
- "Please select Business Partner."
- "Please select Product."
- "Please select Haulier."
- "Text is invalid for FirstWeight, Please enter a number."
- "Text is invalid for SecondWeight, Please enter a number."
- "Please enter the first weight."
- "Please enter the second weight."
- "Please enter both First and Second Weights."
- "Please enter the Numberplate."
- "Please Verify Numberplate."
- "Can't do tares with single weighing."
- "Warning weight is above 60 Tons."
- "Product data not fully loaded. Please reselect Product."
- "Haulier data not fully loaded. Please reselect Haulier."
- "Business Partner data not fully loaded. Please reselect Business Partner."
- "Please enter CustomField {N}."

## Best Practices

### Validation Implementation

1. **Collect all errors** before displaying
2. **Validate early** to prevent unnecessary processing
3. **Provide clear messages** with specific field names
4. **Preserve user input** when possible
5. **Handle edge cases** (null, undefined, empty strings)

### Error Prevention

1. **Disable save button** during validation
2. **Show loading states** during async operations
3. **Preserve selections** during save
4. **Stop WebSocket** during critical operations
5. **Validate data loading** before save

