# Templates and UI Components Documentation

## Overview

This document covers all HTML templates, UI components, and Bootstrap integration in the Weighsoft frontend application.

## Template Organization

Templates are organized in `app/tpls/` by feature:

```
tpls/
  layout/              # Layout templates
  companies/           # Company management
  sites/               # Site management
  weighing/            # Weighing operations
  contract/            # Contract management
  pallet/              # Pallet management
  tare/                # Tare management
  print/               # Print templates
  settings/            # Settings management
  [feature]/           # Feature-specific templates
```

## Layout Templates

### app-body.html
**Location:** `tpls/layout/app-body.html`

**Purpose:** Main application layout

**Components:**
- Sidebar menu
- Horizontal menu
- Main content area
- User info navbar
- Footer

### sidebar-menu.html
**Location:** `tpls/layout/sidebar-menu.html`

**Purpose:** Sidebar navigation menu

**Controller:** `SidebarMenuCtrl`

**Features:**
- Dynamic menu generation
- Permission-based visibility
- Active state highlighting
- Nested menu support

### horizontal-menu.html
**Location:** `tpls/layout/horizontal-menu.html`

**Purpose:** Horizontal navigation menu

**Controller:** `HorizontalMenuCtrl`

### page-title.html
**Location:** `tpls/layout/page-title.html`

**Purpose:** Page title display

**Attributes:**
- `title` - Page title
- `description` - Page description

### footer.html
**Location:** `tpls/layout/footer.html`

**Purpose:** Site footer

### user-info-navbar.html
**Location:** `tpls/layout/user-info-navbar.html`

**Purpose:** User information in navbar

**Features:**
- User name display
- Logout button
- User settings

## Authentication Templates

### login.html
**Location:** `tpls/login.html`

**Purpose:** User login form

**Controller:** `LoginCtrl as auth`

**Features:**
- Email/password fields
- Form validation
- Error display
- Remember me option

### lockscreen.html
**Location:** `tpls/lockscreen.html`

**Purpose:** Lock screen

**Controller:** `LockscreenCtrl`

## Weighing Templates

### weighing/site.html
**Location:** `tpls/weighing/site.html`

**Purpose:** Weighing list/overview

**Controller:** `WeighingCtrl as System`

**Features:**
- Company/Site/Workstation selection
- Weighing list
- Status filtering
- Navigation to create/update

### weighing/create.html
**Location:** `tpls/weighing/create.html`

**Purpose:** Create new weighing

**Controller:** `WeighingCreateCtrl as System`

**Features:**
- Vehicle registration entry
- Real-time weight display
- Camera integration
- Contract selection
- Product selection
- Custom fields
- Moisture/handling calculations
- Save and print buttons

### weighing/update.html
**Location:** `tpls/weighing/update.html`

**Purpose:** Update existing weighing

**Controller:** `WeighingUpdateCtrl as System`

**Features:**
- Edit weighing details
- Update weights
- Modify transaction data
- Same features as create

### weighing/verify.html
**Location:** `tpls/weighing/verify.html`

**Purpose:** Verify weighings

**Controller:** `VerifyCtrl as System`

**Features:**
- List weighings requiring verification
- Verification form
- Silo override option
- Status update

### weighing/reprint_list.html
**Location:** `tpls/weighing/reprint_list.html`

**Purpose:** Reprint list

**Controller:** `ReprintListCtrl as System`

**Features:**
- Weighing list with filters
- Search functionality
- Pagination
- Actions: Edit, Print, Delete

### weighing/reprint_edit.html
**Location:** `tpls/weighing/reprint_edit.html`

**Purpose:** Edit before reprint

**Controller:** `ReprintEditCtrl as System`

### weighing/reprint_print.html
**Location:** `tpls/weighing/reprint_print.html`

**Purpose:** Print weighing ticket

**Controller:** `ReprintPrintCtrl as System`

**Features:**
- Ticket display
- Print button
- Print styles

### weighing/reprint_delete.html
**Location:** `tpls/weighing/reprint_delete.html`

**Purpose:** Delete weighing

**Controller:** `ReprintDeleteCtrl as System`

**Features:**
- Delete confirmation
- Reason entry
- Exception logging

## Print Templates

### print/ticket.tpl.html
**Location:** `tpls/print/ticket.tpl.html`

**Purpose:** Weighing ticket template

**Directive:** `ticket-print`

**Features:**
- Company logo
- Custom header/footer images
- Transaction details
- Weight information
- Vehicle registration
- Business partner
- Product information
- Camera images (optional)
- Custom fields
- Contract information
- Moisture/handling details

### print/invoice.tpl.html
**Location:** `tpls/print/invoice.tpl.html`

**Purpose:** Invoice template

**Directive:** `invoice-print`

**Features:**
- Invoice header
- Line items
- Totals
- VAT calculation
- Footer

### print/receipt.tpl.html
**Location:** `tpls/print/receipt.tpl.html`

**Purpose:** Receipt template

## Master Data Templates

### companies/list.html
**Location:** `tpls/companies/list.html`

**Purpose:** Company list

**Controller:** `CompaniesCtrl as System`

**Features:**
- DataTable with sorting/filtering
- Create button
- Edit/Delete actions
- Company logo display

### companies/company_create.html
**Location:** `tpls/companies/company_create.html`

**Purpose:** Create company

**Controller:** `CompanyCreateCtrl`

**Features:**
- Company form
- Logo upload
- Validation
- Save button

### companies/company_edit.html
**Location:** `tpls/companies/company_edit.html`

**Purpose:** Edit company

**Controller:** `CompanyManageCtrl`

**Features:**
- Pre-filled form
- Logo update
- Save changes

### sites/list.html
**Location:** `tpls/sites/list.html`

**Purpose:** Site list

**Controller:** `SiteCtrl as System`

### products/list.html
**Location:** `tpls/products/list.html`

**Purpose:** Product list

**Controller:** `ProductsCtrl as System`

### businesspartners/list.html
**Location:** `tpls/businesspartners/list.html`

**Purpose:** Business partner list

**Controller:** `BusinessPartnersCtrl as System`

### hauliers/list.html
**Location:** `tpls/hauliers/list.html`

**Purpose:** Haulier list

**Controller:** `HauliersCtrl as System`

### grades/list.html
**Location:** `tpls/grades/list.html`

**Purpose:** Grade list

**Controller:** `GradesCtrl as System`

## Contract Templates

### contract/contract.html
**Location:** `tpls/contract/contract.html`

**Purpose:** Contract list

**Controller:** `ContractsCtrl as System`

### contract/list.html
**Location:** `tpls/contract/list.html`

**Purpose:** Contract details list

**Controller:** `ContractListCtrl as System`

**Features:**
- Contract list for company/site
- Contract status
- Navigate to edit/transactions

### contract/edit.html
**Location:** `tpls/contract/edit.html`

**Purpose:** Edit contract

**Controller:** `ContractEditCtrl as System`

**Features:**
- Contract form
- Amount tracking
- Expiry date
- Linked contract option

### contract/transactions.html
**Location:** `tpls/contract/transactions.html`

**Purpose:** Contract transactions

**Controller:** `ContractTransactionsCtrl as System`

**Features:**
- Transaction list
- Fulfillment tracking
- Remaining amount display

## Pallet Templates

### pallet/pallet.html
**Location:** `tpls/pallet/pallet.html`

**Purpose:** Pallet list

**Controller:** `PalletsCtrl as System`

### pallet/list.html
**Location:** `tpls/pallet/list.html`

**Purpose:** Pallet list for company/site

**Controller:** `PalletListCtrl as System`

### pallet/edit.html
**Location:** `tpls/pallet/edit.html`

**Purpose:** Edit pallet

**Controller:** `PalletEditCtrl as System`

**Features:**
- Pallet form
- Charge per pallet
- Save button

## Tare Templates

### tare/tare.html
**Location:** `tpls/tare/tare.html`

**Purpose:** Tare list

**Controller:** `TaresCtrl as System`

### tare/list.html
**Location:** `tpls/tare/list.html`

**Purpose:** Tare list for company/site

**Controller:** `TareListCtrl as System`

### tare/edit.html
**Location:** `tpls/tare/edit.html`

**Purpose:** Edit tare

**Controller:** `TareEditCtrl as System`

**Features:**
- Tare form
- Vehicle registration
- Tare weight
- Expiry date
- Scale integration

## Settings Templates

### settings/list.html
**Location:** `tpls/settings/list.html`

**Purpose:** Settings list

**Controller:** `SettingsCtrl as System`

**Features:**
- Settings list
- Create/Edit/Delete actions
- Configuration options

### settings/axle.html
**Location:** `tpls/settings/axle.html`

**Purpose:** Axle settings

**Controller:** `AxelSettingsCtrl as System`

**Features:**
- Axle setup configuration
- Axle limits
- Vehicle configuration

## Reporting Templates

### transaction/list.html
**Location:** `tpls/transaction/list.html`

**Purpose:** Transaction reporting

**Controller:** `TransactionCtrl as System`

**Features:**
- Transaction list
- Date range picker
- Grouping options
- Data aggregation
- Export buttons

### exceptions/reporting.html
**Location:** `tpls/exceptions/reporting.html`

**Purpose:** Exception reporting

**Controller:** `ReportingCtrl as System`

**Features:**
- Exception list
- Filtering options
- Exception details

## Dashboard Templates

### dashboards/admin.html
**Location:** `tpls/dashboards/admin.html`

**Purpose:** Admin dashboard

**Controller:** `MainDashboard as System`

**Features:**
- Dashboard overview
- Charts (if configured)
- Quick navigation
- Statistics

## UI Components

### Bootstrap Integration

**Version:** Bootstrap 4.5.0

**Components Used:**
- Panels
- Forms
- Buttons
- Tables
- Modals
- Dropdowns
- Navs
- Breadcrumbs

### DataTables Integration

**Usage:**
```html
<table datatable="ng" dt-options="dtOptions" class="table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="item in vm.items">
      <td>{{item.field1}}</td>
      <td>{{item.field2}}</td>
    </tr>
  </tbody>
</table>
```

**Configuration:**
```javascript
vm.dtOptions = DTOptionsBuilder.newOptions()
  .withButtons(["csv", "colvis", "print", "excel"])
  .withOption("aaSorting", [[1, "desc"]]);
```

### Form Components

#### Standard Form
```html
<form name="myForm" novalidate>
  <div class="form-group">
    <label>Field Label</label>
    <input 
      type="text" 
      name="fieldName" 
      ng-model="vm.data.fieldName" 
      required
      ng-class="{'has-error': myForm.fieldName.$invalid && myForm.fieldName.$touched}">
    <span ng-show="myForm.fieldName.$invalid && myForm.fieldName.$touched">
      Field is required
    </span>
  </div>
  <button type="submit" ng-click="vm.saveForm(myForm)" ng-disabled="!myForm.$valid">
    Save
  </button>
</form>
```

#### Select Dropdown
```html
<select class="form-control" ng-model="vm.selectedItem" ng-change="vm.onChange()">
  <option value="">Select...</option>
  <option ng-repeat="item in vm.items" value="{{item.id}}">{{item.name}}</option>
</select>
```

#### Date Range Picker
```html
<input 
  type="text" 
  daterangepicker 
  ng-model="vm.dateRange"
  options="vm.dateRangeOptions"
  class="form-control">
```

### Modal Dialogs

**Usage:**
```javascript
$modal.open({
  templateUrl: appHelper.templatePath('modal/template'),
  controller: 'ModalInstanceCtrl',
  resolve: {
    data: function() {
      return vm.data;
    }
  }
});
```

### Toastr Notifications

**Automatic:**
- `$rootScope.Start()` - Shows info toast
- `$rootScope.Loaded()` - Shows success toast
- `$rootScope.Error()` - Shows error toast

**Manual:**
```javascript
toastr.success('Operation successful', 'Success');
toastr.error('Operation failed', 'Error');
toastr.info('Information', 'Info');
toastr.warning('Warning', 'Warning');
```

## Print Styles

### Print CSS

Print-specific styles in templates:

```html
<style media="print">
  @page {
    size: A4;
    margin: 0;
  }
  .no-print {
    display: none;
  }
  .print-only {
    display: block;
  }
</style>
```

### Print Functionality

```javascript
vm.printTicket = function() {
  window.print();
};
```

## Template Helpers

### appHelper.templatePath()

**Usage:**
```javascript
templateUrl: appHelper.templatePath('companies/list')
// Resolves to: app/tpls/companies/list.html
```

**Always use this helper - never hardcode paths!**

## Form Validation

### AngularJS Validation

```html
<form name="myForm" novalidate>
  <input 
    name="email" 
    type="email" 
    ng-model="vm.data.email"
    required
    ng-pattern="/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/">
  
  <div ng-show="myForm.email.$invalid && myForm.email.$touched">
    <span ng-show="myForm.email.$error.required">Email is required</span>
    <span ng-show="myForm.email.$error.email">Invalid email format</span>
  </div>
</form>
```

### Custom Validation

```javascript
vm.saveForm = function(formData) {
  if (!formData.$valid) {
    return;
  }
  // Save logic
};
```

## Responsive Design

### Bootstrap Grid

```html
<div class="row">
  <div class="col-md-6">
    <!-- Left column -->
  </div>
  <div class="col-md-6">
    <!-- Right column -->
  </div>
</div>
```

### Mobile Considerations

- Responsive tables
- Mobile-friendly forms
- Touch-friendly buttons
- Collapsible menus

## Accessibility

### ARIA Labels

```html
<button aria-label="Save weighing" ng-click="vm.save()">Save</button>
```

### Keyboard Navigation

- Tab order
- Enter key submission
- Escape key cancellation

## Best Practices

### Template Organization

- Group related templates in feature folders
- Use consistent naming (list, create, edit)
- Mirror controller structure

### Component Reusability

- Use directives for reusable components
- Extract common form sections
- Create shared partial templates

### Performance

- Minimize watchers
- Use `track by` in ng-repeat
- Lazy load heavy components
- Optimize images

