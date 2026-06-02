# Directives and Services Documentation

## Overview

This document covers all AngularJS directives, services, and factories in the Weighsoft frontend application.

## Directives

### Layout Directives

#### horizontalMenu
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/horizontal-menu.html`

**Controller:** `HorizontalMenuCtrl`

**Purpose:** Horizontal navigation menu

**Usage:**
```html
<horizontal-menu></horizontal-menu>
```

#### sidebarMenu
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/sidebar-menu.html`

**Controller:** `SidebarMenuCtrl`

**Purpose:** Sidebar navigation menu

**Usage:**
```html
<sidebar-menu></sidebar-menu>
```

#### sidebarChat
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/sidebar-chat.html`

**Purpose:** Sidebar chat widget

**Usage:**
```html
<sidebar-chat></sidebar-chat>
```

#### sidebarLogo
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/sidebar-logo.html`

**Purpose:** Sidebar logo display

**Usage:**
```html
<sidebar-logo></sidebar-logo>
```

#### userInfoNavbar
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/user-info-navbar.html`

**Purpose:** User information in navbar

**Usage:**
```html
<user-info-navbar></user-info-navbar>
```

#### pageTitle
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/page-title.html`

**Purpose:** Page title display

**Usage:**
```html
<page-title title="Page Title" description="Description"></page-title>
```

**Attributes:**
- `title` - Page title
- `description` - Page description

#### siteFooter
**File:** `app/js/directives.js`

**Type:** Element directive

**Template:** `layout/footer.html`

**Purpose:** Site footer

**Usage:**
```html
<site-footer></site-footer>
```

### Print Directives

#### ticketPrint
**File:** `app/js/directives/ticket/ticket.directive.js`

**Type:** Element directive

**Template:** `print/ticket.tpl.html`

**Isolated Scope:**
- `site` - Site object
- `setting` - Settings object
- `reportData` - Report data object
- `weighingHeader` - Weighing header object
- `axelSetups` - Axle setups array
- `cameras` - Camera images array

**Purpose:** Print weighing ticket

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

#### invoicePrint
**File:** `app/js/directives/invoice/invoice.directive.js`

**Type:** Element directive

**Template:** `print/invoice.tpl.html`

**Isolated Scope:**
- `invoice` - Invoice object
- `reportData` - Report data object
- `single` - Single record object
- `setting` - Settings object

**Purpose:** Print invoice

**Usage:**
```html
<invoice-print
  invoice="vm.invoice"
  report-data="vm.ReportData"
  single="vm.Single"
  setting="vm.Setting">
</invoice-print>
```

### UI Component Directives

#### xeCounter
**File:** `app/js/directives.js`

**Type:** Element/Attribute/Class directive

**Purpose:** Animated counter

**Attributes:**
- `from` - Starting value
- `to` - Ending value
- `duration` - Animation duration
- `delay` - Animation delay
- `easing` - Easing function
- `grouping` - Number grouping
- `separator` - Thousands separator
- `decimal` - Decimal separator
- `prefix` - Value prefix
- `suffix` - Value suffix

**Usage:**
```html
<xe-counter from="0" to="100" duration="2.5"></xe-counter>
```

#### xeFillCounter
**File:** `app/js/directives.js`

**Type:** Element/Attribute/Class directive

**Purpose:** Animated fill counter

**Attributes:**
- `fill-from` - Starting fill value
- `fill-to` - Ending fill value
- `fill-property` - CSS property to animate
- `fill-unit` - CSS unit
- `fill-duration` - Animation duration
- `fill-easing` - Easing function
- `delay` - Animation delay

**Usage:**
```html
<xe-fill-counter fill-from="0" fill-to="100" fill-property="width" fill-unit="%"></xe-fill-counter>
```

#### xeBreadcrumb
**File:** `app/js/directives.js`

**Type:** Attribute directive

**Purpose:** Breadcrumb navigation

**Usage:**
```html
<ul xe-breadcrumb class="auto-hidden">
  <!-- breadcrumb items -->
</ul>
```

### Form Directives

#### formWizard
**File:** `app/js/directives.js`

**Type:** Element directive

**Purpose:** Multi-step form wizard

**Usage:**
```html
<form-wizard>
  <!-- wizard steps -->
</form-wizard>
```

#### validate
**File:** `app/js/directives.js`

**Type:** Attribute directive

**Purpose:** Form validation

**Usage:**
```html
<form validate>
  <!-- form fields -->
</form>
```

#### inputmask
**File:** `app/js/directives.js`

**Type:** Attribute directive

**Purpose:** Input masking

**Usage:**
```html
<input inputmask="(999) 999-9999">
```

#### timepicker
**File:** `app/js/directives.js`

**Type:** Element/Attribute directive

**Purpose:** Time picker

**Usage:**
```html
<input timepicker>
```

#### datepicker
**File:** `app/js/directives.js`

**Type:** Element/Attribute directive

**Purpose:** Date picker

**Usage:**
```html
<input datepicker>
```

#### daterange
**File:** `app/js/directives.js`

**Type:** Element/Attribute directive

**Purpose:** Date range picker

**Usage:**
```html
<input daterange>
```

#### loginForm
**File:** `app/js/directives.js`

**Type:** Element directive

**Purpose:** Login form

**Usage:**
```html
<login-form></login-form>
```

#### contenteditable
**File:** `app/js/directives.js`

**Type:** Attribute directive

**Purpose:** Content editable element

**Usage:**
```html
<div contenteditable ng-model="vm.content"></div>
```

## Services

### $menuItems Service

**File:** `app/js/services.js`

**Purpose:** Menu preparation and management

**Methods:**

#### addItem(title, link, icon)
Add menu item to root level.

**Parameters:**
- `title` - Menu item title
- `link` - Menu item link
- `icon` - Menu item icon

**Returns:** Menu item object

#### prepareSidebarMenu(permissions)
Prepare sidebar menu based on user permissions.

**Parameters:**
- `permissions` - User permission object

**Returns:** Menu structure

**Menu Structure:**
- Setup
  - Companies
  - Sites
  - Work Stations
  - Weighbridges
  - Weighbridge Setup
  - Cameras
  - Weigh Types
- Weighing
  - Weighing
  - Verify
  - Reprint
- Operations
  - Contracts
  - Pallets
  - Tares
  - Master Data
    - Business Partners
    - Products
    - Hauliers
    - RFID Vehicles
    - Axel Settings
  - Reports
    - Reporting Centre
    - Transaction
  - User Settings
    - Users
    - User Types

#### prepareHorizontalMenu()
Prepare horizontal menu.

**Returns:** Menu structure

#### toStatePath(path)
Convert URL path to state path.

**Parameters:**
- `path` - URL path (e.g., "/app/company")

**Returns:** State path (e.g., "app.company")

#### setActive(path)
Set active menu item.

**Parameters:**
- `path` - Current state path

#### setActiveParent(item)
Set parent menu items as active.

**Parameters:**
- `item` - Menu item

#### iterateCheck(menuItems, currentState)
Recursively check menu items for active state.

**Parameters:**
- `menuItems` - Menu items array
- `currentState` - Current state name

### $weightModifiers Service

**File:** `app/js/services.js`

**Purpose:** Weight calculation utilities

**Methods:**

#### calculateMoisture(totalWeight, moisturePercentage, prescribedMoisture)
Calculate moisture deduction.

**Parameters:**
- `totalWeight` - Total weight
- `moisturePercentage` - Actual moisture percentage
- `prescribedMoisture` - Prescribed moisture level

**Returns:** Moisture deduction amount

**Formula:**
```javascript
moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture);
return totalWeight * moistureCoefficient;
```

## Factories

### $EMSOservice Factory

**File:** `app/js/factory.js`

**Purpose:** Scale hardware integration

**Properties:**
- `ScaleIP` - Scale IP address
- `FingerIP` - Fingerprint reader IP
- `ws` - WebSocket connection
- `data` - Scale data object
- `ReaderStatus` - Reader status

**Methods:**

#### Run(txtobject)
Start weighing operation.

**Parameters:**
- `txtobject` - Scale configuration object

**Returns:** Service instance

#### WighingSetup(ip)
Setup weighing with scale IP.

**Parameters:**
- `ip` - Scale IP address

**Returns:** Service instance

#### WighingStop(txtobject)
Stop weighing operation.

**Parameters:**
- `txtobject` - Scale configuration object

**Returns:** Service instance

#### WighingRun(txtobject)
Run weighing operation.

**Parameters:**
- `txtobject` - Scale configuration object

**Returns:** Service instance

#### CreateService(ip, command)
Create scale service connection.

**Parameters:**
- `ip` - Scale IP address
- `command` - Scale command

#### CreateDisplayService(ip, command)
Create display service connection.

**Parameters:**
- `ip` - Scale IP address
- `command` - Display command

#### dispose()
Dispose of connections.

### $Functions Factory

**File:** `app/js/factory.js`

**Purpose:** Common utility functions

**Methods:**

#### Company(companyId)
Load companies.

**Parameters:**
- `companyId` - Optional company ID filter

**Returns:** Promise resolving to company list

#### Site()
Load sites.

**Returns:** Promise resolving to site list

#### Workstation()
Load workstations.

**Returns:** Promise resolving to workstation list

#### Weighbridge()
Load weighbridges.

**Returns:** Promise resolving to weighbridge list

#### Users()
Load current user.

**Returns:** Promise resolving to user object

#### BusinessPartner()
Load business partners.

**Returns:** Promise resolving to business partner list

#### Product()
Load products.

**Returns:** Promise resolving to product list

#### Haulier()
Load hauliers.

**Returns:** Promise resolving to haulier list

### $navigation Factory

**File:** `app/js/factory.js`

**Purpose:** Navigation state management

**Methods:**

#### Company(companyId)
Set company in navigation.

**Parameters:**
- `companyId` - Company ID

#### Site(siteId)
Set site in navigation.

**Parameters:**
- `siteId` - Site ID

#### Workstation(workstationId)
Set workstation in navigation.

**Parameters:**
- `workstationId` - Workstation ID

#### get()
Get current navigation state.

**Returns:** Navigation object

#### clear()
Clear navigation state.

### $Exceptions Factory

**File:** `app/js/factory.js`

**Purpose:** Exception logging

**Methods:**

#### log(exception)
Log exception.

**Parameters:**
- `exception` - Exception object

### $SharedWeighingFunctions Factory

**File:** `app/js/factory.js`

**Purpose:** Shared weighing functions

**Methods:**
- Common weighing calculations
- Shared validation logic
- Common data transformations

## Filters

### propsFilter
**File:** `app/js/filters.js`

**Purpose:** Filter objects by property values

**Usage:**
```html
<div ng-repeat="item in items | propsFilter: {name: searchTerm, status: 'active'}">
```

### makePositive
**File:** `app/js/filters.js`

**Purpose:** Convert negative numbers to positive

**Usage:**
```html
{{ weight | makePositive }}
```

### commaspliter
**File:** `app/js/filters.js`

**Purpose:** Split comma-separated values

**Usage:**
```html
<div ng-repeat="item in 'a,b,c' | commaspliter">
```

### commatojson
**File:** `app/js/filters.js`

**Purpose:** Convert comma-separated values to JSON array

**Usage:**
```html
<div ng-repeat="item in 'a,b,c' | commatojson">
```

## Helper Utilities

### weighModifiers
**File:** `app/js/helpers/weighModifiers.js`

**Purpose:** Weight calculation helper

**Exports:**
- `calculateMoisture` - Moisture calculation function

**Usage:**
```javascript
import { calculateMoisture } from './helpers/weighModifiers';
const moisture = calculateMoisture(1000, 15, 12);
```

## Local Storage

### MyLocalStorage

**File:** `app/js/app.js`

**Purpose:** Local storage wrapper

**Methods:**

#### getItem(key)
Get item from local storage.

**Parameters:**
- `key` - Storage key

**Returns:** Parsed JSON object

#### setItem(key, object)
Set item in local storage.

**Parameters:**
- `key` - Storage key
- `object` - Object to store

**Returns:** Stored object

#### clear()
Clear all local storage.

**Usage:**
```javascript
// Store
MyLocalStorage.setItem('user_info', userData);

// Retrieve
const userInfo = MyLocalStorage.getItem('user_info');

// Clear
MyLocalStorage.clear();
```

## Global Functions

### $rootScope Functions

#### Start(Flow)
Show loading indicator.

**Parameters:**
- `Flow` - Optional flow description

#### Loaded(Flow)
Hide loading indicator.

**Parameters:**
- `Flow` - Optional flow description

#### Error(response)
Show error and hide loading.

**Parameters:**
- `response` - Error response object

#### Message(response, type)
Show message.

**Parameters:**
- `response` - Message text
- `type` - Message type (Info, Success)

## Constants

### ASSETS

**File:** `app/js/constants.js`

**Purpose:** Asset paths for lazy loading

**Structure:**
- `ASSETS.tables.datatables` - DataTables assets
- `ASSETS.extra.toastr` - Toastr assets
- `ASSETS.charts.dxCharts` - DevExtreme charts
- `ASSETS.forms.jQueryValidate` - Form validation
- And more...

**Usage:**
```javascript
$ocLazyLoad.load([
  ASSETS.tables.datatables,
  ASSETS.extra.toastr
]);
```

## Integration Services

### Restangular Configuration

**Base URL:** `window.__env.base + '/api'`

**Default Headers:**
- JWT token from local storage

**Error Interceptor:**
- Handles 401/400 errors
- Automatic logout on token issues

### WebSocket Integration

**Scale WebSocket:**
```javascript
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");
scaleSocket.onmessage = function(event) {
  const weight = parseFloat(event.data);
  // Update UI
};
```

## Best Practices

### Directive Usage

- Use isolated scope for reusable directives
- Use `controller as` syntax
- Document all scope bindings
- Handle cleanup in link function

### Service Usage

- Keep services stateless where possible
- Return promises for async operations
- Handle errors consistently
- Document all methods and parameters

### Factory Usage

- Use factories for complex object creation
- Return configured objects
- Support dependency injection
- Document configuration options

