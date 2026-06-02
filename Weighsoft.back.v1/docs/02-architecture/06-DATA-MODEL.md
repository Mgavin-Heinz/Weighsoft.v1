# Data Model and Database Structure

## Overview

Weighsoft uses **MySQL** database with **UUID primary keys** stored as BINARY(16) for transaction tables.

---

## Database Architecture

### Key Characteristics

1. **UUID Primary Keys** - Transaction tables use UUIDs for distributed systems compatibility
2. **Soft Deletes** - Many tables use `deleted_at` timestamp instead of physical deletion
3. **Hierarchical Structure** - Company → Site → Workstation → Weighbridge
4. **Audit Fields** - `created_at`, `updated_at`, `deleted_at` on most tables
5. **Foreign Keys** - Relationships enforced with FK constraints

### UUID Usage

**Transaction Tables** (using UUID):
- `weighingheaders`
- `weighingtransactions`
- `weighingcameras`

**Master Data Tables** (using auto-increment INT):
- All other tables (companies, sites, products, etc.)

**UUID Functions**:
```sql
-- Insert with UUID
INSERT INTO weighingheaders (id, ...) 
VALUES (UUID_TO_BIN(UUID(), TRUE), ...);

-- Query with UUID
SELECT * FROM weighingheaders 
WHERE id = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000', TRUE);

-- Return UUID as string
SELECT BIN_TO_UUID(id, TRUE) as id, ... 
FROM weighingheaders;
```

---

## Core Tables

### 1. Organizational Hierarchy

#### `companies`

**Purpose**: Top-level organization

```sql
CREATE TABLE companies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    registered_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    vat_number VARCHAR(255),
    company_registration VARCHAR(255),
    physical_address TEXT,
    postal_address TEXT,
    contact_person VARCHAR(255),
    contact_number VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Relationships**:
- Has many: `sites`
- Has many: `users`
- Has many: `settings` (weighing types)

---

#### `sites`

**Purpose**: Physical location with weighbridges

```sql
CREATE TABLE sites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    physical_address TEXT,
    contact_person VARCHAR(255),
    contact_number VARCHAR(255),
    email VARCHAR(255),
    company_id BIGINT UNSIGNED,
    decimals INT DEFAULT 0,              -- Decimal places for weights
    measure_type VARCHAR(10),            -- 'kg', 't', 'lbs'
    deduct_flow VARCHAR(50),             -- 'moisture', 'handling', 'default'
    override_silo VARCHAR(10),           -- 'Yes'/'No' - override silo verification
    fingerprint_verify VARCHAR(10),      -- 'Yes'/'No' - require fingerprint
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Key Fields**:
- `decimals` - Display precision (0 = whole numbers, 2 = e.g., 1234.56)
- `measure_type` - Unit of measurement for all weighings at this site
- `deduct_flow` - Order of deductions: moisture first, handling first, or both on full weight

**Relationships**:
- Belongs to: `company`
- Has many: `workstations`
- Has many: `weighbridges`
- Has many: `settings`

---

#### `workstations`

**Purpose**: Operator station/terminal

```sql
CREATE TABLE workstations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workstation_name VARCHAR(255) NOT NULL,
    workstation_type VARCHAR(255),       -- 'Inbound', 'Outbound', 'General'
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Relationships**:
- Belongs to: `site`, `company`
- Has many: `users` (assigned operators)
- Has many: `settings`

---

#### `weighbridges`

**Purpose**: Physical weighbridge/scale

```sql
CREATE TABLE weighbridges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    manual VARCHAR(10),                  -- 'Yes'/'No' - manual weight entry
    scale VARCHAR(255),                  -- Scale identifier for connector
    port_num VARCHAR(255),               -- COM1, /dev/ttyUSB0, etc.
    stable_samples INT DEFAULT 5,        -- Number of identical readings required
    weight_num_amt INT,                  -- Expected weight length
    weight_special VARCHAR(10),          -- Allow decimal/negative
    incoming_boom_ip VARCHAR(50),        -- ESP32 IP for incoming boom
    incoming_boom_relay INT,             -- Relay number (1-8)
    exiting_boom_ip VARCHAR(50),
    exiting_boom_relay INT,
    incoming_light_ip VARCHAR(50),
    incoming_light_relay INT,
    exiting_light_ip VARCHAR(50),
    exiting_light_relay INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Key Fields**:
- `manual` - If "Yes", operator enters weight manually (no scale connector)
- `scale` - Identifier passed to scale connector service
- `stable_samples` - Anti-fluctuation: require N identical readings

**ESP32 Fields**:
- 4 IP addresses (incoming/exiting boom/light)
- 4 relay numbers (which relay on the ESP32 device)

**Relationships**:
- Belongs to: `site`, `company`
- Has many: `cameras`

---

### 2. Master Data

#### `businesspartners`

**Purpose**: Customers and suppliers

```sql
CREATE TABLE businesspartners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    vat_number VARCHAR(255),
    contact_person VARCHAR(255),
    contact_number VARCHAR(255),
    email VARCHAR(255),
    physical_address TEXT,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Relationships**:
- Belongs to: `site`, `company`
- Has many: `weighingheaders`
- Has many: `contracts`

---

#### `products`

**Purpose**: Items being weighed

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purchase_price DECIMAL(15,2),        -- For inbound
    sale_price DECIMAL(15,2),            -- For outbound
    vat DECIMAL(5,2),                    -- VAT percentage
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Relationships**:
- Belongs to: `site`, `company`
- Has many: `weighingheaders`
- Has many: `contracts`

---

#### `hauliers`

**Purpose**: Transport companies

```sql
CREATE TABLE hauliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_number VARCHAR(255),
    email VARCHAR(255),
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Relationships**:
- Belongs to: `site`, `company`
- Has many: `weighingheaders`

---

#### `pallets`

**Purpose**: Pallet definitions with charges

```sql
CREATE TABLE pallets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pallet_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,       -- Charge per pallet or weight
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Usage**: 
- Operator selects pallet type + quantity
- System calculates: `pallet_charges = amount × pallet_count`

---

#### `tares`

**Purpose**: Stored tare weights for fleet vehicles

```sql
CREATE TABLE tares (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,    -- Vehicle identifier
    weight DECIMAL(15,2) NOT NULL,       -- Empty weight
    description TEXT,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Usage**: 
- Operator selects tare from dropdown
- System auto-fills FirstWeight with stored tare
- Only needs to capture SecondWeight (loaded)

---

### 3. Settings (Weighing Types)

#### `settings`

**Purpose**: Weighing configuration templates

```sql
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    
    -- Required Fields Configuration
    haulier VARCHAR(10),                 -- 'Yes'/'No'
    business_partner VARCHAR(10),
    use_product_list VARCHAR(10),
    numberplate_1 VARCHAR(10),
    numberplate_2 VARCHAR(10),
    numberplate_3 VARCHAR(10),
    numberplate_recognition VARCHAR(10),
    
    -- Weighing Type
    type_of_weighing VARCHAR(10),        -- '1' = single, '2' = double
    tares_enabled VARCHAR(10),           -- Enable stored tares
    
    -- Goods Type
    goods_type VARCHAR(50),              -- 'Received Goods', 'Dispatched Goods'
    
    -- Features
    first_can_axel VARCHAR(10),          -- Axle weighing
    second_can_axel VARCHAR(10),
    use_cameras VARCHAR(10),
    display_cameras VARCHAR(10),
    print_cameras_on_ticket VARCHAR(10),
    silo_verification VARCHAR(10),       -- Require supervisor verification
    invoice_enabled VARCHAR(10),
    contract_enabled VARCHAR(10),
    pallet_enabled VARCHAR(10),
    
    -- Deductions
    enable_moisture VARCHAR(10),
    moisture_deduction_level DECIMAL(8,2), -- Threshold %
    enable_handling VARCHAR(10),
    
    -- Printing
    print_ticket VARCHAR(10),            -- 'none', 'Yes', 'N'
    reprint VARCHAR(10),
    ticket_header VARCHAR(15),
    custom_header_text TEXT,
    display_custom_header_img BINARY,    -- Base64 image
    ticket_footer VARCHAR(15),
    custom_footer_text TEXT,
    display_custom_footer_img BINARY,
    
    -- Custom Fields (1-20)
    user_defined_input1 VARCHAR(255),    -- 'N', 'T', 'TC', 'SC' (None, Text, Text Required, Select Required)
    user_defined_name1 VARCHAR(255),     -- Field label
    user_defined_val1 BINARY,            -- Dropdown options (JSON)
    user_defined_rep1 VARCHAR(10),       -- Show in reports? 'Yes'/'No'
    -- ... repeat for user_defined_2 through user_defined_20
    
    -- Export
    export_AS400 VARCHAR(255),           -- File path or 'false'
    AS_400_path TEXT,
    
    -- Transaction Number
    prefix VARCHAR(10),                  -- e.g., 'WH-' for transaction numbers
    
    -- Relationships
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    workstation_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (workstation_id) REFERENCES workstations(id)
);
```

**Key Concepts**:
- Each "Weighing Type" is a template configuration
- Operators select which template to use when weighing
- Controls which fields are required/visible
- Determines workflow (single/double weighing, verification, etc.)

**Custom Fields**:
- Up to 20 configurable fields per weighing type
- Each field has: input type, label, validation, show in reports
- Values stored in `weighingheaders.Custom1` through `Custom20`

---

### 4. Transactions

#### `transactions`

**Purpose**: Transaction number counter per company/site/settings combination

```sql
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    settings_id BIGINT UNSIGNED,
    current_id INT NOT NULL,             -- Counter
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (settings_id) REFERENCES settings(id)
);
```

**Usage**:
```php
// Get or create counter
$transaction = Transactions::where([
    'company_id' => 1,
    'site_id' => 2,
    'settings_id' => 5
])->first();

// Increment and use
$transaction->current_id++;
$transaction->save();

$transaction_number = $settings->prefix . $transaction->current_id;
// Example: "WH-0123"
```

---

#### `weighingheaders`

**Purpose**: Main weighing record (UUID primary key)

```sql
CREATE TABLE weighingheaders (
    id BINARY(16) PRIMARY KEY,           -- UUID
    transaction VARCHAR(255),            -- Display ID: "WH-0123"
    
    -- Configuration
    settings_id BIGINT UNSIGNED,
    weighbridge_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    workstation_id BIGINT UNSIGNED,
    
    -- Status
    status VARCHAR(50),                  -- 'OPEN', 'CLOSED', 'VERIFY'
    reason VARCHAR(255),                 -- Delete reason (if soft-deleted)
    
    -- Vehicle & Registration
    RegNumber VARCHAR(255),              -- Number plate 1
    RegNumber2 VARCHAR(255),
    RegNumber3 VARCHAR(255),
    
    -- Master Data References
    businesspartner_id BIGINT UNSIGNED,
    product_id BIGINT UNSIGNED,
    grade_id BIGINT UNSIGNED,
    grades VARCHAR(255),
    haulier_id BIGINT UNSIGNED,
    tare_id BIGINT UNSIGNED,
    pallet_id BIGINT UNSIGNED,
    
    -- Weights
    FirstWeight FLOAT,
    SecondWeight FLOAT,
    TotalWeight FLOAT,                   -- Gross = |First - Second|
    NettWeight INT,                      -- After deductions
    
    -- Deductions
    moisture_deduction VARCHAR(50),      -- Moisture % captured
    moisture_threshold FLOAT,            -- Threshold from settings
    moistureCoefficient FLOAT,           -- Calculation coefficient
    moistureWeight FLOAT,                -- Weight deducted
    handling_charges VARCHAR(50),        -- Handling % captured
    handlingWeight FLOAT,                -- Weight deducted
    pallet_charges VARCHAR(50),          -- Pallet charges amount
    pallet_count INT,                    -- Number of pallets
    
    -- Pricing
    price VARCHAR(255),
    
    -- Custom Fields (1-20)
    Custom1 VARCHAR(255),
    Custom2 VARCHAR(255),
    -- ... Custom3 through Custom20
    
    -- Audit Trail
    firstWeightUserId BIGINT UNSIGNED,   -- Who captured 1st weight
    secondWeightUserId BIGINT UNSIGNED,  -- Who captured 2nd weight
    verifyUserId BIGINT UNSIGNED,        -- Who verified (if silo verification)
    deletedUserId BIGINT UNSIGNED,       -- Who deleted (if soft-deleted)
    
    -- Timestamps
    created_at TIMESTAMP,                -- 1st weight time
    updated_at TIMESTAMP,                -- 2nd weight time
    deleted_at TIMESTAMP NULL,           -- Soft delete
    
    INDEX (company_id),
    INDEX (site_id),
    INDEX (status),
    INDEX (updated_at),
    INDEX (businesspartner_id),
    INDEX (product_id)
);
```

**Relationships**:
- Belongs to: `settings`, `weighbridge`, `company`, `site`, `workstation`
- Belongs to: `businesspartner`, `product`, `haulier`, `tare`, `pallet`
- Has many: `weighingtransactions` (1st weight, 2nd weight records)
- Has many: `weighingcameras` (photos)
- Has one: `contract_transactions` (if linked to contract)

**Key Fields**:
- `status` - Workflow state: OPEN (awaiting 2nd weight), CLOSED (complete), VERIFY (awaiting supervisor)
- `FirstWeight` / `SecondWeight` - Individual weighings
- `TotalWeight` - Calculated gross weight
- `NettWeight` - After all deductions (final billable amount)

---

#### `weighingtransactions`

**Purpose**: Individual weight readings (UUID primary key)

```sql
CREATE TABLE weighingtransactions (
    id BINARY(16) PRIMARY KEY,           -- UUID
    weighing_header_id BINARY(16),       -- FK to weighingheaders
    
    -- Weights (for axle weighing, typically only Weight1 used)
    Weight1 FLOAT,
    Weight2 FLOAT,
    Weight3 FLOAT,
    Weight4 FLOAT,
    Weight5 FLOAT,
    Weight6 FLOAT,
    WeightTotal FLOAT,
    
    -- Status
    Status VARCHAR(10),                  -- '1' = First weight, '2' = Second weight, 'V' = Verification
    
    -- Axle Data (if enabled)
    AxelSetups TEXT,                     -- JSON axle configuration
    
    -- Relationships
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    workstation_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (weighing_header_id) REFERENCES weighingheaders(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (workstation_id) REFERENCES workstations(id)
);
```

**Usage**:
- **First Weighing**: Status='1', WeightTotal = captured weight
- **Second Weighing**: Status='2', WeightTotal = captured weight
- **Verification**: Status='V' (optional - for silo verification workflow)

**Axle Weighing**:
- If enabled, Weight1-6 capture individual axle weights
- WeightTotal = sum of all axle weights

---

#### `weighingcameras`

**Purpose**: Store photos captured during weighing (UUID primary key)

```sql
CREATE TABLE weighingcameras (
    id BINARY(16) PRIMARY KEY,           -- UUID
    weighing_transaction_id BINARY(16),  -- FK to weighingtransactions
    camera_id BIGINT UNSIGNED,           -- FK to cameras
    base64 LONGTEXT,                     -- Base64-encoded image
    ip_address VARCHAR(255),             -- Camera IP
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (weighing_transaction_id) REFERENCES weighingtransactions(id),
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);
```

**Storage**:
- Images stored as base64 text in database
- Typical size: 50-200KB per image
- 2 images per weighing (1st and 2nd weight) × number of cameras
- Example: 3 cameras = 6 images per transaction

**Considerations**:
- Large database size for sites with many cameras
- Alternative: Store images as files, save file paths in DB

---

### 5. Contracts

#### `contracts`

**Purpose**: Delivery/collection agreements

```sql
CREATE TABLE contracts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    businesspartner_id BIGINT UNSIGNED,
    product_id BIGINT UNSIGNED,
    
    -- Contract Terms
    amount DECIMAL(15,2) NOT NULL,       -- Total contracted quantity
    price DECIMAL(15,2),                 -- Price per unit
    expiry_date DATE,
    direction VARCHAR(50),               -- 'Inbound'/'Outbound'
    reason TEXT,                         -- Notes/description
    
    -- Linked Contracts
    linked_contact_id BIGINT UNSIGNED,   -- FK to another contract (overflow)
    
    -- Relationships
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (businesspartner_id) REFERENCES businesspartners(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (linked_contact_id) REFERENCES contracts(id)
);
```

**Linked Contracts**:
- When primary contract is full, overflow to linked contract
- Example: Contract A (1000 tons) → Contract B (500 tons backup)

**Relationships**:
- Belongs to: `businesspartner`, `product`, `site`, `company`
- Has many: `contract_transactions`

---

#### `contract_transactions`

**Purpose**: Track deliveries against contracts

```sql
CREATE TABLE contract_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT UNSIGNED,
    weighing_header_id BINARY(16),       -- FK to weighingheaders
    amount DECIMAL(15,2) NOT NULL,       -- Net weight delivered
    
    -- Relationships
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (weighing_header_id) REFERENCES weighingheaders(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Contract Status Calculation**:
```sql
-- Total delivered
SELECT SUM(amount) FROM contract_transactions 
WHERE contract_id = ?;

-- Remaining
SELECT (contracts.amount - SUM(contract_transactions.amount)) 
FROM contracts 
LEFT JOIN contract_transactions ON contracts.id = contract_transactions.contract_id
WHERE contracts.id = ?;
```

---

### 6. User Management

#### `users`

**Purpose**: System users (operators, supervisors, admins)

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,      -- Hashed (bcrypt)
    contact_num VARCHAR(255),
    
    -- Permissions
    role_id INT,                         -- FK to usertypes
    
    -- Assignment
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,             -- Optional - restrict to site
    workstations_id BIGINT UNSIGNED,     -- Optional - restrict to workstation
    
    -- Biometric
    fingerprint TEXT,                    -- Base64 fingerprint template
    
    -- JWT
    token VARCHAR(255),
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (role_id) REFERENCES usertypes(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (workstations_id) REFERENCES workstations(id)
);
```

**Relationships**:
- Belongs to: `usertype`, `company`, `site`, `workstation`

---

#### `usertypes`

**Purpose**: User roles with permissions

See `01-USER-ROLES.md` for detailed structure.

```sql
CREATE TABLE usertypes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usertypes VARCHAR(255) NOT NULL,     -- Role name
    level VARCHAR(50),                   -- Hierarchy level (1=highest)
    
    -- Permissions (all VARCHAR 'true'/'false')
    companies VARCHAR(10),
    sites VARCHAR(10),
    workstations VARCHAR(10),
    weighbridges VARCHAR(10),
    cameras VARCHAR(10),
    weigh_types VARCHAR(10),
    weighing VARCHAR(10),
    verify VARCHAR(10),
    reprint VARCHAR(10),
    business_partner VARCHAR(10),
    products VARCHAR(10),
    hauliers VARCHAR(10),
    stored_tares VARCHAR(10),
    rfid_vehicle VARCHAR(10),
    axel_types VARCHAR(10),
    axel_settings VARCHAR(10),
    transaction_report VARCHAR(10),
    exception_report VARCHAR(10),
    users VARCHAR(10),
    user_types VARCHAR(10),
    delete_transaction_flag VARCHAR(10),
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

### 7. Reporting & Exceptions

#### `reporting`

**Purpose**: Save report configurations

```sql
CREATE TABLE reporting (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    jsondata TEXT,                       -- JSON: columns, filters, groupings
    show_deleted VARCHAR(10),            -- 'Yes'/'No' - include deleted transactions
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**JSON Structure**:
```json
{
  "ReportType": {"value": "transaction"},
  "Columns": ["Transaction No", "Product", "Nett Weight"],
  "Filters": ["Date Range", "Site", "Product"],
  "Groupings": ["Product"]
}
```

---

#### `exceptions`

**Purpose**: Log system exceptions and deleted transactions

```sql
CREATE TABLE exceptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255),                   -- Exception type: "Transaction Deleted", "Data Modified", etc.
    description TEXT,
    jsondata TEXT,                       -- Additional data (JSON)
    comment TEXT,                        -- User comment
    
    -- Context
    weighbridge_id BIGINT UNSIGNED,
    workstation_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (weighbridge_id) REFERENCES weighbridges(id),
    FOREIGN KEY (workstation_id) REFERENCES workstations(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Usage**:
- Automatic logging of deleted transactions
- Manual exception reporting
- Audit trail for data modifications

---

### 8. Supporting Tables

#### `cameras`

```sql
CREATE TABLE cameras (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    auth_type VARCHAR(50),               -- 'none', 'basic', 'digest'
    username VARCHAR(255),
    password VARCHAR(255),
    camera_active VARCHAR(10),           -- 'true'/'false'
    pn_recog VARCHAR(10),                -- Number plate recognition
    weighbridge_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (weighbridge_id) REFERENCES weighbridges(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

---

#### `rfidvehicles`

```sql
CREATE TABLE rfidvehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rfid_tag VARCHAR(255) NOT NULL,
    vehicle_registration VARCHAR(255),
    tare_weight DECIMAL(15,2),
    company_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

---

#### `axelsetups` & `axeltypes`

**Purpose**: Configuration for axle weighing (feature partially implemented)

```sql
CREATE TABLE axelsetups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    axel_type_id BIGINT UNSIGNED,
    site_id BIGINT UNSIGNED,
    company_id BIGINT UNSIGNED,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (axel_type_id) REFERENCES axeltypes(id)
);

CREATE TABLE axeltypes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   companies  │──1:N──│    sites     │──1:N──│ workstations │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       │                      │                      │
       │               ┌──────┴───────┐              │
       │               │              │              │
       │         ┌─────▼──────┐ ┌────▼──────┐      │
       │         │weighbridges│ │ settings  │◄─────┘
       │         └─────┬──────┘ └────┬──────┘
       │               │              │
       │         ┌─────▼──────┐       │
       │         │  cameras   │       │
       │         └────────────┘       │
       │                              │
       ├──────────────────────────────┼──────────────────┐
       │                              │                  │
┌──────▼──────────┐         ┌─────────▼────────┐  ┌─────▼──────┐
│ businesspartners│         │weighingheaders   │  │   users    │
│    products     │────N:1──│   (UUID PK)      │  │            │
│    hauliers     │         └─────────┬────────┘  └─────┬──────┘
│    pallets      │                   │                 │
│    tares        │            ┌──────┴──────┐    ┌─────▼──────┐
└─────────────────┘            │             │    │ usertypes  │
       │                ┌──────▼──────┐ ┌────▼────────┐    └────────────┘
       │                │weighingtrans│ │contract_    │
       │                │actions      │ │transactions │
       │                │ (UUID PK)   │ └─────────────┘
       │                └──────┬──────┘
       │                       │
       │                ┌──────▼──────┐
       │                │weighing     │
       │                │cameras      │
       │                │ (UUID PK)   │
       └────────────────┴─────────────┘
```

---

## Indexes and Performance

### Key Indexes

```sql
-- weighingheaders (most queried table)
CREATE INDEX idx_company_id ON weighingheaders(company_id);
CREATE INDEX idx_site_id ON weighingheaders(site_id);
CREATE INDEX idx_status ON weighingheaders(status);
CREATE INDEX idx_updated_at ON weighingheaders(updated_at);
CREATE INDEX idx_businesspartner_id ON weighingheaders(businesspartner_id);
CREATE INDEX idx_product_id ON weighingheaders(product_id);
CREATE INDEX idx_deleted_at ON weighingheaders(deleted_at);

-- weighingtransactions
CREATE INDEX idx_weighing_header_id ON weighingtransactions(weighing_header_id);
CREATE INDEX idx_created_at ON weighingtransactions(created_at);

-- contract_transactions
CREATE INDEX idx_contract_id ON contract_transactions(contract_id);
CREATE INDEX idx_weighing_header_id ON contract_transactions(weighing_header_id);
```

### Query Optimization Tips

1. **Always filter by company_id** - Multi-tenant data separation
2. **Use date ranges** - Index on updated_at helps
3. **Status filtering** - Index on status for OPEN/CLOSED queries
4. **Soft deletes** - Include `deleted_at IS NULL` or use scopes

---

## Data Migration Considerations

### From Other Systems

**CSV Import**:
- Master data (business partners, products) can be imported via CSV
- Use Laravel seeders for bulk import
- Validate foreign key relationships

**UUID Generation**:
```php
// For weighingheaders
$uuid = Str::uuid()->toString();
DB::statement("INSERT INTO weighingheaders (id, ...) VALUES (UUID_TO_BIN(?, TRUE), ...)", [$uuid, ...]);
```

### Backup Strategy

**Daily Backups**:
```bash
mysqldump --single-transaction weighsoft_db > backup_$(date +%Y%m%d).sql
```

**Point-in-Time Recovery**:
- Enable binary logging
- Archive binary logs
- Test restore procedures regularly

---

## Next Steps

For practical usage:
- See `02-BUSINESS-WORKFLOWS.md` for how data flows through the system
- See `03-REPORTS.md` for querying transaction data
- See `01-USER-ROLES.md` for permission-based data access

