# Frontend Controllers Documentation

## Overview

This document provides comprehensive documentation for all AngularJS controllers in the Weighsoft frontend application.

## Controller Organization

Controllers are organized in `app/js/controllers/` with feature-based subdirectories for complex features.

## Core Weighing Controllers

### WeighingCtrl
**File:** `app/js/controllers/weighing.js`

**Purpose:** Main weighing list/overview controller

**Key Features:**
- List weighing headers
- Filter by company, site, workstation
- Filter by status (OPEN, VERIFY, CLOSED)
- Navigate to create/update weighing
- Display weighing information

**Key Properties:**
- `vm.Companies` - Company list
- `vm.Sites` - Site list
- `vm.Workstations` - Workstation list
- `vm.HeaderSingle` - Filter criteria
- `vm.baseData` - Restangular resource

**Key Methods:**
- `vm.Functions.Single(type)` - Load single entity (company, site, workstation)
- Navigation to create weighing

### WeighingCreateCtrl
**File:** `app/js/controllers/weighing_create.js`

**Purpose:** Create new weighing transaction

**Key Features:**
- Real-time scale integration (WebSocket)
- Camera image capture
- Multi-axle weight entry
- Contract linking
- Invoice generation
- Ticket printing
- Moisture/handling calculations
- Pallet charge calculations

**Key Properties:**
- `vm.Single` - Current weighing data
- `vm.Setting` - Selected weighing settings
- `vm.Site` - Site configuration
- `vm.ReportData` - Master data for display
- `vm.invoice` - Invoice data
- `vm.contractStatus` - Contract tracking
- `vm.nettWeight` - Calculated net weight
- `vm.Cameras` - Camera list
- `vm.ScannedUser` - Fingerprint scanned user

**Key Methods:**
- `vm.updateNetWeight()` - Calculate net weight with deductions
- `vm.calculateMoistureDeduction()` - Calculate moisture
- `vm.calculateHandlingCharges()` - Calculate handling
- `vm.saveForm()` - Save weighing header
- `vm.printTicket()` - Print weighing ticket
- `vm.captureCamera()` - Capture camera image

**State Parameters:**
- `company_id`, `site_id`, `workstation_id`
- `FingerPrintVerify`
- `SiteDecimals`, `SiteMeasure_type`, `SiteDeduct_flow`

### WeighingUpdateCtrl
**File:** `app/js/controllers/weighing_update.js`

**Purpose:** Update existing weighing header

**Key Features:**
- Edit weighing header
- Update weights
- Modify transaction details
- Status changes
- Same calculation logic as create

**Key Methods:**
- `vm.loadWeighing()` - Load existing weighing
- `vm.updateNetWeight()` - Recalculate net weight
- `vm.saveForm()` - Update weighing header

### VerifyCtrl
**File:** `app/js/controllers/verify.js`

**Purpose:** Verify weighing headers with VERIFY status

**Key Features:**
- List weighings requiring verification
- Manual verification workflow
- Silo override
- Status change to CLOSED

**Key Methods:**
- `vm.verifyWeighing()` - Verify weighing header
- `vm.overrideSilo()` - Silo override

## Reprint Controllers

### ReprintListCtrl
**File:** `app/js/controllers/reprint_list.js`

**Purpose:** List weighings for reprint

**Key Features:**
- Filter weighings
- Search functionality
- Pagination
- Navigate to edit/print/delete

**Key Properties:**
- `vm.HeaderSingle` - Filter criteria
- `vm.baseData` - Restangular resource
- `vm.ReportData` - Master data

### ReprintEditCtrl
**File:** `app/js/controllers/reprint_edit.js`

**Purpose:** Edit weighing before reprint

**Key Features:**
- Edit weighing details
- Update weights
- Save changes

### ReprintPrintCtrl
**File:** `app/js/controllers/reprint_print.js`

**Purpose:** Print weighing ticket

**Key Features:**
- Display ticket for printing
- Print functionality
- Ticket preview

### ReprintDeleteCtrl
**File:** `app/js/controllers/reprint_delete.js`

**Purpose:** Delete weighing with reason

**Key Features:**
- Soft delete weighing
- Reason entry
- Exception logging

## Master Data Controllers

### CompaniesCtrl
**File:** `app/js/controllers/companies.js`

**Purpose:** Company management

**Key Features:**
- List companies
- Create company
- Edit company
- Delete company
- Upload company logo

**Key Methods:**
- `vm.loadData()` - Load company list
- `vm.addForm()` - Navigate to create
- `vm.editForm(id)` - Navigate to edit
- `vm.deleteForm(id)` - Delete company

### CompanyCtrl
**File:** `app/js/controllers/companies.js` (different controller)

**Purpose:** Company main view with nested views

### CompanyCreateCtrl
**File:** `app/js/controllers/companies.js`

**Purpose:** Create new company

**Key Features:**
- Company form
- Logo upload (Base64)
- Validation

### CompanyManageCtrl
**File:** `app/js/controllers/companies.js`

**Purpose:** Edit existing company

### SitesCtrl
**File:** `app/js/controllers/site.js`

**Purpose:** Site management

**Key Features:**
- List sites
- Create site
- Edit site
- Delete site

### SiteCreateCtrl
**File:** `app/js/controllers/site.js`

**Purpose:** Create new site

### SiteManageCtrl
**File:** `app/js/controllers/site.js`

**Purpose:** Edit existing site

### WorkstationsCtrl
**File:** `app/js/controllers/workstations.js`

**Purpose:** Workstation management

**Key Features:**
- List workstations
- Create workstation
- Edit workstation
- Delete workstation

### WeighbridgeCtrl
**File:** `app/js/controllers/weighbridge.js`

**Purpose:** Weighbridge management

**Key Features:**
- List weighbridges
- Create weighbridge
- Edit weighbridge
- Delete weighbridge
- Scale integration testing

### WeighbridgeSetupCtrl
**File:** `app/js/controllers/weighbridge_setup.js`

**Purpose:** Weighbridge hardware setup

**Key Features:**
- Scale port configuration
- WebSocket connection testing
- Scale command testing
- Real-time weight display

**Key Methods:**
- `vm.connectWebSocket()` - Connect to scale
- `vm.startScale()` - Start scale operation
- `vm.stopScale()` - Stop scale operation
- `vm.loadPorts()` - Load available serial ports

### ProductsCtrl
**File:** `app/js/controllers/products.js`

**Purpose:** Product management

**Key Features:**
- List products
- Create product
- Edit product
- Delete product

### BusinessPartnersCtrl
**File:** `app/js/controllers/businesspartners.js`

**Purpose:** Business partner management

**Key Features:**
- List business partners
- Create business partner
- Edit business partner
- Delete business partner

### HauliersCtrl
**File:** `app/js/controllers/hauliers.js`

**Purpose:** Haulier management

**Key Features:**
- List hauliers
- Create haulier
- Edit haulier
- Delete haulier

### GradesCtrl
**File:** `app/js/controllers/grades.js`

**Purpose:** Grade management

**Key Features:**
- List grades
- Create grade
- Edit grade
- Delete grade

### CameraCtrl
**File:** `app/js/controllers/camera.js`

**Purpose:** Camera management

**Key Features:**
- List cameras
- Create camera
- Edit camera
- Delete camera
- Test camera connection

## Contract Controllers

### ContractsCtrl
**File:** `app/js/controllers/contract/contracts.controller.js`

**Purpose:** Contract list

**Key Features:**
- List contracts
- Filter by company/site
- Navigate to contract details

### ContractListCtrl
**File:** `app/js/controllers/contract/list.controller.js`

**Purpose:** Contract details list

**Key Features:**
- List contracts for company/site
- Show contract details
- Navigate to edit/transactions

### ContractEditCtrl
**File:** `app/js/controllers/contract/edit.controller.js`

**Purpose:** Edit contract

**Key Features:**
- Edit contract details
- Update contract amount
- Modify expiry date

### ContractTransactionsCtrl
**File:** `app/js/controllers/contract/transactions.controller.js`

**Purpose:** Contract transaction tracking

**Key Features:**
- List contract transactions
- Show contract fulfillment
- Track remaining amount

## Pallet Controllers

### PalletsCtrl
**File:** `app/js/controllers/pallet/pallets.controller.js`

**Purpose:** Pallet list

**Key Features:**
- List pallets
- Filter by company/site
- Navigate to edit

### PalletListCtrl
**File:** `app/js/controllers/pallet/list.controller.js`

**Purpose:** Pallet list for company/site

### PalletEditCtrl
**File:** `app/js/controllers/pallet/edit.controller.js`

**Purpose:** Edit pallet

**Key Features:**
- Edit pallet details
- Update charge per pallet

## Tare Controllers

### TaresCtrl
**File:** `app/js/controllers/tare/tares.controller.js`

**Purpose:** Tare list

**Key Features:**
- List tares
- Filter by company/site
- Navigate to edit

### TareListCtrl
**File:** `app/js/controllers/tare/list.controller.js`

**Purpose:** Tare list for company/site

### TareEditCtrl
**File:** `app/js/controllers/tare/edit.controller.js`

**Purpose:** Edit tare

**Key Features:**
- Edit tare details
- Update expiry date
- Scale integration for tare capture

## Settings Controllers

### SettingsCtrl
**File:** `app/js/controllers/settings.js`

**Purpose:** Weighing settings management

**Key Features:**
- List settings
- Create setting
- Edit setting
- Delete setting
- Configure custom fields
- Upload header/footer images

### AxelSettingsCtrl
**File:** `app/js/controllers/axel_settings.js`

**Purpose:** Axle setup configuration

**Key Features:**
- List axle setups
- Create axle setup
- Edit axle setup
- Configure axle limits

## Reporting Controllers

### ReportingCtrl
**File:** `app/js/controllers/reporting.js`

**Purpose:** Exception reporting

**Key Features:**
- List exceptions
- Filter exceptions
- Exception details

### TransactionCtrl
**File:** `app/js/controllers/transaction.js`

**Purpose:** Transaction reporting

**Key Features:**
- Transaction list
- Date range filtering
- Grouping options (Site, Product, Weighing Type, etc.)
- Data aggregation
- Export functionality

**Key Methods:**
- `vm.filterData()` - Filter by date range
- `vm.filterGroup(group_id)` - Group data
- `vm.clear()` - Clear filters

**Grouping Options:**
- Total
- Site
- Weighing Type
- Product
- Site/Product

## User Management Controllers

### UserCtrl
**File:** `app/js/controllers/user.js`

**Purpose:** User management

**Key Features:**
- List users
- Create user
- Edit user
- Delete user
- Assign workstations

### UserTypeCtrl
**File:** `app/js/controllers/user_type.js`

**Purpose:** User type/permission management

**Key Features:**
- List user types
- Create user type
- Edit user type
- Configure permissions

## Authentication Controllers

### LoginCtrl
**File:** `app/js/controllers/login.js`

**Purpose:** User authentication

**Key Features:**
- Login form
- Credential validation
- JWT token storage
- Navigation to dashboard

**Key Methods:**
- `vm.login()` - Authenticate user
- `vm.logout()` - Logout user

### LogoutCtrl
**File:** `app/js/controllers.js`

**Purpose:** Handle logout

**Key Features:**
- Clear authentication
- Clear local storage
- Redirect to login

### LockscreenCtrl
**File:** `app/js/controllers.js`

**Purpose:** Lock screen functionality

## Dashboard Controllers

### MainDashboardCtrl
**File:** `app/js/controllers/main_dashboard.js`

**Purpose:** Main dashboard

**Key Features:**
- Dashboard overview
- Company/Site/Workstation selection
- Weighbridge status
- Quick navigation

**Key Methods:**
- `vm.load()` - Initialize dashboard
- `vm.Functions.HeadAll()` - Load all entities
- `vm.Functions.Single(type)` - Load single entity

### MainCtrl
**File:** `app/js/controllers/main.js`

**Purpose:** Main application controller

## Additional Controllers

### ExceptionsCtrl
**File:** `app/js/controllers/exceptions.js`

**Purpose:** Exception management

**Key Features:**
- List exceptions
- Filter exceptions
- Exception details

### RFIDVehiclesCtrl
**File:** `app/js/controllers/rfid_vehicles.js`

**Purpose:** RFID vehicle management

**Key Features:**
- List RFID vehicles
- Create RFID vehicle
- Edit RFID vehicle
- Delete RFID vehicle

### ModalInstanceCtrl
**File:** `app/js/controllers/modal_instance.js`

**Purpose:** Modal dialog controller

**Key Features:**
- Generic modal controller
- Used for confirmations
- Used for data entry

## Controller Patterns

### Standard CRUD Pattern

```javascript
'use strict';
angular.module('xenon.controllers')
  .controller('MyCtrl', function($scope, $rootScope, Restangular) {
    const vm = this;
    const routeName = 'resource';
    
    vm.items = [];
    vm.baseData = Restangular.all(routeName);
    
    vm.loadData = function() {
      $rootScope.Start();
      vm.baseData.getList().then(
        function(data) {
          vm.items = data;
          $rootScope.Loaded();
        },
        function(response) {
          $rootScope.Error(response);
        }
      );
    };
    
    vm.addForm = function() {
      $state.go('app.resource_create');
    };
    
    vm.editForm = function(id) {
      $state.go('app.resource_edit', {id: id});
    };
    
    vm.deleteForm = function(id) {
      // Delete logic
    };
  });
```

### Weighing Controller Pattern

```javascript
'use strict';
angular.module('xenon.controllers')
  .controller('WeighingCtrl', function($scope, $rootScope, $state, Restangular, $Functions) {
    const vm = this;
    
    // Initialize data
    vm.ReportData = {
      Hauliers: null,
      BusinessPartners: null,
      Products: null,
      Settings: null,
      Pallets: null,
      Tares: null
    };
    
    // Load master data
    vm.Functions = {
      Single: function(type) {
        $rootScope.Start();
        switch(type) {
          case 'company':
            $Functions.Company(vm.User.company_id).then(function(companies) {
              vm.Companies = companies;
              $rootScope.Loaded();
            });
            break;
          // ... other cases
        }
      }
    };
  });
```

## Controller Dependencies

### Common Dependencies

- `$scope` - Angular scope
- `$rootScope` - Root scope for global state
- `$state` - UI Router state service
- `$stateParams` - State parameters
- `Restangular` - API client
- `$Functions` - Common functions factory
- `$navigation` - Navigation service
- `$Exceptions` - Exception service
- `$EMSOservice` - Scale service factory
- `$http` - HTTP service (for scale)
- `$q` - Promise service
- `$interval` - Interval service
- `$filter` - Filter service
- `DTOptionsBuilder` - DataTables options
- `DTColumnBuilder` - DataTables columns

## State Management

### $rootScope.Params

Preserve state across navigation:

```javascript
$rootScope.Params = {
  company_id: vm.companyId,
  site_id: vm.siteId,
  workstation_id: vm.workstationId
};
```

### $rootScope.MasterData

Store master data for quick access:

```javascript
$rootScope.MasterData = companies;
```

## Error Handling

All controllers should handle errors:

```javascript
vm.baseData.getList().then(
  function(data) {
    vm.items = data;
    $rootScope.Loaded();
  },
  function(response) {
    $rootScope.Error(response);
  }
);
```

## Loading States

Always use loading states:

```javascript
$rootScope.Start();      // Show loading
// ... API call ...
$rootScope.Loaded();     // Hide loading
// OR
$rootScope.Error(response); // Hide loading + show error
```

