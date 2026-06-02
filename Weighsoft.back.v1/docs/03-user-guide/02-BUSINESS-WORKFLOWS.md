# Business Workflows

## Overview

This document describes the step-by-step processes for typical weighing operations in Weighsoft.

---

## Workflow 1: Double Weighing (Entry & Exit)

This is the most common workflow for receiving or dispatching goods.

### Scenario: Receiving Goods (Inbound)

**Example**: A truck arrives with 20 tons of wheat from a supplier.

#### Step 1: Select Weighing Configuration
```
Operator → Company → Site → Workstation → Weighing Type
```

- Operator selects the **Weighing Type** (Settings) configured for this operation
- System loads configured options (haulier required? product list? cameras?)

#### Step 2: First Weight (Vehicle Full)
1. **Vehicle enters site** (boom opens)
2. **Vehicle drives onto weighbridge**
3. **System reads weight from scale** via WebSocket (real-time)
4. **Weight stabilizes** (system detects stable readings)
5. **Operator captures data**:
   - **Number Plate** (manual or automatic via camera OCR)
   - **Haulier** (transport company)
   - **Business Partner** (supplier)
   - **Product** (e.g., "Wheat")
   - **Contract** (optional - if this delivery is against a contract)
   - **Custom Fields** (e.g., batch number, moisture %, etc.)
6. **Cameras capture photos** (if configured)
7. **System saves First Weight** with status "OPEN"
8. **Vehicle proceeds to unloading area**

**Database Records Created:**
- `weighingheaders` - Main record (status: OPEN)
- `weighingtransactions` - First weight entry (Status: 1)
- `weighingcameras` - Photos (if enabled)

#### Step 3: Second Weight (Vehicle Empty)
1. **Vehicle returns after unloading**
2. **Vehicle drives onto weighbridge**
3. **Operator selects the OPEN weighing transaction** from list
4. **System reads second weight from scale**
5. **Weight stabilizes**
6. **Operator confirms second weight**
7. **Cameras capture photos again** (if configured)
8. **System calculates**:
   - **Gross Weight** = |FirstWeight - SecondWeight|
   - **Deductions** (moisture, handling, pallet charges)
   - **Net Weight** = Gross Weight - Deductions
9. **Contract updated** (if linked - delivered amount tracked)
10. **System saves Second Weight** with status "CLOSED"
11. **Ticket prints automatically** (if configured)
12. **AS/400 export** (if configured)

**Database Records Updated:**
- `weighingheaders` - Status changes to CLOSED, NettWeight calculated
- `weighingtransactions` - Second weight entry (Status: 2)
- `contract_transactions` - Delivery recorded against contract
- `weighingcameras` - Second set of photos

**Ticket Printed:**
- Transaction number
- Date/time (1st weight, 2nd weight)
- Number plate
- Business partner
- Product
- First weight / Second weight / Net weight
- Operator names
- Photos (optional)

---

## Workflow 2: Single Weighing (Instant)

For quick operations where only one weight is needed.

### Scenario: Outbound Materials (No Return Weight Needed)

**Example**: Customer picks up 5 bags of fertilizer (known tare weight).

#### Process:
1. **Operator selects Weighing Type** configured for "Single Weighing"
2. **Vehicle drives onto weighbridge**
3. **System reads weight** (FirstWeight = 0, only SecondWeight recorded)
4. **Operator captures**:
   - Number plate
   - Business partner
   - Product
   - Tare weight (from stored tares or manual entry)
5. **System calculates**:
   - **Net Weight** = SecondWeight - Tare
6. **Status set to CLOSED immediately**
7. **Ticket prints**
8. **Vehicle exits**

**Key Difference**: 
- Only ONE weight reading
- Transaction is created and closed in one step
- Settings: `type_of_weighing = "1"` (single)

---

## Workflow 3: Verification Workflow (Silo Verification)

For high-security operations requiring supervisor approval.

### Scenario: Grain Silo Reconciliation

**Example**: Weighbridge operator records delivery, but supervisor must verify against silo levels before closing.

#### Process:
1. **Operator performs normal double weighing** (Steps 1-3 from Workflow 1)
2. **System sets status to "VERIFY"** instead of "CLOSED"
   - Trigger: Settings has `silo_verification = "Yes"`
3. **Operator cannot close the transaction**
4. **Supervisor logs in** (must have `verify` permission)
5. **Supervisor navigates to Verify screen**
6. **Supervisor reviews**:
   - Weighing details
   - Checks silo levels physically
   - Verifies discrepancy is acceptable
7. **Supervisor approves**:
   - Status changes from "VERIFY" to "OPEN"
   - Transaction now available for completion
8. **Normal workflow continues** (second weight, close)

**Permissions Required**:
- Operator: `weighing = "true"`
- Supervisor: `verify = "true"`

---

## Workflow 4: Tare Weight (Pre-stored)

For repeat vehicles with known empty weights.

### Scenario: Fleet Vehicle with Stored Tare

**Example**: Company fleet truck #12 always weighs 8,500 kg empty.

#### Setup (One-time):
1. **Admin creates Tare record**:
   - Vehicle ID: "TRUCK-12"
   - Weight: 8500 kg
   - Description: "Fleet truck 12"
2. **Tare stored in system**

#### Weighing Process:
1. **Operator selects Weighing Type** with `tares_enabled = "true"`
2. **Operator selects stored tare** from dropdown
3. **System auto-fills FirstWeight** = 8500 kg (from stored tare)
4. **Vehicle drives onto weighbridge** (loaded)
5. **System reads weight** = 28,500 kg (example)
6. **System calculates Net Weight** = 28,500 - 8,500 = 20,000 kg
7. **Transaction closes immediately** (both weights known)

**Benefits**:
- **Faster processing** (one weight instead of two)
- **Less waiting time** for fleet vehicles
- **Consistent tare weights**

---

## Workflow 5: Contract Management

For deliveries/collections against pre-agreed contracts.

### Scenario: Contract for 1000 tons of Maize

#### Setup:
1. **Admin creates Contract**:
   - Business Partner: "ABC Farms"
   - Product: "Maize"
   - Amount: 1,000,000 kg
   - Price: R5.50 per kg
   - Expiry Date: 2025-12-31
   - Direction: "Inbound" (receiving from supplier)

#### Weighing Process:
1. **Operator performs double weighing** (Workflow 1)
2. **When selecting Business Partner**, system shows available contracts
3. **Operator selects Contract**
4. **System displays contract status**:
   - Promised: 1,000,000 kg
   - Delivered: 450,000 kg
   - Remaining: 550,000 kg
5. **Second weight captured**: 25,000 kg net
6. **System updates contract**:
   - Delivered: 475,000 kg
   - Remaining: 525,000 kg
7. **Contract transaction created** linking weighing to contract
8. **If contract exceeded**, system warns operator

#### Contract Linked Contracts:
- Contracts can have `linked_contact_id`
- When primary contract is full, overflow goes to linked contract
- Example: Contract A (1000 tons) + Contract B (500 tons) linked

---

## Workflow 6: Reprint / Edit / Delete

For correcting errors or reprinting tickets.

### Reprint Ticket
**Permissions**: User must have `reprint = "true"`

1. Navigate to **Reprint List**
2. Search for transaction (by date, number plate, transaction #)
3. Click **Print**
4. System regenerates ticket with original data
5. Ticket marked "REPRINT" with timestamp

### Edit Transaction
**Permissions**: User must have `reprint = "true"`

1. Navigate to **Reprint List**
2. Search and select transaction
3. Click **Edit**
4. Modify fields:
   - Number plate
   - Business partner, Product, Haulier
   - Custom fields
   - **Cannot modify weights** (audit integrity)
5. Save changes
6. **Exception log created** recording the edit

### Delete Transaction
**Permissions**: User must have `delete_transaction_flag = "true"`

1. Navigate to **Reprint List**
2. Search and select transaction
3. Click **Delete**
4. **System requires reason** (mandatory text field)
5. Confirm deletion
6. **Soft delete** - record marked as deleted (not physically removed)
   - `deleted_at` timestamp set
   - `reason` field populated
   - `deletedUserId` recorded
7. **Exception log created**

**Important**: Deleted transactions:
- Still appear in reports (if "Show Deleted" filter enabled)
- Cannot be undeleted (permanent audit trail)
- Contract transactions are reversed

---

## Workflow 7: Moisture Deduction & Handling Charges

For agricultural products where moisture content affects pricing.

### Scenario: Wheat Delivery with High Moisture

**Example**: Wheat delivered at 18% moisture, but standard is 14%.

#### Configuration (Settings):
- `enable_moisture = "true"`
- `moisture_deduction_level = 14` (threshold %)

#### Process:
1. **Normal double weighing**
2. **Operator enters moisture %**: 18%
3. **System calculates moisture deduction**:
   ```
   moistureCoefficient = 1 - ((100-18)/(100-14))
   moistureDeduction = NettWeight × moistureCoefficient
   ```
4. **Handling charges** (if configured):
   - Percentage-based deduction
   - Applied before or after moisture (configurable)
5. **Final Net Weight** = Gross - Moisture - Handling
6. **Ticket shows breakdown**:
   - Gross Weight: 25,000 kg
   - Moisture Deduction (18%): 1,163 kg
   - Handling Charges (2%): 477 kg
   - Net Weight: 23,360 kg

---

## Workflow 8: Camera Integration

For photographic evidence of weighings.

### Process:
1. **Settings configured with cameras**:
   - `use_cameras = "Yes"`
   - Cameras assigned to weighbridge
2. **During weighing**:
   - System polls camera IP addresses (every 5 seconds)
   - Displays live preview on screen
   - **Captures photo at first weight**
   - **Captures photo at second weight**
3. **Photos stored** in database (base64 encoded)
4. **Optional**: Photos printed on ticket (`print_cameras_on_ticket = "Yes"`)

**Camera Types Supported**:
- IP cameras (MJPEG/JPEG snapshot URLs)
- Authentication: None, Basic, Digest

---

## Workflow 9: ESP32 Boom & Light Control

For automated access control at weighbridge.

### Equipment:
- **ESP32 relay controller** (IP address configured on weighbridge)
- **Boom gates** (entry/exit)
- **Traffic lights** (entry/exit)

### Operator Controls:
1. **Incoming Boom**:
   - Open (raise boom)
   - Close (lower boom)
2. **Exiting Boom**:
   - Open / Close
3. **Incoming Light**:
   - Green (safe to enter)
   - Red (stop)
4. **Exiting Light**:
   - Green / Red

### Typical Flow:
1. **Vehicle arrives** - Incoming light is RED
2. **Operator prepares weighing** - Opens incoming boom, sets light GREEN
3. **Vehicle enters** and parks on scale
4. **Operator closes incoming boom** - Light to RED (no more vehicles)
5. **Weighing completes**
6. **Operator opens exiting boom** - Exiting light GREEN
7. **Vehicle exits**
8. **Operator closes exiting boom**

---

## Status Lifecycle

```
┌─────────┐
│   NEW   │ (Not yet started)
└────┬────┘
     │
     ▼
┌─────────┐
│  OPEN   │ (First weight recorded, awaiting second weight)
└────┬────┘
     │
     ├──────────► (if silo_verification enabled)
     │            ┌────────────┐
     │            │   VERIFY   │ (Awaiting supervisor approval)
     │            └──────┬─────┘
     │                   │
     │                   ▼
     │            (Supervisor approves, back to OPEN)
     │
     ▼
┌─────────┐
│ CLOSED  │ (Second weight recorded, transaction complete)
└─────────┘
```

---

## Next Steps

- See `03-REPORTS.md` for reporting on these transactions
- See `04-UI-REQUIREMENTS.md` for screen layouts
- See `05-INTEGRATIONS.md` for external system connections

