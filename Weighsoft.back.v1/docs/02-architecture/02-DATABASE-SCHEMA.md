# Database Schema Documentation

## Overview

The Weighsoft database uses MySQL with custom UUID functions. Primary keys for main entities use UUIDs stored as `BINARY(16)`, while reference tables use auto-incrementing integers.

## UUID Functions

### UUID_TO_BIN(uuid, TRUE)
Converts a UUID string (36 characters) to BINARY(16) format.

**Usage:**
```sql
WHERE id = UUID_TO_BIN('550e8400-e29b-41d4-a716-446655440000', TRUE)
```

### BIN_TO_UUID(binary_uuid, TRUE)
Converts BINARY(16) to UUID string format.

**Usage:**
```sql
SELECT BIN_TO_UUID(id, TRUE) as id FROM weighingheaders
```

## Core Tables

### companies
Company/tenant information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| registered_name | VARCHAR | Company name |
| display_custom_logo_img | TEXT | Base64 logo image |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |
| deleted_at | TIMESTAMP | Soft delete timestamp |

**Relationships:**
- One-to-many: `sites`
- One-to-many: `users`
- One-to-many: `settings`

### sites
Physical locations within companies.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_name | VARCHAR | Site name |
| decimals | INT | Decimal places for weights |
| measure_type | VARCHAR | Unit of measure (kg, ton, etc.) |
| deduct_flow | VARCHAR | Flow deduction setting |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`
- One-to-many: `work_stations`
- One-to-many: `weighingheaders`

### work_stations
Individual weighing workstations.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| site_id | INT | Foreign key to sites |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Workstation name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `sites`
- Many-to-one: `companies`
- One-to-many: `weighingheaders`

### weighbridges
Physical scale hardware.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| site_id | INT | Foreign key to sites |
| company_id | INT | Foreign key to companies |
| header | VARCHAR | Weighbridge name/identifier |
| ip_address | VARCHAR | IP address for scale integration |
| port | VARCHAR | Communication port |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `sites`
- Many-to-one: `companies`
- One-to-many: `weighingheaders`

### settings
Weighing configuration profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Setting profile name |
| type_of_weighing | VARCHAR | Single, two-weight, multi-axle |
| prefix | VARCHAR | Transaction number prefix |
| haulier | VARCHAR | Enable haulier selection |
| business_partner | VARCHAR | Enable business partner |
| use_product_list | VARCHAR | Enable product selection |
| stored_tares | VARCHAR | Enable stored tares |
| numberplate_1/2/3 | VARCHAR | Enable number plate fields |
| numberplate_recognition | VARCHAR | Enable auto recognition |
| first_can_axel | VARCHAR | Enable first axle |
| second_can_axel | VARCHAR | Enable second axle |
| goods_type | VARCHAR | Received/Dispatched |
| print_ticket | VARCHAR | Print options |
| reprint | VARCHAR | Enable reprint |
| custom_fields | VARCHAR | Enable custom fields |
| user_defined_input1-20 | VARCHAR | Custom field types |
| user_defined_name1-20 | VARCHAR | Custom field labels |
| user_defined_val1-20 | TEXT | Custom field default values |
| user_defined_rep1-20 | VARCHAR | Include in reports |
| silo_verification | VARCHAR | Require verification |
| use_cameras | VARCHAR | Enable cameras |
| display_cameras | VARCHAR | Show cameras in UI |
| print_cameras_on_ticket | VARCHAR | Include on ticket |
| ticket_header | VARCHAR | Show header |
| display_custom_header_img | TEXT | Base64 header image |
| ticket_footer | VARCHAR | Show footer |
| display_custom_footer_img | TEXT | Base64 footer image |
| enable_moisture | VARCHAR | Enable moisture deduction |
| moisture_deduction_level | VARCHAR | Moisture threshold |
| enable_handling | VARCHAR | Enable handling charges |
| pallet_enabled | VARCHAR | Enable pallet charges |
| tares_enabled | VARCHAR | Enable tare weights |
| invoice_enabled | VARCHAR | Enable invoicing |
| contract_enabled | VARCHAR | Enable contracts |
| measure_type | VARCHAR | Unit of measure |
| deduct_flow | VARCHAR | Flow deduction |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`
- One-to-many: `weighingheaders`

### weighingheaders
Main weighing transaction records.

| Column | Type | Description |
|--------|------|-------------|
| id | BINARY(16) | Primary key (UUID) |
| transaction | VARCHAR | Transaction number |
| settings_id | INT | Foreign key to settings |
| RegNumber | VARCHAR | Vehicle registration 1 |
| RegNumber2 | VARCHAR | Vehicle registration 2 |
| RegNumber3 | VARCHAR | Vehicle registration 3 |
| Custom1-20 | VARCHAR | Custom fields |
| FirstWeight | FLOAT | First weight value |
| SecondWeight | FLOAT | Second weight (tare) |
| TotalWeight | FLOAT | Total weight |
| NettWeight | INT | Net weight (calculated) |
| businesspartner_id | INT | Foreign key to business_partners |
| product_id | INT | Foreign key to products |
| grade_id | INT | Foreign key to grades |
| grades | VARCHAR | Grade text |
| haulier_id | INT | Foreign key to hauliers |
| weighbridge_id | INT | Foreign key to weighbridges |
| site_id | INT | Foreign key to sites |
| company_id | INT | Foreign key to companies |
| workstation_id | INT | Foreign key to work_stations |
| reason | VARCHAR | Reason for status change |
| status | VARCHAR | OPEN, VERIFY, CLOSED |
| price | VARCHAR | Price per unit |
| moisture_deduction | VARCHAR | Moisture deduction amount |
| handling_charges | VARCHAR | Handling charges |
| pallet_id | INT | Foreign key to pallets |
| pallet_charges | VARCHAR | Pallet charges |
| pallet_count | INT | Number of pallets |
| tare_id | INT | Foreign key to tares |
| firstWeightUserId | INT | User who captured first weight |
| secondWeightUserId | INT | User who captured second weight |
| verifyUserId | INT | User who verified |
| deletedUserId | INT | User who deleted |
| moisture_threshold | FLOAT | Moisture threshold |
| moistureCoefficient | FLOAT | Moisture coefficient |
| moistureWeight | FLOAT | Moisture weight |
| handlingWeight | FLOAT | Handling weight |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- One-to-many: `weighingtransactions`
- One-to-one: `contract_transactions`
- Many-to-one: `settings`
- Many-to-one: `companies`, `sites`, `work_stations`, `weighbridges`

### weighingtransactions
Individual axle weight records.

| Column | Type | Description |
|--------|------|-------------|
| id | BINARY(16) | Primary key (UUID) |
| weighing_header_id | BINARY(16) | Foreign key to weighingheaders |
| Status | VARCHAR | Transaction status |
| Weight1 | FLOAT | Axle 1 weight |
| Weight2 | FLOAT | Axle 2 weight |
| Weight3 | FLOAT | Axle 3 weight |
| Weight4 | FLOAT | Axle 4 weight |
| Weight5 | FLOAT | Axle 5 weight |
| Weight6 | FLOAT | Axle 6 weight |
| WeightTotal | FLOAT | Total weight |
| site_id | INT | Foreign key to sites |
| workstation_id | INT | Foreign key to work_stations |
| company_id | INT | Foreign key to companies |
| AxelSetups | INT | Axle configuration |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `weighingheaders`
- One-to-many: `weighingcameras`

### weighingcameras
Camera images linked to weighing transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | BINARY(16) | Primary key (UUID) |
| weighing_transaction_id | BINARY(16) | Foreign key to weighingtransactions |
| base64 | TEXT | Base64 encoded image |
| isnpr | VARCHAR | Is number plate recognition |
| site_id | INT | Foreign key to sites |
| company_id | INT | Foreign key to companies |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `weighingtransactions`

### contracts
Contract definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| name | VARCHAR | Contract name |
| businesspartner_id | INT | Foreign key to business_partners |
| product_id | INT | Foreign key to products |
| contract_number | VARCHAR | Contract number |
| contract_date | DATE | Contract start date |
| expiry_date | DATE | Contract expiry date |
| amount | DECIMAL | Contract amount |
| price | VARCHAR | Price per unit |
| direction | VARCHAR | Inbound/Outbound |
| linked_contact_id | INT | Linked contact |
| reason | VARCHAR | Reason for deletion |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`, `sites`
- One-to-many: `contract_transactions`

### contract_transactions
Contract fulfillment tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | BINARY(16) | Primary key (UUID) |
| contract_id | INT | Foreign key to contracts |
| weighing_header_id | BINARY(16) | Foreign key to weighingheaders |
| amount | DECIMAL | Amount delivered |
| site_id | INT | Foreign key to sites |
| company_id | INT | Foreign key to companies |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `contracts`
- One-to-one: `weighingheaders`

### products
Product catalog.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Product name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### grades
Product quality grades.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Grade name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### business_partners
Customer/supplier information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Partner name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### hauliers
Transport company information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Haulier name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### pallets
Pallet type definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| name | VARCHAR | Pallet name |
| charge | DECIMAL | Charge per pallet |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### tares
Stored tare weight records.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| RegNumber | VARCHAR | Vehicle registration |
| tare_weight | FLOAT | Stored tare weight |
| expiry_date | DATE | Tare expiry date |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### users
User accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | User name |
| email | VARCHAR | Email (unique) |
| password | VARCHAR | Hashed password |
| role_id | INT | Foreign key to user_types |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`
- Many-to-one: `user_types`

### user_types
Permission groups.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Role name |
| permissions | TEXT | JSON permissions |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### cameras
IP camera definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| workstation_id | INT | Foreign key to work_stations |
| weighbridge_id | INT | Foreign key to weighbridges |
| name | VARCHAR | Camera name |
| ip_address | VARCHAR | Camera IP |
| auth_type | VARCHAR | Authentication type |
| username | VARCHAR | Camera username |
| password | VARCHAR | Camera password |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

### transactions
Transaction number sequence tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| settings_id | INT | Foreign key to settings |
| current_id | INT | Current transaction number |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### reporting
Report definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Report name |
| email | VARCHAR | Recipient emails (semicolon-separated) |
| time_frame | INT | Days for report period |
| last_report_on | TIMESTAMP | Last report sent |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### exceptions
Exception/error logging.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| workstation_id | INT | Foreign key to work_stations |
| weighbridge_id | INT | Foreign key to weighbridges |
| code | VARCHAR | Exception code |
| description | TEXT | Exception description |
| jsondata | TEXT | JSON data |
| comment | TEXT | User comment |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### error_log
System error logging.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| error | TEXT | Error message |
| created_at | TIMESTAMP | |

### axelsetups
Axle configuration setups.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| name | VARCHAR | Setup name |
| configuration | TEXT | JSON configuration |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`

### axletypes
Axle type definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Axle type name |
| description | TEXT | Description |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### transactions
Transaction number sequence tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| company_id | INT | Foreign key to companies |
| site_id | INT | Foreign key to sites |
| settings_id | INT | Foreign key to settings |
| current_id | INT | Current transaction number |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`, `sites`, `settings`
- Unique: Combination of company_id, site_id, settings_id

### user_workstation
User to workstation assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | Foreign key to users |
| workstation_id | INT | Foreign key to work_stations |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `users`
- Many-to-one: `work_stations`

### rfid_vehicles
RFID vehicle tag mappings.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| registration_number | VARCHAR | Vehicle registration number |
| rfid | VARCHAR | RFID tag identifier |
| company_id | INT | Foreign key to companies |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Relationships:**
- Many-to-one: `companies`

**Purpose:**
- Maps RFID tags to vehicle registration numbers
- Used for automatic vehicle identification during weighing
- Company-scoped for multi-tenant isolation

## Indexes

### Primary Keys
- All tables have primary keys
- UUID tables use `BINARY(16)` primary keys
- Reference tables use `INT` auto-increment primary keys

### Foreign Keys
- Foreign key relationships are defined
- Indexes on foreign key columns for performance

### Common Indexes
- `company_id` - Indexed for multi-tenant queries
- `site_id` - Indexed for site filtering
- `status` - Indexed on weighingheaders for status queries
- `transaction` - Indexed for transaction number lookups
- `deleted_at` - Indexed for soft delete queries

## Data Types

### UUID Storage
- Stored as `BINARY(16)` in database
- Converted to/from string format in application
- Uses custom MySQL functions for conversion

### Timestamps
- `created_at` - Automatic on insert
- `updated_at` - Automatic on update
- `deleted_at` - Set on soft delete, NULL otherwise

### Text Fields
- `TEXT` - For long text (base64 images, JSON)
- `VARCHAR` - For variable-length strings
- `VARCHAR(255)` - Common default length

### Numeric Fields
- `INT` - For integers
- `FLOAT` - For decimal weights
- `DECIMAL` - For precise monetary values

## Constraints

### Unique Constraints
- `users.email` - Unique email addresses
- `transactions` - Unique per company/site/settings combination

### Foreign Key Constraints
- Cascade on delete (where applicable)
- Restrict on delete (where data integrity required)

## Soft Deletes

Tables using soft deletes:
- `weighingheaders`
- `weighingtransactions`
- `contracts`
- `contract_transactions`
- `companies`
- `sites`
- `work_stations`
- `products`
- `grades`
- `business_partners`
- `hauliers`
- `pallets`
- `tares`
- `users`
- `cameras`

Soft delete behavior:
- Records marked with `deleted_at` timestamp
- Excluded from normal queries
- Can be queried with `withTrashed()` or `onlyTrashed()`
- Can be restored or permanently deleted

## Data Relationships Summary

```
companies
  ├── sites
  │     ├── work_stations
  │     ├── weighbridges
  │     └── weighingheaders
  ├── settings
  │     └── weighingheaders
  ├── users
  ├── products
  ├── grades
  ├── business_partners
  ├── hauliers
  ├── rfid_vehicles
  └── contracts
        └── contract_transactions
              └── weighingheaders

weighingheaders
  ├── weighingtransactions
  │     └── weighingcameras
  └── contract_transactions
```

