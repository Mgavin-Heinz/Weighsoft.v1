# Widgets and Factories

## Overview

This document covers AngularJS factories, widgets, and custom directives that provide reusable functionality across the Weighsoft frontend application.

## Factories

### $layoutToggles

**Location:** `app/js/factory.js`

**Purpose:** Provides layout toggle functions for sidebar, settings pane, chat, and mobile menus

**Methods:**

#### initToggles()

**Purpose:** Initializes all layout toggle functions

**Sets up:**
- `$rootScope.sidebarToggle()` - Toggle sidebar collapse
- `$rootScope.settingsPaneToggle()` - Toggle settings pane
- `$rootScope.chatToggle()` - Toggle chat panel
- `$rootScope.mobileMenuToggle()` - Toggle mobile menu
- `$rootScope.mobileUserInfoToggle()` - Toggle mobile user info navbar

**Usage:**
```javascript
$layoutToggles.initToggles();
// Now available:
$rootScope.sidebarToggle();
```

### $pageLoadingBar

**Location:** `app/js/factory.js`

**Purpose:** Manages page loading progress bar

**Methods:**

#### init()

**Purpose:** Initializes loading bar with state change listeners

**Behavior:**
- Shows loading bar on `$stateChangeStart` (95%)
- Completes loading bar on `$stateChangeSuccess` (100%)
- Adds/removes `is-loading` class on main content

#### showLoadingBar(options)

**Purpose:** Shows loading bar with specified progress

**Parameters:**
- `options` (object or number):
  - `pct` (number): Percentage (0-100)
  - `delay` (number): Animation duration in seconds
  - `wait` (number): Delay before starting
  - `before` (function): Callback before animation
  - `finish` (function): Callback after animation
  - `resetOnEnd` (boolean): Reset to 0% when complete

**Usage:**
```javascript
$pageLoadingBar.showLoadingBar({
  pct: 50,
  delay: 1.0,
  resetOnEnd: false
});
```

#### hideLoadingBar()

**Purpose:** Hides loading bar

**Usage:**
```javascript
$pageLoadingBar.hideLoadingBar();
```

### $layout

**Location:** `app/js/factory.js`

**Purpose:** Manages layout options and cookie persistence

**Methods:**

#### setOptions(options, the_value)

**Purpose:** Sets layout options and saves to cookies

**Parameters:**
- `options` (string or object): Option path or object
- `the_value` (any): Value if options is string

**Usage:**
```javascript
// String path
$layout.setOptions('sidebar.isCollapsed', true);

// Object
$layout.setOptions({
  sidebar: { isCollapsed: true },
  chat: { isOpen: false }
});
```

#### get(prop)

**Purpose:** Gets layout option value

**Parameters:**
- `prop` (string): Property path (e.g., 'sidebar.isCollapsed')

**Returns:** Option value from cookie or default

**Usage:**
```javascript
var isCollapsed = $layout.get('sidebar.isCollapsed');
```

#### is(prop, value)

**Purpose:** Checks if layout option equals value

**Parameters:**
- `prop` (string): Property path
- `value` (any): Value to compare

**Returns:** Boolean

**Usage:**
```javascript
if ($layout.is('sidebar.isCollapsed', true)) {
  // Sidebar is collapsed
}
```

### $navigation

**Location:** `app/js/factory.js`

**Purpose:** Manages navigation parameters (company, site, workstation, weighbridge)

**Methods:**

#### set(data)

**Purpose:** Sets navigation parameters

**Parameters:**
- `data` (object): Navigation parameters

**Usage:**
```javascript
$navigation.set({
  company_id: 'uuid-123',
  site_id: 'uuid-456',
  workstation_id: 'uuid-789',
  weighbridge_id: 'uuid-012'
});
```

#### get()

**Purpose:** Gets current navigation parameters

**Returns:** Object with navigation parameters

**Usage:**
```javascript
var params = $navigation.get();
// { company_id: '...', site_id: '...', ... }
```

#### clear(force)

**Purpose:** Clears navigation parameters

**Parameters:**
- `force` (boolean): If true, clear completely; otherwise restore from localStorage

**Usage:**
```javascript
$navigation.clear(); // Restore from localStorage
$navigation.clear(true); // Clear completely
```

#### Company(data), Site(data), Workstation(data), Weighbridge(data)

**Purpose:** Set individual navigation parameters

**Usage:**
```javascript
$navigation.Company('uuid-123');
$navigation.Site('uuid-456');
```

### $EMSOservice

**Location:** `app/js/factory.js`

**Purpose:** WebSocket service for scale and fingerprint scanner integration

**Key Properties:**
- `Service.ws` - WebSocket connection
- `Service.ScaleIP` - Scale IP address
- `Service.DisplayIP` - Display IP address
- `Service.FingerIP` - Fingerprint scanner IP
- `Service.data` - Service state data

**Key Methods:**

#### CreateService(path, command)

**Purpose:** Creates WebSocket connection to scale service

**Parameters:**
- `path` (string): IP address or hostname
- `command` (string): Initial command to send

**Usage:**
```javascript
$EMSOservice.CreateService('192.168.1.100', 'A003:');
```

#### CreateDisplayService(path, command)

**Purpose:** Creates WebSocket connection to display service

**Parameters:**
- `path` (string): IP address or hostname
- `command` (string): Initial command to send

#### SendMessage(message)

**Purpose:** Sends message via WebSocket

**Parameters:**
- `message` (string): Message to send

#### Run(txtobject)

**Purpose:** Starts weighing process

**Parameters:**
- `txtobject` (object): Weighing object

#### WighingSetup(ip)

**Purpose:** Sets up weighing with scale IP

**Parameters:**
- `ip` (string): Scale IP address

#### WighingStop(txtobject)

**Purpose:** Stops weighing process

#### dispose(txtobject)

**Purpose:** Closes WebSocket connection

### $nodeRed

**Location:** `app/js/factory.js`

**Purpose:** HTTP service for scale integration via Node-RED

**Methods:**

#### StartScale(record, port)

**Purpose:** Starts scale service

**Parameters:**
- `record` (object): Scale record
- `port` (string): Serial port

**Returns:** HTTP promise

#### StopScale(record)

**Purpose:** Stops scale service

**Parameters:**
- `record` (object): Scale record

**Returns:** HTTP promise

#### ResetWeighing(record, port)

**Purpose:** Resets weighing (stop then start)

**Parameters:**
- `record` (object): Scale record
- `port` (string): Serial port

#### GetData()

**Purpose:** Gets WebSocket connection for scale data

**Returns:** WebSocket instance

**Usage:**
```javascript
var ws = $nodeRed.GetData();
ws.onmessage = function(event) {
  var weight = parseFloat(event.data);
};
```

### $weighservice

**Location:** `app/js/factory.js`

**Purpose:** Multi-station WebSocket service for weighing

**Key Methods:**

#### Run(station, WBdata, Object)

**Purpose:** Starts weighing for a station

**Parameters:**
- `station` (number): Station index
- `WBdata` (object): Weighbridge configuration
- `Object` (object): Object to update with weight

**Behavior:**
- Opens WebSocket connection
- Polls for weight data every 500ms
- Updates Object.weight with parsed weight

#### kill(station)

**Purpose:** Stops weighing for a station

**Parameters:**
- `station` (number): Station index

#### killAll()

**Purpose:** Stops all weighing stations

#### CreateService(path, station)

**Purpose:** Creates WebSocket connection for station

**Parameters:**
- `path` (string): Scale IP/hostname
- `station` (number): Station index

### $Exceptions

**Location:** `app/js/factory.js`

**Purpose:** Exception logging service

**Methods:**

#### set(data)

**Purpose:** Creates exception log entry

**Parameters:**
- `data` (object): Exception data

**Returns:** Promise

#### get()

**Purpose:** Gets exception logs

**Returns:** Promise with exception list

### $ErrorLog

**Location:** `app/js/factory.js`

**Purpose:** Error logging service

**Methods:**

#### set(data)

**Purpose:** Creates error log entry

**Parameters:**
- `data` (object): Error data

**Returns:** Promise

#### get()

**Purpose:** Gets error logs

**Returns:** Promise with error list

### $Names

**Location:** `app/js/factory.js`

**Purpose:** Name resolution service for companies and sites

**Methods:**

#### Company(company_id)

**Purpose:** Gets company display name

**Parameters:**
- `company_id` (string): Company UUID

**Returns:** String (e.g., "Company Name (CODE)")

#### Site(company_id, site_id)

**Purpose:** Gets site display name

**Parameters:**
- `company_id` (string): Company UUID
- `site_id` (string): Site UUID

**Returns:** String (e.g., "Site Name (TYPE)")

#### SiteH(company_id, site_id)

**Purpose:** Gets site custom header text

**Parameters:**
- `company_id` (string): Company UUID
- `site_id` (string): Site UUID

**Returns:** String

#### SiteF(company_id, site_id)

**Purpose:** Gets site custom footer text

**Parameters:**
- `company_id` (string): Company UUID
- `site_id` (string): Site UUID

**Returns:** String

### $Functions

**Location:** `app/js/factory.js`

**Purpose:** Data loading functions for dropdowns

**Methods:**

#### Company(company_id)

**Purpose:** Gets company list or single company

**Parameters:**
- `company_id` (string, optional): Company UUID (if provided, returns single company)

**Returns:** Promise with company list or company object

**Usage:**
```javascript
// Get all companies
$Functions.Company().then(function(companies) {
  vm.companies = companies; // [{value: 'uuid', name: 'Name (CODE)'}]
});

// Get single company
$Functions.Company('uuid-123').then(function(company) {
  vm.company = company;
});
```

#### Site(site_id, company_id)

**Purpose:** Gets site list or single site

**Parameters:**
- `site_id` (string, optional): Site UUID
- `company_id` (string, optional): Company UUID

**Returns:** Promise with site list or site name

#### Workstation(workstation_id)

**Purpose:** Gets workstation list or single workstation

**Parameters:**
- `workstation_id` (string, optional): Workstation UUID

**Returns:** Promise with workstation list or workstation name

#### WorkstationList(workstation_id)

**Purpose:** Gets workstation list for weighing screen

**Parameters:**
- `workstation_id` (string, optional): Workstation UUID

**Returns:** Promise with workstation list

## Widgets

**Location:** `app/js/widgets.js`

**Module:** `xe.widgets`

### xeCounter

**Purpose:** Animated counter widget

**Type:** Element, Attribute, or Class directive

**Attributes:**
- `count` (string): Selector for count element (default: 'this')
- `from` (number): Starting value (default: 0)
- `to` (number): Ending value (default: 100)
- `duration` (number): Animation duration in seconds (default: 2.5)
- `delay` (number): Delay before starting in seconds (default: 0)
- `easing` (boolean): Use easing (default: true)
- `grouping` (boolean): Use number grouping (default: true)
- `separator` (string): Thousands separator (default: ',')
- `decimal` (string): Decimal separator (default: '.')
- `prefix` (string): Prefix text
- `suffix` (string): Suffix text

**Usage:**
```html
<div xe-counter 
     data-count="this" 
     data-from="0" 
     data-to="1000" 
     data-duration="2.5">
  0
</div>
```

### xeFillCounter

**Purpose:** Animated fill counter widget

**Type:** Element, Attribute, or Class directive

**Attributes:**
- `fill-from` (number): Starting fill value (default: 0)
- `fill-to` (number): Ending fill value (default: 100)
- `fill-property` (string): CSS property to animate (default: 'width')
- `fill-unit` (string): CSS unit (default: '%')
- `fill-duration` (number): Animation duration (default: 2.5)
- `fill-easing` (boolean): Use easing (default: true)
- `delay` (number): Delay before starting (default: 0)

**Usage:**
```html
<div xe-fill-counter 
     data-fill-from="0" 
     data-fill-to="75" 
     data-fill-property="width" 
     data-fill-unit="%">
  <div style="width: 0%; background: #4fcdfc; height: 20px;"></div>
</div>
```

### xeStatusUpdate

**Purpose:** Status update widget with auto-switching

**Type:** Element, Attribute, or Class directive

**Attributes:**
- `auto-switch` (number): Auto-switch interval in seconds (default: 0, disabled)

**Usage:**
```html
<div xe-status-update data-auto-switch="5">
  <div class="xe-nav">
    <a href="#" class="xe-prev">Previous</a>
    <a href="#" class="xe-next">Next</a>
  </div>
  <ul class="xe-body">
    <li class="active">Status 1</li>
    <li>Status 2</li>
    <li>Status 3</li>
  </ul>
</div>
```

## Critical Patterns

### Always Clean Up WebSocket Connections

```javascript
// ✅ CORRECT
$scope.$on('$destroy', function() {
  $weighservice.kill(station);
});

// ❌ WRONG - Memory leak
// No cleanup
```

### Use Navigation Factory for State

```javascript
// ✅ CORRECT
$navigation.set({
  company_id: vm.companyId,
  site_id: vm.siteId
});

// ❌ WRONG - Direct $rootScope access
$rootScope.Params = { company_id: vm.companyId };
```

### Handle Factory Promises

```javascript
// ✅ CORRECT
$Functions.Company().then(function(companies) {
  vm.companies = companies;
}, function(response) {
  $rootScope.Error(response);
});

// ❌ WRONG - No error handling
$Functions.Company().then(function(companies) {
  vm.companies = companies;
});
```

## Related Documentation

- [Application Initialization](./05-APPLICATION-INITIALIZATION.md) - Global functions
- [Directives and Services](./03-DIRECTIVES-SERVICES.md) - Other directives
- [Controllers](./01-CONTROLLERS.md) - Controller usage

