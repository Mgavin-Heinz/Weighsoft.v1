# Weighsoft Frontend Architecture

## Overview

The Weighsoft frontend is built with AngularJS 1.4.8, providing a single-page application (SPA) for managing weighbridge operations. The application uses UI Router for navigation, Restangular for API communication, and Bootstrap 4.5.0 for UI components.

## Technology Stack

- **Framework**: AngularJS 1.4.8
- **Routing**: UI Router
- **HTTP Client**: Restangular
- **UI Framework**: Bootstrap 4.5.0
- **Tables**: DataTables
- **Date Handling**: Moment.js
- **Notifications**: Toastr
- **Lazy Loading**: oc.lazyLoad
- **Build Tool**: Yarn/Bower
- **Deployment**: Docker with Nginx

## Project Structure

```
app/
  js/
    app.js              # Main application module
    routes.js           # UI Router state definitions
    controllers.js      # Controller registrations
    controllers/        # Individual controller files
      companies.js
      weighing_create.js
      weighing_update.js
      weighing.js
      [feature]/        # Feature-based organization
        list.controller.js
        edit.controller.js
    services.js         # Service definitions
    factory.js          # Factory definitions
    directives.js       # Directive registrations
    directives/         # Individual directive files
      ticket/
        ticket.directive.js
      invoice/
        invoice.directive.js
    filters.js          # Filter registrations
    filters/            # Individual filter files
      common-filters.js
    constants.js        # ASSETS constant for lazy loading
    env.js              # Environment configuration
    helpers/            # Helper utilities
      weighModifiers.js
  tpls/                 # HTML templates
    layout/             # Layout templates
    companies/          # Feature templates
      list.html
      company_create.html
      company_edit.html
    weighing/
      create.html
      update.html
      site.html
      reprint_list.html
      verify.html
    print/              # Print templates
      ticket.tpl.html
      invoice.tpl.html
  index.html            # Main HTML file
```

## Module Organization

The application uses multiple Angular modules:

### Main Module
- `xenon-app` - Main application module

### Feature Modules
- `xenon.controllers` - All controllers
- `xenon.services` - All services
- `xenon.factory` - All factories
- `xenon.directives` - All directives

**Module Registration:**
```javascript
angular.module('xenon-app', [
  'ngCookies',
  'ui.router',
  'ui.bootstrap',
  'oc.lazyLoad',
  'xenon.controllers',
  'xenon.directives',
  'xenon.factory',
  'xenon.services',
  'restangular',
  'satellizer',
  // ... other dependencies
]);
```

## Core Patterns

### 1. Controller Pattern

**Controller As Syntax:**
```javascript
'use strict';
angular.module('xenon.controllers')
  .controller('CompaniesCtrl', function($scope, $rootScope, Restangular) {
    const vm = this;  // ViewModel
    const routeName = 'company';
    
    vm.companies = [];
    vm.baseData = Restangular.all(routeName);
    
    vm.loadData = function() {
      $rootScope.Start();
      vm.baseData.getList().then(function(companies) {
        vm.companies = companies;
        $rootScope.Loaded();
      }, function(response) {
        $rootScope.Error(response);
      });
    };
  });
```

**Key Points:**
- Always use `'use strict'`
- Use `controller as` syntax with `vm = this`
- Use `$rootScope.Start()`, `$rootScope.Loaded()`, `$rootScope.Error()` for loading states
- Always handle promise errors

### 2. Restangular Pattern

**API Calls:**
```javascript
// Get list
vm.baseData = Restangular.all('company');
vm.baseData.getList().then(function(data) {
  vm.companies = data;
});

// Get single
Restangular.one('company', id).get().then(function(company) {
  vm.company = company;
});

// Create
vm.baseData.post(vm.data).then(function(result) {
  // Success
});

// Update
Restangular.one('company', id).customPUT(vm.data).then(function(result) {
  // Success
});

// Delete
Restangular.one('company', id).remove().then(function() {
  // Success
});
```

**Error Handling:**
```javascript
vm.baseData.getList().then(
  function(data) {
    vm.companies = data;
    $rootScope.Loaded();
  },
  function(response) {
    $rootScope.Error(response);
  }
);
```

### 3. State Management

**UI Router States:**
```javascript
.state('app.company', {
  url: '/company',
  templateUrl: appHelper.templatePath('companies/list'),
  controller: 'CompaniesCtrl as System',
  resolve: {
    deps: function($ocLazyLoad) {
      return $ocLazyLoad.load([
        ASSETS.tables.datatables,
        ASSETS.extra.toastr
      ]);
    }
  }
})
```

**Navigation:**
```javascript
// Navigate to state
$state.go('app.company');

// Navigate with parameters
$state.go('app.weigh_create', {
  company_id: vm.companyId,
  site_id: vm.siteId,
  workstation_id: vm.workstationId
});

// Preserve state
$rootScope.Params = {
  company_id: vm.companyId,
  site_id: vm.siteId,
  workstation_id: vm.workstationId
};
```

### 4. Template Path Helper

**Always use `appHelper.templatePath()`:**
```javascript
templateUrl: appHelper.templatePath('companies/list')
// NOT: 'app/tpls/companies/list.html'
// NOT: '/tpls/companies/list.html'
```

### 5. Loading States

**Global Loading Functions:**
```javascript
$rootScope.Start();      // Show loading indicator
$rootScope.Loaded();     // Hide loading indicator
$rootScope.Error(response); // Show error and hide loading
```

## Environment Configuration

### Environment Variables

**File:** `app/js/env.js`

```javascript
window.__env = window.__env || {};
window.__env.base = `http://${window.location.hostname}:5000`;
window.__env.scale = `http://henzard-pi:3000`;
window.__env.logo = "assets/images/logos/ZZesto.png";
```

**Usage:**
```javascript
// API base URL
RestangularProvider.setBaseUrl(window.__env.base);

// Scale service
$http.post('http://' + window.__env.scale + '/scale', {...});
```

## Key Features

### 1. Weighing Creation

**Controller:** `WeighingCreateCtrl`

**Key Functionality:**
- Real-time scale integration via WebSocket
- Camera image capture
- Multi-axle weight entry
- Contract linking
- Invoice generation
- Ticket printing

**State Parameters:**
- `company_id`, `site_id`, `workstation_id`
- `FingerPrintVerify`
- `SiteDecimals`, `SiteMeasure_type`, `SiteDeduct_flow`

### 2. Weighing Update

**Controller:** `WeighingUpdateCtrl`

**Key Functionality:**
- Edit existing weighing headers
- Update weights
- Modify transaction details
- Status changes

### 3. Verification

**Controller:** `VerifyCtrl`

**Key Functionality:**
- Verify weighing headers with VERIFY status
- Silo override
- Manual verification workflow

### 4. Reprint Management

**Controllers:**
- `ReprintListCtrl` - List weighings for reprint
- `ReprintEditCtrl` - Edit before reprint
- `ReprintPrintCtrl` - Print weighing ticket
- `ReprintDeleteCtrl` - Delete weighing

### 5. Master Data Management

**Controllers:**
- `CompaniesCtrl` - Company management
- `SitesCtrl` - Site management
- `WorkstationsCtrl` - Workstation management
- `WeighbridgeCtrl` - Weighbridge management
- `ProductsCtrl` - Product management
- `BusinessPartnersCtrl` - Business partner management
- `HauliersCtrl` - Haulier management
- `SettingsCtrl` - Settings management
- `PalletsCtrl` - Pallet management
- `TaresCtrl` - Tare management

### 6. Contract Management

**Controllers:**
- `ContractsCtrl` - Contract list
- `ContractListCtrl` - Contract details
- `ContractEditCtrl` - Edit contract
- `ContractTransactionsCtrl` - Contract transactions

### 7. Reporting

**Controller:** `ReportingCtrl`

**Key Functionality:**
- Report generation
- Date range selection
- Filtering options
- Export capabilities

## Directives

### Ticket Print Directive

**Usage:**
```html
<ticket-print
  site="vm.Site"
  setting="vm.Setting"
  report-data="vm.ReportData"
  weighing-header="vm.weighingHeader"
  axel-setups="vm.axelSetups"
  cameras="vm.Cameras">
</ticket-print>
```

### Invoice Print Directive

**Usage:**
```html
<invoice-print
  invoice="vm.invoice"
  report-data="vm.ReportData"
  single="vm.Single"
  setting="vm.Setting">
</invoice-print>
```

## Services

### $menuItems Service

**Purpose:** Menu preparation based on user permissions

**Methods:**
- `addItem()` - Add menu item
- `prepareSidebarMenu()` - Prepare sidebar menu
- `prepareHorizontalMenu()` - Prepare horizontal menu
- `setActive()` - Set active menu item

### $weightModifiers Service

**Purpose:** Weight calculation utilities

**Methods:**
- `calculateMoisture()` - Calculate moisture deduction

## Factories

### $EMSOservice Factory

**Purpose:** Scale hardware integration

**Methods:**
- `Run()` - Start weighing
- `WighingSetup()` - Setup weighing
- `WighingStop()` - Stop weighing
- `WighingRun()` - Run weighing operation

### $Functions Factory

**Purpose:** Common utility functions

**Methods:**
- `Company()` - Load companies
- `Site()` - Load sites
- `Workstation()` - Load workstations
- `Weighbridge()` - Load weighbridges

## Filters

### propsFilter
Filter objects by property values.

### makePositive
Convert negative numbers to positive.

### commaspliter
Split comma-separated values.

### commatojson
Convert comma-separated values to JSON.

## Integration Points

### Scale Integration

**WebSocket Connection:**
```javascript
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");

scaleSocket.onmessage = function(event) {
  vm.weight = parseFloat(event.data);
  $scope.$apply();
};
```

**HTTP Commands:**
```javascript
$http.post('http://' + window.__env.scale + '/scale', {
  record: record,
  enabled: true,
  port: port
});
```

### Camera Integration

**Image Capture:**
```javascript
Restangular.all('getImageFromIpString').post({
  imageUrl: camera.ip_address + '/image.jpg',
  authType: 'basic',
  username: camera.username,
  password: camera.password
}).then(function(base64Image) {
  vm.cameraImage = base64Image;
});
```

## State Management

### $rootScope.Params

**Purpose:** Preserve state across navigation

**Usage:**
```javascript
// Set parameters
$rootScope.Params = {
  company_id: vm.companyId,
  site_id: vm.siteId,
  workstation_id: vm.workstationId
};

// Restore parameters
if ($rootScope.Params.company_id) {
  vm.companyId = $rootScope.Params.company_id;
}
```

### $rootScope.MasterData

**Purpose:** Store master data for quick access

**Usage:**
```javascript
// Store
$rootScope.MasterData = companies;

// Access
var company = $rootScope.MasterData.find(c => c.id === id);
```

## Lazy Loading

**Assets Configuration:**
```javascript
// In constants.js
ASSETS = {
  tables: {
    datatables: [...]
  },
  extra: {
    toastr: [...]
  }
};

// In route resolve
resolve: {
  deps: function($ocLazyLoad) {
    return $ocLazyLoad.load([
      ASSETS.tables.datatables,
      ASSETS.extra.toastr
    ]);
  }
}
```

## Error Handling

### Global Error Handler

**In app.js:**
```javascript
Restangular.setErrorInterceptor(function(response) {
  if (response.status === 401 || response.status === 400) {
    // Handle authentication errors
    $auth.logout();
    $state.go('login');
  }
  return true;
});
```

### Controller Error Handling

```javascript
vm.baseData.getList().then(
  function(data) {
    vm.companies = data;
    $rootScope.Loaded();
  },
  function(response) {
    $rootScope.Error(response);
    // Additional error handling
  }
);
```

## Form Validation

### AngularJS Form Validation

```html
<form name="companyForm" novalidate>
  <input 
    name="name" 
    ng-model="vm.data.name" 
    required 
    ng-class="{'has-error': companyForm.name.$invalid && companyForm.name.$touched}">
  <span ng-show="companyForm.name.$invalid && companyForm.name.$touched">
    Name is required
  </span>
</form>
```

```javascript
vm.saveForm = function(formData) {
  if (!formData.$valid) {
    return;
  }
  // Save logic
};
```

## DataTables Integration

### Configuration

```javascript
$scope.dtOptions = DTOptionsBuilder.newOptions()
  .withButtons(["csv", "colvis", "print", "excel"])
  .withOption("aaSorting", [[1, "desc"]]);
```

### Usage in Template

```html
<table datatable="ng" dt-options="dtOptions" class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="item in vm.items">
      <td>{{item.name}}</td>
      <td>{{item.status}}</td>
    </tr>
  </tbody>
</table>
```

## Print Functionality

### Window Print

```javascript
vm.printTicket = function() {
  window.print();
};
```

### Print Styles

Print-specific CSS in templates:
```html
<style media="print">
  @page {
    size: A4;
    margin: 0;
  }
  .no-print {
    display: none;
  }
</style>
```

## Deployment

### Docker Configuration

**Dockerfile:**
- Multi-stage build
- Alpine Linux base
- Nginx web server
- Static file serving

### Build Process

1. Install dependencies: `yarn install`
2. Build application
3. Copy to Nginx html directory
4. Configure Nginx

### Environment Configuration

- Set `window.__env.base` for API URL
- Set `window.__env.scale` for scale service
- Configure logo path

## Performance Considerations

### Lazy Loading
- Load assets only when needed
- Reduce initial bundle size
- Improve page load time

### Data Pagination
- Use server-side pagination for large datasets
- Limit initial data load
- Load more on demand

### Image Optimization
- Base64 images for small images
- External URLs for large images
- Lazy load images

## Security Considerations

### Authentication
- JWT token storage
- Token refresh mechanism
- Automatic logout on 401

### XSS Protection
- AngularJS automatic escaping
- Sanitize user input
- Avoid `ng-bind-html` with untrusted content

### CSRF Protection
- Token-based CSRF protection
- Secure cookie handling

