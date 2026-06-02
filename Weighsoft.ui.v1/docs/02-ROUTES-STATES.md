# UI Router States Documentation

## Overview

This document provides comprehensive documentation for all UI Router states in the Weighsoft frontend application.

## State Configuration

**File:** `app/js/routes.js`

**Base Module:** `xenon-app`

## Authentication States

### login
**URL:** `/login`

**Template:** `login.html`

**Controller:** `LoginCtrl as auth`

**Purpose:** User authentication

**Lazy Loaded:**
- jQuery Validate
- Toastr

### logout
**URL:** `/admin/logout`

**Controller:** `LogoutCtrl`

**Purpose:** Handle logout

## Main Application State

### app
**URL:** `/app`

**Type:** Abstract state

**Template:** `layout/app-body.html`

**Purpose:** Base state for all authenticated routes

**Controller:** Sets root scope flags

## Dashboard States

### app.dashboard-main
**URL:** `/app/dashboard-main`

**Template:** `dashboards/admin.html`

**Controller:** `MainDashboard as System`

**Lazy Loaded:**
- DevExtreme Charts
- Toastr

**Purpose:** Main dashboard with charts and overview

## User Management States

### app.users
**URL:** `/app/users`

**Template:** `users/list.html`

**Controller:** `UserCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.usertype
**URL:** `/app/usertype`

**Template:** `usertypes/list.html`

**Controller:** `UserTypeCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

## Company Management States

### app.company
**URL:** `/app/company`

**Template:** `companies/list.html`

**Controller:** `CompaniesCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.companies
**URL:** `/app/companies`

**Template:** `companies/main.html`

**Controller:** `CompanyCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

### app.company_create
**URL:** `/app/companies/create`

**Template:** `companies/company_create.html`

**Controller:** `CompanyCreateCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

### app.company_manage
**URL:** `/app/companies/manage`

**Template:** `companies/company_edit.html`

**Controller:** `CompanyManageCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

## Site Management States

### app.site
**URL:** `/app/site`

**Template:** `sites/list.html`

**Controller:** `SiteCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.sites
**URL:** `/app/sites`

**Template:** `sites/main.html`

**Controller:** `SitesCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

### app.site_create
**URL:** `/app/sites/create`

**Template:** `companies/site_create.html`

**Controller:** `SiteCreateCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

### app.site_manage
**URL:** `/app/sites/manage`

**Template:** `companies/site_edit.html`

**Controller:** `SiteManageCtrl`

**Lazy Loaded:**
- DataTables
- Toastr

## Workstation States

### app.workstations
**URL:** `/app/workstations`

**Template:** `workstations/list.html`

**Controller:** `WorkstationsCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

## Weighbridge States

### app.weighbridges
**URL:** `/app/weighbridges`

**Template:** `weighbridges/list.html`

**Controller:** `WeighbridgeCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.weighbridge_setup
**URL:** `/app/weighbridge_setup`

**Template:** `weighbridge_setup/list.html`

**Controller:** `WeighbridgeSetupCtrl as System`

**Lazy Loaded:**
- Toastr

## Weighing States

### app.weighing
**URL:** `/app/weighing`

**Template:** `weighing/site.html`

**Controller:** `WeighingCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.weigh_create
**URL:** `/app/weigh/create`

**Template:** `weighing/create.html`

**Controller:** `WeighingCreateCtrl as System`

**State Parameters:**
- `company_id` - Company ID
- `site_id` - Site ID
- `workstation_id` - Workstation ID
- `company` - Company name
- `site` - Site name
- `workstation` - Workstation name
- `FingerPrintVerify` - Fingerprint verification flag
- `SiteDecimals` - Site decimal places
- `SiteMeasure_type` - Site measure type
- `SiteDeduct_flow` - Site deduct flow

**Lazy Loaded:**
- DataTables
- Toastr

### app.weigh_update
**URL:** `/app/weighing/update`

**Template:** `weighing/update.html`

**Controller:** `WeighingUpdateCtrl as System`

**State Parameters:**
- `id` - Weighing header ID
- `company_id` - Company ID
- `site_id` - Site ID
- `workstation_id` - Workstation ID

**Lazy Loaded:**
- Toastr

### app.verify
**URL:** `/app/verify`

**Template:** `weighing/verify.html`

**Controller:** `VerifyCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

## Reprint States

### app.reprint
**URL:** `/app/reprint`

**Redirects to:** `app.reprint_list`

### app.reprint_list
**URL:** `/app/reprint_list`

**Template:** `weighing/reprint_list.html`

**Controller:** `ReprintListCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.reprint_edit
**URL:** `/app/reprint/edit/:id?company_id&site_id&workstation_id`

**Template:** `weighing/reprint_edit.html`

**Controller:** `ReprintEditCtrl as System`

**State Parameters:**
- `id` - Weighing header ID
- `company_id` - Company ID
- `site_id` - Site ID
- `workstation_id` - Workstation ID

**Lazy Loaded:**
- Toastr

### app.reprint_print
**URL:** `/app/reprint/print/:id?company_id&site_id&workstation_id`

**Template:** `weighing/reprint_print.html`

**Controller:** `ReprintPrintCtrl as System`

**State Parameters:**
- `id` - Weighing header ID
- `company_id` - Company ID
- `site_id` - Site ID
- `workstation_id` - Workstation ID

**Lazy Loaded:**
- Toastr

### app.reprint_delete
**URL:** `/app/reprint/delete/:id?company_id&site_id&workstation_id`

**Template:** `weighing/reprint_delete.html`

**Controller:** `ReprintDeleteCtrl as System`

**State Parameters:**
- `id` - Weighing header ID
- `company_id` - Company ID
- `site_id` - Site ID
- `workstation_id` - Workstation ID

**Lazy Loaded:**
- Toastr

## Settings States

### app.settings
**URL:** `/app/settings`

**Template:** `settings/list.html`

**Controller:** `SettingsCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.axelsettings
**URL:** `/app/axelsettings`

**Template:** `settings/axle.html`

**Controller:** `AxelSettingsCtrl as System`

**Lazy Loaded:**
- Toastr

## Transaction States

### app.transactions
**URL:** `/app/transactions`

**Template:** `transaction/list.html`

**Controller:** `TransactionCtrl as System`

**Lazy Loaded:**
- Toastr

## Exception States

### app.exceptions
**URL:** `/app/exceptions`

**Template:** `exceptions/reporting.html`

**Controller:** `ReportingCtrl as System`

**Lazy Loaded:**
- Toastr

## Pallet States

### app.pallets
**URL:** `/app/pallets`

**Template:** `pallet/pallet.html`

**Controller:** `PalletsCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.pallets.list
**URL:** `/app/pallets/list/:id`

**Template:** `pallet/list.html`

**Controller:** `PalletListCtrl as System`

**State Parameters:**
- `id` - Company/Site ID

### app.pallets.edit
**URL:** `/app/pallets/edit/:pallet_id`

**Template:** `pallet/edit.html`

**Controller:** `PalletEditCtrl as System`

**State Parameters:**
- `pallet_id` - Pallet ID

## Tare States

### app.tares
**URL:** `/app/tares`

**Template:** `tare/tare.html`

**Controller:** `TaresCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.tares.list
**URL:** `/app/tares/list/:id`

**Template:** `tare/list.html`

**Controller:** `TareListCtrl as System`

**State Parameters:**
- `id` - Company/Site ID

### app.tares.edit
**URL:** `/app/tares/edit/:id`

**Template:** `tare/edit.html`

**Controller:** `TareEditCtrl as System`

**State Parameters:**
- `id` - Tare ID

## Contract States

### app.contract
**URL:** `/app/contract`

**Template:** `contract/contract.html`

**Controller:** `ContractsCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.contract.list
**URL:** `/app/contract/list/:id`

**Template:** `contract/list.html`

**Controller:** `ContractListCtrl as System`

**State Parameters:**
- `id` - Company/Site ID

### app.contract.edit
**URL:** `/app/contract/edit/:contract_id`

**Template:** `contract/edit.html`

**Controller:** `ContractEditCtrl as System`

**State Parameters:**
- `contract_id` - Contract ID

### app.contract.transactions
**URL:** `/app/contract/:contract_id/transactions`

**Template:** `contract/transactions.html`

**Controller:** `ContractTransactionsCtrl as System`

**State Parameters:**
- `contract_id` - Contract ID

## Master Data States

### app.businesspartners
**URL:** `/app/businesspartners`

**Template:** `businesspartners/list.html`

**Controller:** `BusinessPartnersCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.products
**URL:** `/app/products`

**Template:** `products/list.html`

**Controller:** `ProductsCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.hauliers
**URL:** `/app/hauliers`

**Template:** `hauliers/list.html`

**Controller:** `HauliersCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.grades
**URL:** `/app/grades`

**Template:** `grades/list.html`

**Controller:** `GradesCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.rfidvehicles
**URL:** `/app/rfidvehicles`

**Template:** `rfid_vehicles/list.html`

**Controller:** `RFIDVehiclesCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

### app.cameras
**URL:** `/app/cameras`

**Template:** `cameras/list.html`

**Controller:** `CameraCtrl as System`

**Lazy Loaded:**
- DataTables
- Toastr

## State Parameters

### Common Parameters

Many states accept optional query parameters:
- `company_id` - Filter by company
- `site_id` - Filter by site
- `workstation_id` - Filter by workstation

### Parameter Passing

**Via State:**
```javascript
$state.go('app.weigh_create', {
  company_id: 1,
  site_id: 1,
  workstation_id: 1
});
```

**Via $rootScope.Params:**
```javascript
$rootScope.Params = {
  company_id: 1,
  site_id: 1,
  workstation_id: 1
};
$state.go('app.weigh_create');
```

## Lazy Loading

### Asset Loading

States can lazy load assets via `resolve`:

```javascript
resolve: {
  deps: function($ocLazyLoad) {
    return $ocLazyLoad.load([
      ASSETS.tables.datatables,
      ASSETS.extra.toastr
    ]);
  }
}
```

### Common Assets

- `ASSETS.tables.datatables` - DataTables library
- `ASSETS.extra.toastr` - Toastr notifications
- `ASSETS.charts.dxCharts` - DevExtreme charts
- `ASSETS.forms.jQueryValidate` - Form validation

## Route Protection

### Authentication Guard

**In app.js:**
```javascript
$rootScope.$on('$stateChangeStart', function(event, toState) {
  var normalRoutes = ['login'];
  var loginInfo = MyLocalStorage.getItem('user_info');
  
  if(!loginInfo && $.inArray(toState.name, normalRoutes) == -1) {
    event.preventDefault();
    $state.transitionTo('login');
  }
});
```

### Permission-Based Access

Menu items are filtered by permissions in `$menuItems` service.

## Navigation Patterns

### Standard Navigation

```javascript
$state.go('app.company');
```

### Navigation with Parameters

```javascript
$state.go('app.weigh_create', {
  company_id: vm.companyId,
  site_id: vm.siteId
});
```

### Navigation with State Preservation

```javascript
$rootScope.Params = {
  company_id: vm.companyId,
  site_id: vm.siteId
};
$state.go('app.weigh_create');
```

## State Naming Conventions

- Use lowercase with underscores for state names
- Use dots for nested states (e.g., `app.contract.list`)
- Use descriptive names matching functionality

## URL Patterns

- List views: `/app/{resource}`
- Create views: `/app/{resource}/create`
- Edit views: `/app/{resource}/edit/:id`
- Nested views: `/app/{parent}/{child}`

## Default Route

**URL:** `/`

**Redirects to:** `/login` (if not authenticated)

**Otherwise:** Redirects to appropriate default state

