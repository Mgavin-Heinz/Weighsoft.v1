# Smart Hauliers Feature - Implementation Plan

## Feature Overview

Enable automatic haulier selection based on vehicle registration number (numberplate) captured during weighing operations.

## Business Logic

1. **Company Level Toggle**: Each company can enable/disable "Smart Hauliers"
2. **Vehicle Registration**: Store vehicles with registration numbers linked to hauliers
3. **Auto-Selection**: When numberplate is captured, system auto-selects the linked haulier
4. **Invoicing Chain**: Hauliers link to business partners for invoice generation

## Data Flow

```
Numberplate Captured → Vehicle Lookup → Haulier Auto-Selected → Business Partner Auto-Selected
```

**Enhanced Auto-Selection:**
- When numberplate is captured, lookup vehicle
- Vehicle → Haulier (auto-select haulier dropdown)
- Haulier → Business Partner (auto-select business partner dropdown if linked)
- Both selections can be manually overridden by user

## User Assumptions (Confirmed)

- Vehicle registration unique per company
- One vehicle = one haulier (many-to-one)
- One haulier = one business partner (optional, for invoicing)
- Feature only active when enabled on company

---

## Current System Analysis

### Existing Tables (To Research)

- [ ] **hauliers table** - Check structure, fields, relationships
- [ ] **business_partners table** - Check structure, fields, relationships
- [ ] **weighing_headers table** - Check how haulier_id is stored
- [ ] **companies table** - Check existing boolean flags pattern

### Existing Controllers (To Research)

- [ ] **HaulierController** - Check CRUD patterns, validation, UUID handling
- [ ] **BusinessPartnerController** - Check CRUD patterns
- [ ] **WeighingHeadersController** - Check how hauliers are currently handled

### Existing Frontend (To Research)

- [ ] **Haulier UI** - Check list/create/edit screens, routes, controllers
- [ ] **Business Partner UI** - Check list/create/edit screens
- [ ] **Weighing Screens** - Check how haulier dropdown currently works

---

## Database Schema Changes

### 1. Companies Table Update

**Migration**: `add_smart_hauliers_to_companies.php`

```sql
ALTER TABLE companies ADD COLUMN smart_hauliers BOOLEAN DEFAULT FALSE;
```

**Model Update**: `Company.php`
- Add `smart_hauliers` to `$fillable`

---

### 2. Vehicles Table (NEW)

**Migration**: `create_vehicles_table.php`

```sql
CREATE TABLE vehicles (
    id BINARY(16) PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    haulier_id BINARY(16),
    company_id BINARY(16) NOT NULL,
    site_id BINARY(16),
    workstation_id BINARY(16),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (haulier_id) REFERENCES hauliers(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE KEY unique_registration_per_company (registration_number, company_id)
);
```

**Model**: `Vehicle.php`
- UUID primary key
- SoftDeletes
- Relationships: belongsTo(Haulier), belongsTo(Company)

---

### 3. Hauliers Table Update

**Migration**: `add_business_partner_to_hauliers.php`

**Fields to check/add**:
- `business_partner_id` BIGINT UNSIGNED NULL
- Foreign key to businesspartners table

**Model Update**: `Haulier.php`
- Add `business_partner_id` to `$fillable`
- Add relationship: `belongsTo(BusinessPartner)`
- Add relationship: `hasMany(Vehicle)`

---

### 4. UserTypes Table Update

**Migration**: `add_vehicles_to_usertypes.php`

**Field to add**:
- `vehicles` VARCHAR (stores "true" or "false")
- Nullable, default "false"

**Model Update**: `UserType.php`
- Add `vehicles` to `$fillable`
- Add `whereVehicles($value)` method (auto-generated)

**Purpose**: Controls user access to Vehicles management screen
- User with `vehicles = "true"` can access Vehicles menu and CRUD operations
- User with `vehicles = "false"` cannot see or access Vehicles functionality
- Same privilege pattern as existing `hauliers`, `business_partner`, `products`, etc.

---

## Backend Implementation

### 1. VehicleController

**File**: `app/Http/Controllers/VehicleController.php`

**Extends**: `JwtAuthController`

**Methods**:
- `index()` - List all vehicles (with filters, pagination)
- `store(Request $request)` - Create new vehicle
- `show($id)` - Get single vehicle
- `update(Request $request, $id)` - Update vehicle
- `destroy($id)` - Soft delete vehicle
- `lookup($registration)` - **Special endpoint for weighing screen auto-selection**

**Lookup Endpoint Details**:
```php
GET /api/vehicle/lookup/{registration}?company_id=X

Response:
{
    "id": 123,
    "registration_number": "ABC123",
    "haulier_id": 456,
    "haulier": {
        "id": 456,
        "code": "FAST",
        "name": "Fast Transport",
        "displayName": "Fast Transport (FAST)",
        "business_partner_id": 789,
        "business_partner": {
            "id": 789,
            "code": "TRANS",
            "name": "Transport Co Ltd",
            "displayName": "Transport Co Ltd (TRANS)"
        }
    }
}
```

**Validation Rules**:
```php
[
    'registration_number' => 'required|string|max:50',
    'haulier_id' => 'required|integer|exists:hauliers,id',
    'company_id' => 'required|integer',
]
```

**ID Handling**:
- Uses BIGINT IDs (not UUIDs) to match hauliers pattern
- No UUID conversion needed

---

### 2. API Routes

**File**: `routes/api.php`

```php
Route::resource('vehicle', 'VehicleController');
Route::get('vehicle/lookup/{registration}', [VehicleController::class, 'lookup']);
```

---

### 3. WeighingHeadersController Update

**Existing Behavior**:
- `store(Request $request)` method creates new weighing headers
  - Receives `$data['haulier_id']` from frontend (optional, can be null)
  - Unsets `haulier_id` if empty/null (lines 130-132)
  - Saves to `weighingHeaders` table via `WeighingHeaderService->insertWeighingHeader()`
  - Numberplate stored in `$data['RegNumber']` (primary), `RegNumber2`, `RegNumber3` (optional)
  - **NO automatic haulier lookup** - haulier_id must be manually selected by user

- `update(Request $request, string $id)` method updates existing weighing headers
  - Receives `$data['haulier_id']` from frontend (optional)
  - Preserves fields including `RegNumber`, `RegNumber2`, `RegNumber3`
  - Updates via `WeighingHeaderService->updateWeighingHeader()`
  - **NO automatic haulier lookup** - haulier_id changes only if user manually changes it

- `WeighingHeaderService` handles:
  - Search/filter by `RegNumber` (line 39-40)
  - Columns include: `transaction`, `RegNumber`, `weighbridge`, `product`, `businesspartner`
  - Insert/update operations for all numberplate fields

**New Behavior** (Smart Hauliers feature):
- **NO changes to WeighingHeadersController required!**
- Auto-selection will be handled **entirely in the frontend**:
  1. When `RegNumber` is entered/captured (weighing_create.js)
  2. If company has `smart_hauliers` enabled (from settings)
  3. Call vehicle lookup API: `GET /api/vehicle/lookup/{registration}?company_id=X`
  4. If vehicle found → auto-populate `vm.selected_haulier` object
  5. **If haulier has business_partner_id → auto-populate `vm.selected_businessPartner` object**
  6. User can still manually override either selection
  7. On save, `haulier_id` and `businesspartner_id` sent to backend as usual (no backend changes needed)

**Why no backend changes?**
- Backend already accepts `haulier_id` and `businesspartner_id` as optional fields
- Backend doesn't care how they were selected (manual vs auto)
- Separation of concerns: lookup logic in frontend, storage logic in backend
- Easier to disable feature or add manual override in UI

**Auto-Selection Chain:**
```
RegNumber "ABC123" entered
    ↓
Vehicle lookup API call
    ↓
Returns: Vehicle + Haulier + Business Partner (if linked)
    ↓
Auto-populate haulier dropdown: "Fast Transport (FAST)"
    ↓
Auto-populate business partner dropdown: "Transport Co Ltd (TRANS)" (if linked)
    ↓
Show badges: 🚗 "Auto-selected from vehicle ABC123"
    ↓
User saves → Both IDs sent to backend as normal
```

---

## Frontend Implementation

### 1. Company Form Update

**Controller**: (To identify after research)

**Template**: (To identify after research)

**Changes**:
- Add checkbox/toggle for "Enable Smart Hauliers"
- Follow existing boolean field pattern

---

### 2. Vehicles Management Screen (NEW)

**Routes** (`routes.js`):
```javascript
.state('app.vehicle', {
    url: '/vehicle',
    templateUrl: appHelper.templatePath('vehicles/list'),
    controller: 'VehiclesCtrl as System',
    ncyBreadcrumb: { label: 'Vehicles' }
})
```

**Controller**: `app/js/controllers/vehicles.js`
- Pattern to follow: (Check HaulierController pattern)

**Template**: `app/tpls/vehicles/list.html`
- DataTable with columns:
  - Registration Number
  - Haulier Name
  - Company
  - Actions (Edit, Delete)
- Create/Edit modal

---

### 3. Weighing Screens Update

**Controllers**:
- `weighing_create.js`
- `weighing_update.js`

**Changes**:
- Watch `vm.data.numberplate_1` for changes
- If company has `smart_hauliers` enabled
- Call vehicle lookup API
- Auto-populate haulier dropdown
- **Auto-populate business partner dropdown (if haulier has one linked)**
- Show visual indicator (auto-selected vs manual)

**Template Updates**:
- `create.html`
- `update.html`

**New UI Elements**:
- Badge/icon showing "🚗 Auto-selected from vehicle ABC123"
- Display on both haulier AND business partner fields
- Allow manual override for both selections
- Clear visual distinction between auto-selected and manually selected

**Example UI:**
```
Haulier: [Fast Transport (FAST) ▼] 🚗 Auto-selected from vehicle ABC123
Business Partner: [Transport Co Ltd (TRANS) ▼] 🚗 Auto-selected from haulier
```

---

## Testing Checklist

### Database
- [ ] Migrations run successfully
- [ ] UUID conversions work correctly
- [ ] Foreign keys enforce relationships
- [ ] Unique constraint on registration per company

### Backend API
- [ ] Vehicle CRUD operations work
- [ ] Vehicle lookup by registration works
- [ ] Haulier-to-business-partner link works
- [ ] Weighing screen auto-selection works

### Frontend
- [ ] Company smart_hauliers toggle works
- [ ] Vehicles list/create/edit screens work
- [ ] Weighing screen auto-selects haulier
- [ ] Manual override works
- [ ] Visual indicators display correctly

---

## Files to Create/Modify

### Backend - New Files
- `database/migrations/YYYY_MM_DD_add_smart_hauliers_to_companies.php`
- `database/migrations/YYYY_MM_DD_add_business_partner_to_hauliers.php`
- `database/migrations/YYYY_MM_DD_add_vehicles_to_usertypes.php`
- `database/migrations/YYYY_MM_DD_create_vehicles_table.php`
- `database_scripts/XX-addSmartHauliers.sql` (includes all 4 migrations for non-migration systems)
- `app/Models/Vehicle.php`
- `app/Http/Controllers/VehicleController.php`

### Backend - Modified Files
- `app/Models/Company.php` (add smart_hauliers to fillable)
- `app/Models/Haulier.php` (add business_partner_id to fillable, add relationships)
- `app/Models/UserType.php` (add vehicles to fillable)
- `routes/api.php` (add vehicle routes)

### Frontend - New Files
- `app/js/controllers/vehicles.js`
- `app/tpls/vehicles/list.html`

### Frontend - Modified Files
- `app/js/routes.js` (add vehicles route)
- `app/js/controllers.js` (register VehiclesCtrl)
- `app/js/controllers/user_type.js` (add vehicles privilege field)
- `app/js/controllers/companies.js` (add smart_hauliers toggle)
- `app/tpls/companies/list.html` (add smart_hauliers checkbox)
- `app/js/controllers/weighing_create.js` (add auto-selection logic)
- `app/js/controllers/weighing_update.js` (add auto-selection logic)
- `app/tpls/weighing/create.html` (add auto-selection badges)
- `app/tpls/weighing/update.html` (add auto-selection badges)
- `app/js/factory.js` (add $Functions.Vehicle() service)

---

## Research Findings

### Hauliers Implementation ✅

**Backend:**
- **Table structure**: `hauliers` table exists
  - `id` (BIGINT UNSIGNED, auto-increment) - **NOTE: Not UUID!**
  - `code` (VARCHAR, unique)
  - `name` (VARCHAR)
  - `site_id` (BIGINT UNSIGNED, foreign key)
  - `company_id` (BIGINT UNSIGNED, foreign key)
  - `created_at`, `updated_at`, `deleted_at` (SoftDeletes)
  - **NO business_partner_id yet** - needs to be added

- **Model**: `app/Models/Haulier.php`
  - Uses SoftDeletes
  - Fillable: `['code', 'name', 'company_id', 'site_id']`
  - **Uses standard BIGINT ID, not UUID**

- **Controller**: `app/Http/Controllers/HaulierController.php`
  - Extends `JwtAuthController`
  - Standard CRUD (index, store, show, update, destroy)
  - Static `LoadData($companyId, $siteId)` method for filtered loading
  - Adds `displayName` field: `name . "(" . code . ")"`
  - Adds `report` field for display

- **Routes**: Resource route `/api/haulier`

**Frontend:**
- **Controller**: `app/js/controllers/hauliers.js`
  - Pattern: `HauliersCtrl` with `controller as System`
  - Filtered by company_id and site_id (dropdowns at top)
  - Uses `$Functions.Haulier()` to load data
  - Form displayed inline when Add/Edit clicked
  - Uses AngularJS schema forms (sf-schema, sf-form)
  - Form fields: code, name (company_id and site_id set from header dropdowns)

- **Route**: `app.hauliers` at `/hauliers`
  - Template: `hauliers/list`
  - Controller: `HauliersCtrl as System`

- **Template**: `app/tpls/hauliers/list.html`
  - Panel with company/site dropdowns at top
  - "Add New" button (only shows when company & site selected)
  - DataTable for list view
  - Inline form for add/edit (shows/hides with `FormDisplay` flag)
  - Uses AngularJS schema forms for form generation

- **Factory/Service**: `app/js/factory.js`
  - `$Functions.Haulier()` service
  - Loads via `Restangular.all("haulier").getList($navigation.get())`
  - Formats data with `displayName`, `report`, etc.

### Business Partners Implementation ✅

**Backend:**
- **Table structure**: `businesspartners` table exists
  - `id` (BIGINT UNSIGNED, auto-increment) - **NOTE: Not UUID!**
  - `code` (VARCHAR, unique)
  - `name` (VARCHAR)
  - `vat_nr`, `street`, `suburb`, `city`, `postal_code` (VARCHAR, nullable)
  - `site_id` (BIGINT UNSIGNED, foreign key)
  - `company_id` (BIGINT UNSIGNED, foreign key)
  - `created_at`, `updated_at`, `deleted_at` (SoftDeletes)

- **Model**: `app/Models/BusinessPartner.php`
  - Uses SoftDeletes
  - Table name: `businesspartners`
  - Fillable: `['code', 'name', 'vat_nr', 'street', 'suburb', 'city', 'postal_code', 'site_id', 'company_id']`
  - **Uses standard BIGINT ID, not UUID**

### Companies Implementation ✅

**Backend:**
- **Table structure**: `companies` table exists
  - `id` (BIGINT UNSIGNED, auto-increment)
  - `code`, `registered_name`, `tel`, `fax`, `email`, etc.
  - Multiple address fields (street, suburb1, city1, postal_code1, etc.)
  - `terms` (TEXT)
  - `display_custom_logo_img` (BINARY/BLOB)
  - `created_at`, `updated_at`, `deleted_at` (SoftDeletes)
  - **NO smart_hauliers flag yet** - needs to be added

**Frontend:**
- **Controller**: `app/js/controllers/companies.js`
  - Pattern: `CompaniesCtrl` with `controller as System`
  - List/Edit pattern (no company/site filter needed - top level)
  - Uses Restangular for CRUD
  - Form displayed inline when Add/Edit clicked
  - Uses plain HTML form (not schema forms)

- **Route**: `app.company` at `/company`
  - Template: `companies/list`
  - Controller: `CompaniesCtrl as System`

- **Template**: `app/tpls/companies/list.html`
  - Simple panel with "Add New" button
  - DataTable for list view
  - Inline form for add/edit (manual HTML form, not schema)
  - All company fields as text inputs
  - Logo image upload with base64 encoding

### Weighing Screens Current Behavior ✅

**Haulier Selection:**
- **Current implementation**: Manual dropdown selection only
- **Dropdown**: `ui-select` component in `app/tpls/weighing/create.html` (line 199-207)
  - Model: `System.selected_haulier`
  - List: `System.Hauliers`
  - Display: `option.displayName` (from factory)
  - Only shows if `System.Setting.haulier == 'Yes'`
  - On change: `System.SelectOnChange('haulier')`

- **Numberplate fields**:
  - `System.Single.RegNumber` - Main numberplate
  - `System.Single.RegNumber2` - Optional second numberplate
  - `System.Single.RegNumber3` - Optional third numberplate
  - Camera recognition available: `System.NPR()` function
  - Validation: `System.NumberplateChange()` checks for duplicates

- **Data binding**: 
  - Selected haulier stored in `vm.selected_haulier` (object)
  - On change, sets `vm.Single.haulier_id = vm.selected_haulier.id`
  - Populates `vm.ReportData.Hauliers = haulier.report` for printing

- **Data loading**:
  - Hauliers loaded via `vm.Hauliers = data.haulier` from weighing endpoint
  - Also uses `$Functions.Haulier()` in other screens

---

## Critical Findings & Design Decisions

### 1. **ID Strategy: BIGINT vs UUID**
- Hauliers, BusinessPartners, Companies use **BIGINT AUTO-INCREMENT** IDs
- Weighing system uses **UUIDs** (BINARY(16))
- **Decision**: New `vehicles` table should use **BIGINT** to match hauliers pattern
- Foreign key `haulier_id` will be BIGINT, not UUID

### 2. **Companies Table Boolean Flags**
- No existing boolean flags pattern found in companies table
- All existing fields are strings or text
- **Decision**: Add `smart_hauliers` as BOOLEAN (TINYINT(1)) column

### 3. **Hauliers-to-BusinessPartners Link**
- Currently NO link exists
- **Decision**: Add `business_partner_id` (BIGINT UNSIGNED, nullable) to hauliers table

### 4. **Frontend Patterns**
- **Hauliers pattern**: Company/Site filter + inline form + DataTable + schema forms
- **Companies pattern**: No filter + inline form + DataTable + manual HTML forms
- **Decision**: For Vehicles, follow **Hauliers pattern** (company/site filter required)

### 5. **Weighing Screen Auto-Selection**
- Numberplate captured via camera (`System.NPR()`) or manual entry
- Need to watch `System.Single.RegNumber` for changes
- On change, check if `System.Setting.smart_hauliers == "Yes"` (from company settings)
- Call vehicle lookup API
- Auto-populate `System.selected_haulier` if found
- Show indicator badge (e.g., "Auto-selected from vehicle ABC123")

---

## Questions Answered

1. ✅ Does hauliers table already have business_partner_id? **NO - needs to be added**
2. ✅ What is the exact structure of hauliers table? **BIGINT ID, code, name, site_id, company_id, timestamps**
3. ✅ How are hauliers displayed in weighing screens currently? **ui-select dropdown with displayName**
4. ✅ What UI pattern is used for haulier management? **Company/Site filter + inline form + schema forms + DataTable**
5. ✅ Is there a service for haulier lookups? **Yes: $Functions.Haulier() in factory.js**
6. ✅ How are dropdowns populated in weighing forms? **ui-select with ng-model and ng-options**
7. ✅ What is the menu structure for hauliers/business partners? **Top-level menu items in routes.js**

---

## Updated Implementation Plan

### Database Changes

1. **Companies Table**: Add `smart_hauliers` BOOLEAN (TINYINT(1), default FALSE)
2. **Hauliers Table**: Add `business_partner_id` BIGINT UNSIGNED nullable, foreign key to businesspartners
3. **UserTypes Table**: Add `vehicles` VARCHAR (stores "true"/"false") for user access control
4. **Vehicles Table (NEW)**: 
   - `id` BIGINT AUTO-INCREMENT (not UUID!)
   - `registration_number` VARCHAR(50) NOT NULL
   - `haulier_id` BIGINT UNSIGNED foreign key to hauliers
   - `company_id` BIGINT UNSIGNED foreign key to companies
   - `site_id` BIGINT UNSIGNED foreign key to sites
   - Timestamps + SoftDeletes
   - UNIQUE constraint on (registration_number, company_id)

### Backend Implementation

1. **VehicleController**: Follow HaulierController pattern exactly
2. **Vehicle Model**: Follow Haulier model pattern (BIGINT ID, SoftDeletes)
3. **Add lookup endpoint**: `GET /api/vehicle/lookup/{registration}?company_id=X`
4. **Update Haulier model**: Add business_partner_id to fillable, add relationship

### Frontend Implementation

1. **Companies form**: Add checkbox for "Enable Smart Hauliers" (after logo section)
2. **Vehicles screen**: Clone hauliers pattern exactly:
   - Company/Site filter at top
   - Inline form with: Registration Number, Haulier (dropdown)
   - DataTable list view
   - Schema forms OR manual forms (decide based on simplicity)
3. **Weighing screens**: 
   - Watch `System.Single.RegNumber` for changes
   - Check `System.Setting.smart_hauliers` flag
   - Call vehicle lookup API
   - Auto-populate `System.selected_haulier`
   - **Auto-populate `System.selected_businessPartner` (if haulier has one)**
   - Add visual indicator badges for both fields
   - Allow manual override for both selections

---

## Next Steps

1. ✅ Create this documentation
2. ✅ Search codebase for existing patterns
3. ✅ Update this document with findings
4. ⏳ Get user confirmation on approach
5. ⏳ Begin implementation following existing patterns

---

**Status**: Research Complete - AWAITING USER CONFIRMATION to proceed with implementation

