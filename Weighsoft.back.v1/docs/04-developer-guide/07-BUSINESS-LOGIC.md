# Business Logic Documentation

## Overview

This document details the business rules, calculations, and logic flows within the Weighsoft system.

## Weight Calculations

### Net Weight Calculation

**Basic Formula:**
```
Net Weight = |Second Weight - First Weight|
```

**With Pallet Charges:**
```
Net Weight = |Second Weight - First Weight| - Pallet Charges
```

**With Deductions (Moisture + Handling):**
```
Net Weight = Base Net Weight - Moisture Deduction - Handling Charges
```

### Deduct Flow Logic

The system supports three deduction flow types controlled by `site.deduct_flow`:

#### 1. Default Flow
Both moisture and handling are calculated on the full net weight:
```
Net Weight = Base Net Weight
Moisture Deduction = Net Weight × (Moisture % / 100)
Handling Charges = Net Weight × (Handling % / 100)
Final Net Weight = Net Weight - Moisture Deduction - Handling Charges
```

#### 2. Moisture First Flow
Moisture is calculated first, then handling on the reduced weight:
```
Net Weight = Base Net Weight
Moisture Deduction = Net Weight × (Moisture % / 100)
Adjusted Weight = Net Weight - Moisture Deduction
Handling Charges = Adjusted Weight × (Handling % / 100)
Final Net Weight = Adjusted Weight - Handling Charges
```

#### 3. Handling First Flow
Handling is calculated first, then moisture on the reduced weight:
```
Net Weight = Base Net Weight
Handling Charges = Net Weight × (Handling % / 100)
Adjusted Weight = Net Weight - Handling Charges
Moisture Deduction = Adjusted Weight × (Moisture % / 100)
Final Net Weight = Adjusted Weight - Moisture Deduction
```

### Moisture Deduction Calculation

**Formula:**
```javascript
moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture)
moistureWeight = totalWeight × moistureCoefficient
moistureDeduction = totalWeight - moistureWeight
```

**Where:**
- `moisturePercentage` - Actual moisture percentage
- `prescribedMoisture` - Target/prescribed moisture level (from settings)
- `totalWeight` - Weight before moisture deduction

**Example:**
- Total Weight: 1000 kg
- Actual Moisture: 15%
- Prescribed Moisture: 12%
- Coefficient: 100 - (100 - 15) / (100 - 12) = 100 - 85/88 = 3.41%
- Moisture Deduction: 1000 × 0.0341 = 34.1 kg

### Handling Charges Calculation

**Formula:**
```
Handling Charges = Weight × (Handling Percentage / 100)
```

**Where:**
- Weight depends on deduct flow (see above)
- Handling Percentage from `weighingheaders.handling_charges`

### Pallet Charges Calculation

**Formula:**
```
Pallet Charges = Pallet Count × Charge Per Pallet
```

**Where:**
- `Pallet Count` - Number of pallets
- `Charge Per Pallet` - From `pallets.charge`

## Status Determination Logic

### Initial Status Assignment

When creating a weighing header, status is determined by:

1. **Silo Verification Required:**
   ```
   IF settings.silo_verification == "Yes" AND SiloOverride != "Yes"
   THEN status = "VERIFY"
   ```

2. **Two-Weight Required:**
   ```
   IF settings.type_of_weighing != "1" AND settings.tares_enabled != "true"
   THEN status = "OPEN"
   ```

3. **Otherwise:**
   ```
   status = "CLOSED"
   ```

### Status Transitions

```
CREATE → OPEN/VERIFY → CLOSED
         ↓
      DELETED (soft)
```

- **OPEN:** Awaiting second weight (tare)
- **VERIFY:** Requires manual verification
- **CLOSED:** Transaction complete
- **DELETED:** Soft deleted (recoverable)

### Verification Process

When verifying a weighing header:
- If `SiloOverride == "Yes"`: Status changes to CLOSED
- Otherwise: Requires manual verification step

## Transaction Numbering

### Transaction Number Generation

**Format:**
```
Transaction Number = settings.prefix + transactions.current_id
```

**Process:**
1. Find or create `transactions` record for company/site/settings combination
2. Use `current_id` from transactions table
3. Increment `current_id` after use
4. Format: `{prefix}{number}` (e.g., "WB001", "INV123")

**Uniqueness:**
- Unique per company/site/settings combination
- Auto-increments per combination
- Stored in `transactions` table

## Contract Management

### Contract Fulfillment Tracking

**Contract Amount Calculation:**
```
Contract Amount = contract.amount
Delivered Amount = SUM(contract_transactions.amount)
Remaining Amount = Contract Amount - Delivered Amount
```

### Contract Transaction Linking

When a weighing header is created with a contract:

1. **Create Contract Transaction:**
   ```
   contract_transaction.amount = weighing_header.TotalWeight (or FirstWeight)
   contract_transaction.contract_id = contract.id
   contract_transaction.weighing_header_id = weighing_header.id
   ```

2. **Update Delivered Amount:**
   ```
   Delivered = SUM(contract_transactions WHERE contract_id = X)
   Remaining = contract.amount - Delivered
   ```

### Linked Contracts

Contracts can be linked via `contracts.linked_contact_id`:

**Logic:**
1. If contract amount is exceeded, excess goes to linked contract
2. Calculate remaining amount for primary contract
3. If excess exists, create transaction for linked contract
4. Total contract amount = primary + linked amounts

**Example:**
- Primary Contract: 1000 kg
- Delivered: 1100 kg
- Excess: 100 kg → Linked Contract

## Axle Weight Calculations

### Multi-Axle Weighing

**Supported Axles:** Up to 6 axles

**Weight Fields:**
- `Weight1` through `Weight6`
- `WeightTotal` - Sum of all axle weights

**Calculation:**
```
WeightTotal = Weight1 + Weight2 + Weight3 + Weight4 + Weight5 + Weight6
```

### Axle Setup Configuration

Axle configurations stored in `axelsetups`:
- Define axle arrangements
- Link to settings
- Used for multi-axle weighing types

## Tare Weight Management

### Stored Tares

**Purpose:** Pre-stored tare weights for known vehicles

**Storage:**
- Table: `tares`
- Fields: `RegNumber`, `tare_weight`, `expiry_date`

**Usage:**
1. When vehicle registration entered, system checks for stored tare
2. If found and not expired, auto-populate tare weight
3. User can override if needed

**Expiry:**
- Tares with `expiry_date < today` are excluded from queries
- Expired tares can still be viewed but not auto-selected

## Number Formatting

### Weight Formatting

**Site-Level Configuration:**
- `sites.decimals` - Number of decimal places
- `sites.measure_type` - Unit (kg, ton, etc.)

**Format:**
```javascript
formatted = weight.toFixed(decimals) + " " + measure_type
```

**Example:**
- Weight: 15000.5
- Decimals: 2
- Measure: "kg"
- Result: "15000.50 kg"

## Invoice Calculations

### Invoice Line Items

**Structure:**
- Product lines with quantities and prices
- Optional extra lines for packaging and shipping (per metric ton × net weight), using the same tonnage as the main product line
- Subtotal calculation
- VAT calculation (if applicable)
- Total calculation
- Balance due

### Invoice Generation

**Triggered When:**
- `settings.invoice_enabled == "true"`
- Weighing header is CLOSED
- Business partner is selected

**Calculation:**
```
Subtotal (excl. VAT) = product_line + packaging_line + shipping_line (each: unit price per ton × metric tons)
VAT = ROUND(Subtotal × (VAT Rate / 100), 2)  — VAT rate from the main product, applied once to the combined excl.-VAT total
Total = Subtotal + VAT
Balance Due = Total - Payments
```

Xero invoices mirror the same line split when `weighingheaders.contract_packaging_price_per_ton` / `contract_shipping_price_per_ton` are set and the corresponding Xero item products are configured on `xero_settings`.

## Reporting Calculations

### Report Data Aggregation

**Grouping:**
- By weighing type (settings)
- By date range
- By company/site/workstation

**Aggregations:**
- Total weight
- Total transactions
- Average weight
- Count by status

### Report Email Scheduling

**Time Frame Types:**
- `time_frame = 0`: Since last report
- `time_frame > 0`: Last N days

**Calculation:**
```
IF time_frame == 0:
    start_date = last_report_on OR yesterday
ELSE:
    start_date = today - time_frame days

end_date = today
```

## Exception Handling

### Exception Logging

**When Exceptions Occur:**
- Transaction deletion
- Verification failures
- Data inconsistencies
- System errors

**Exception Record:**
- `code` - Exception code
- `description` - Detailed description
- `jsondata` - JSON data snapshot
- `comment` - User comment
- Context: company, site, workstation, weighbridge

## User Permissions

### Permission System

**Structure:**
- `user_types` - Permission groups
- `users.role_id` - Links user to permission group
- `user_types.permissions` - JSON permissions object

**Permission Checks:**
- Menu item visibility
- Feature access
- Data filtering

## Data Validation Rules

> **Note:** For comprehensive validation rules, error messages, and detailed validation logic, see [10-BUSINESS-RULES-VALIDATION.md](./10-BUSINESS-RULES-VALIDATION.md).

### Weighing Header Validation

**Required Fields:**
- `company_id`
- `site_id`
- `workstation_id`
- `weighbridge_id`
- `settings_id`
- `FirstWeight` (for first weight)

**Conditional Fields:**
- `SecondWeight` - Required if two-weight type
- `businesspartner_id` - Required if `settings.business_partner == "true"`
- `product_id` - Required if `settings.use_product_list == "true"`
- `haulier_id` - Required if `settings.haulier == "true"`

### Status Validation

**Status Change Rules:**
- OPEN → CLOSED: Requires second weight
- VERIFY → CLOSED: Requires verification
- Any → DELETED: Requires delete permission
- DELETED → Any: Requires restore permission

## Business Rules Summary

### Weighing Rules
1. First weight must be captured before second weight
2. Net weight cannot be negative
3. Status determines workflow path
4. Transaction numbers are auto-generated and unique

### Contract Rules
1. Contract amount cannot be exceeded (unless linked contract)
2. Contract transactions are linked to weighing headers
3. Remaining amount is calculated automatically
4. Linked contracts handle overflow

### Tare Rules
1. Stored tares expire based on expiry_date
2. Tares are site-specific
3. Tares can be overridden manually

### Calculation Rules
1. Deduct flow determines calculation order
2. All deductions are percentage-based
3. Final net weight is always positive
4. Formatting respects site decimals and measure type

## Error Handling

### Calculation Errors

**Handling:**
- Division by zero protection
- Null value handling
- Invalid input validation
- Exception logging

### Data Integrity

**Constraints:**
- Foreign key relationships
- Unique constraints
- Required field validation
- Soft delete preservation

## Related Documentation

For detailed validation rules and business constraints, see:
- **[10-BUSINESS-RULES-VALIDATION.md](./10-BUSINESS-RULES-VALIDATION.md)** - Comprehensive validation rules, error messages, and edge cases

