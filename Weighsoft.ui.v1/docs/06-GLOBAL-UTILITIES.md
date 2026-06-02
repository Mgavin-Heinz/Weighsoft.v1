# Global Utilities and Helpers

## Overview

This document covers global utility functions, helper objects, and custom JavaScript that provides core functionality across the Weighsoft frontend application.

## appHelper Object

**Location:** `index.html` (inline script)

**Purpose:** Provides path resolution for templates and assets

```javascript
var appHelper = {
  // Vars (paths without trailing slash)
  templatesDir: 'app/tpls',
  assetsDir: 'assets',
  
  // Methods
  templatePath: function(view_name) {
    return this.templatesDir + '/' + view_name + '.html';
  },
  
  assetPath: function(file_path) {
    return this.assetsDir + '/' + file_path;
  }
};
```

### Methods

#### appHelper.templatePath(view_name)

**Purpose:** Resolves template file paths

**Parameters:**
- `view_name` (string): Template name without extension (e.g., 'companies/list')

**Returns:** Full template path (e.g., 'app/tpls/companies/list.html')

**Usage:**
```javascript
// In routes.js
templateUrl: appHelper.templatePath('companies/list')

// In directives
templateUrl: appHelper.templatePath('layout/sidebar-menu')
```

**CRITICAL:** Always use `appHelper.templatePath()` instead of hardcoding paths.

#### appHelper.assetPath(file_path)

**Purpose:** Resolves asset file paths

**Parameters:**
- `file_path` (string): Asset path relative to assets directory

**Returns:** Full asset path (e.g., 'assets/js/bootstrap.min.js')

**Usage:**
```javascript
// In constants.js
'bootstrap': appHelper.assetPath('js/bootstrap.min.js')
```

## public_vars Object

**Location:** `app/js/xenon-custom.js` and `assets/js/xenon-custom.js`

**Purpose:** Global jQuery object references for DOM elements

```javascript
var public_vars = public_vars || {};

// Main DOM references
public_vars.$body                 = $("body");
public_vars.$pageContainer        = public_vars.$body.find(".page-container");
public_vars.$chat                 = public_vars.$pageContainer.find("#chat");
public_vars.$sidebarMenu          = public_vars.$pageContainer.find('.sidebar-menu');
public_vars.$sidebarProfile       = public_vars.$sidebarMenu.find('.sidebar-user-info');
public_vars.$mainMenu             = public_vars.$sidebarMenu.find('.main-menu');
public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
public_vars.$horizontalMenu      = public_vars.$horizontalNavbar.find('.navbar-nav');
public_vars.$mainContent          = public_vars.$pageContainer.find('.main-content');
public_vars.$mainFooter           = public_vars.$body.find('footer.main-footer');
public_vars.$userInfoMenuHor      = public_vars.$body.find('.navbar.horizontal-menu');
public_vars.$userInfoMenu         = public_vars.$body.find('nav.navbar.user-info-navbar');
public_vars.$settingsPane         = public_vars.$body.find('.settings-pane');
public_vars.$settingsPaneIn       = public_vars.$settingsPane.find('.settings-pane-inner');
public_vars.$pageLoadingOverlay   = public_vars.$body.find('.page-loading-overlay');

// Configuration
public_vars.wheelPropagation      = true; // Used in sidebar menu
public_vars.defaultColorsPalette  = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];
```

**Usage:**
- Provides cached jQuery references for performance
- Used throughout the application for DOM manipulation
- Initialized on document ready

## MyLocalStorage Utility

**Location:** `app/js/app.js`

**Purpose:** JSON-serialized localStorage wrapper

```javascript
var MyLocalStorage = {
  getItem: function(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  setItem: function(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
    return MyLocalStorage.getItem(key);
  },
  clear: function() {
    localStorage.clear();
  }
};
```

**Usage:**
```javascript
// Store user info
MyLocalStorage.setItem('user_info', {
  token: 'abc123',
  user: { id: 1, name: 'John' }
});

// Retrieve user info
var userInfo = MyLocalStorage.getItem('user_info');

// Clear all storage
MyLocalStorage.clear();
```

**Stored Data:**
- `user_info`: User authentication information
- `location`: Navigation parameters (company_id, site_id, etc.)

## xenon-custom.js Functions

**Location:** `app/js/xenon-custom.js`

**Purpose:** Custom UI functions for menu, panels, and widgets

### Sidebar Menu Functions

#### setup_sidebar_menu()

**Purpose:** Initializes sidebar menu expand/collapse functionality

**Features:**
- Handles menu item expansion/collapse
- Supports toggle-others mode
- Animated transitions using TweenMax
- Perfect scrollbar integration

#### sidebar_menu_item_expand($li, $sub)

**Purpose:** Expands a sidebar menu item

**Parameters:**
- `$li`: jQuery object of the list item
- `$sub`: jQuery object of the submenu

**Behavior:**
- Animates submenu height
- Shows submenu items with fade-in effect
- Updates perfect scrollbar

#### sidebar_menu_item_collapse($li, $sub)

**Purpose:** Collapses a sidebar menu item

**Parameters:**
- `$li`: jQuery object of the list item
- `$sub`: jQuery object of the submenu

**Behavior:**
- Animates submenu height to 0
- Hides submenu items
- Updates perfect scrollbar

### Horizontal Menu Functions

#### setup_horizontal_menu()

**Purpose:** Initializes horizontal navigation menu

**Features:**
- Click-to-expand or hover-to-expand modes
- Mobile menu toggle
- Animated submenu transitions

### Panel Functions

#### Panel Close

**Purpose:** Removes panels from the page

```javascript
$('body').on('click', '.panel a[data-toggle="remove"]', function(ev) {
  ev.preventDefault();
  var $panel = $(this).closest('.panel');
  $panel.remove();
});
```

#### Panel Reload

**Purpose:** Shows loading state on panel

```javascript
$('body').on('click', '.panel a[data-toggle="reload"]', function(ev) {
  ev.preventDefault();
  var $panel = $(this).closest('.panel');
  $panel.append('<div class="panel-disabled"><div class="loader-1"></div></div>');
  // Simulated reload
});
```

#### Panel Expand/Collapse

**Purpose:** Toggles panel collapsed state

```javascript
$('body').on('click', '.panel a[data-toggle="panel"]', function(ev) {
  ev.preventDefault();
  var $panel = $(this).closest('.panel');
  $panel.toggleClass('collapsed');
});
```

### Perfect Scrollbar Functions

#### ps_init()

**Purpose:** Initializes perfect scrollbar on sidebar menu

**Behavior:**
- Only initializes on desktop (not mobile)
- Only if sidebar is fixed and not collapsed

#### ps_update(destroy_init)

**Purpose:** Updates perfect scrollbar

**Parameters:**
- `destroy_init` (boolean): If true, destroys and reinitializes scrollbar

#### ps_destroy()

**Purpose:** Destroys perfect scrollbar

### Checkbox/Radio Replacement

#### cbr_replace()

**Purpose:** Replaces native checkboxes and radios with styled versions

**Features:**
- Custom styling with color options
- Maintains native functionality
- Supports disabled state

**Usage:**
```html
<input type="checkbox" class="cbr cbr-primary">
<input type="radio" class="cbr cbr-success">
```

### Date Formatter

#### date(format, timestamp)

**Purpose:** PHP-style date formatting function

**Parameters:**
- `format` (string): Date format string (PHP date() compatible)
- `timestamp` (number, optional): Unix timestamp (defaults to now)

**Returns:** Formatted date string

**Usage:**
```javascript
date('Y-m-d H:i:s'); // "2024-01-15 14:30:00"
date('F j, Y');      // "January 15, 2024"
```

## Helper Functions

### attrDefault($el, data_var, default_val)

**Purpose:** Gets data attribute with default fallback

**Parameters:**
- `$el`: jQuery element
- `data_var`: Data attribute name (without 'data-' prefix)
- `default_val`: Default value if attribute not found

**Returns:** Attribute value or default

**Usage:**
```javascript
var easing = attrDefault($el, 'easing', true);
var duration = attrDefault($el, 'duration', 2.5);
```

## weighModifiers Helper

**Location:** `app/js/helpers/weighModifiers.js`

**Purpose:** Weight calculation utilities

### calculateMoisture(totalWeight, moisturePercentage, prescribedMoisture)

**Purpose:** Calculates moisture-adjusted weight

**Parameters:**
- `totalWeight` (number): Total weight
- `moisturePercentage` (number): Current moisture percentage
- `prescribedMoisture` (number): Prescribed moisture percentage

**Returns:** Adjusted weight after moisture calculation

**Formula:**
```
moistureCoefficient = 100 - (100 - moisturePercentage) / (100 - prescribedMoisture)
adjustedWeight = totalWeight * moistureCoefficient
```

**Usage:**
```javascript
import { calculateMoisture } from './helpers/weighModifiers.js';

var adjustedWeight = calculateMoisture(1000, 15, 12);
```

## Environment Variables

**Location:** `app/js/env.js`

**Purpose:** Application environment configuration

```javascript
window.__env = window.__env || {};
window.__env.base = "http://localhost:8000";      // API base URL
window.__env.scale = "http://scale-service:3000"; // Scale service URL
window.__env.logo = "assets/images/logos/logo.png"; // Logo path
```

**Usage:**
```javascript
// In routes.js
var base = __env.base;
RestangularProvider.setBaseUrl(base + '/api');

// In controllers
var scaleUrl = window.__env.scale;
```

## Critical Patterns

### Always Use appHelper for Paths

```javascript
// ✅ CORRECT
templateUrl: appHelper.templatePath('companies/list')
assetPath: appHelper.assetPath('js/bootstrap.min.js')

// ❌ WRONG
templateUrl: 'app/tpls/companies/list.html'
assetPath: 'assets/js/bootstrap.min.js'
```

### Use MyLocalStorage for Persistence

```javascript
// ✅ CORRECT
MyLocalStorage.setItem('user_info', userInfo);
var userInfo = MyLocalStorage.getItem('user_info');

// ❌ WRONG
localStorage.setItem('user_info', JSON.stringify(userInfo));
var userInfo = JSON.parse(localStorage.getItem('user_info'));
```

### Use public_vars for DOM References

```javascript
// ✅ CORRECT
public_vars.$pageLoadingOverlay.addClass('loaded');

// ❌ WRONG
jQuery('.page-loading-overlay').addClass('loaded');
```

## Related Documentation

- [Application Initialization](./05-APPLICATION-INITIALIZATION.md) - Authentication and error handling
- [Constants and Assets](./07-CONSTANTS-ASSETS.md) - Asset management
- [Widgets and Factories](./08-WIDGETS-FACTORIES.md) - Factory functions

