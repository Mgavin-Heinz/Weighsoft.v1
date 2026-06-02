# Constants and Asset Management

## Overview

This document covers the ASSETS constant, lazy loading configuration, and asset management patterns in the Weighsoft frontend application.

## ASSETS Constant

**Location:** `app/js/constants.js`

**Purpose:** Defines all lazy-loadable assets organized by category

```javascript
var app = angular.module('xenon-app');
app.constant('ASSETS', {
  'core': { /* ... */ },
  'charts': { /* ... */ },
  'xenonLib': { /* ... */ },
  'maps': { /* ... */ },
  'icons': { /* ... */ },
  'tables': { /* ... */ },
  'forms': { /* ... */ },
  'uikit': { /* ... */ },
  'extra': { /* ... */ }
});
```

## Asset Categories

### Core Assets

**Purpose:** Essential libraries and utilities

```javascript
'core': {
  'bootstrap': appHelper.assetPath('js/bootstrap.min.js'),
  'jQueryUI': [
    appHelper.assetPath('js/jquery-ui/jquery-ui.min.js'),
    appHelper.assetPath('js/jquery-ui/jquery-ui.structure.min.css'),
  ],
  'moment': appHelper.assetPath('js/moment.min.js'),
  'googleMapsLoader': appHelper.assetPath('app/js/angular-google-maps/load-google-maps.js')
}
```

**Usage:**
- Bootstrap: UI framework components
- jQueryUI: UI interactions and widgets
- Moment: Date/time manipulation
- Google Maps: Map integration

### Charts Assets

**Purpose:** Charting and visualization libraries

```javascript
'charts': {
  'dxGlobalize': appHelper.assetPath('js/devexpress-web-14.1/js/globalize.min.js'),
  'dxCharts': appHelper.assetPath('js/devexpress-web-14.1/js/dx.chartjs.js'),
  'dxVMWorld': appHelper.assetPath('js/devexpress-web-14.1/js/vectormap-data/world.js'),
}
```

**Usage:**
- DevExtreme charts for data visualization
- Globalize for internationalization
- Vector maps for geographic data

### Xenon Library

**Purpose:** Custom Xenon theme utilities

```javascript
'xenonLib': {
  notes: appHelper.assetPath('js/xenon-notes.js'),
}
```

### Maps Assets

**Purpose:** Vector map libraries

```javascript
'maps': {
  'vectorMaps': [
    appHelper.assetPath('js/jvectormap/jquery-jvectormap-1.2.2.min.js'),
    appHelper.assetPath('js/jvectormap/regions/jquery-jvectormap-world-mill-en.js'),
    appHelper.assetPath('js/jvectormap/regions/jquery-jvectormap-it-mill-en.js'),
  ],
}
```

### Icons Assets

**Purpose:** Icon font libraries

```javascript
'icons': {
  'meteocons': appHelper.assetPath('css/fonts/meteocons/css/meteocons.css'),
  'elusive': appHelper.assetPath('css/fonts/elusive/css/elusive.css'),
}
```

### Tables Assets

**Purpose:** DataTables and responsive table libraries

```javascript
'tables': {
  'rwd': appHelper.assetPath('js/rwd-table/js/rwd-table.min.js'),
  'datatables': [
    appHelper.assetPath('js/datatables/dataTables.bootstrap.css'),
    appHelper.assetPath('js/datatables/datatables-angular.js'),
  ],
}
```

### Forms Assets

**Purpose:** Form input libraries and widgets

```javascript
'forms': {
  'select2': [
    appHelper.assetPath('js/select2/select2.css'),
    appHelper.assetPath('js/select2/select2-bootstrap.css'),
    appHelper.assetPath('js/select2/select2.min.js'),
  ],
  'daterangepicker': [
    appHelper.assetPath('js/daterangepicker/daterangepicker-bs3.css'),
    appHelper.assetPath('js/daterangepicker/daterangepicker.js'),
  ],
  'colorpicker': appHelper.assetPath('js/colorpicker/bootstrap-colorpicker.min.js'),
  'selectboxit': appHelper.assetPath('js/selectboxit/jquery.selectBoxIt.js'),
  'tagsinput': appHelper.assetPath('js/tagsinput/bootstrap-tagsinput.min.js'),
  'datepicker': appHelper.assetPath('js/datepicker/bootstrap-datepicker.js'),
  'timepicker': appHelper.assetPath('js/timepicker/bootstrap-timepicker.min.js'),
  'inputmask': appHelper.assetPath('js/inputmask/jquery.inputmask.bundle.js'),
  'formWizard': appHelper.assetPath('js/formwizard/jquery.bootstrap.wizard.min.js'),
  'jQueryValidate': appHelper.assetPath('js/jquery-validate/jquery.validate.min.js'),
  'dropzone': [
    appHelper.assetPath('js/dropzone/css/dropzone.css'),
    appHelper.assetPath('js/dropzone/dropzone.min.js'),
  ],
  'typeahead': [
    appHelper.assetPath('js/typeahead.bundle.js'),
    appHelper.assetPath('js/handlebars.min.js'),
  ],
  'multiSelect': [
    appHelper.assetPath('js/multiselect/css/multi-select.css'),
    appHelper.assetPath('js/multiselect/js/jquery.multi-select.js'),
  ],
  'icheck': [
    appHelper.assetPath('js/icheck/skins/all.css'),
    appHelper.assetPath('js/icheck/icheck.min.js'),
  ],
  'bootstrapWysihtml5': [
    appHelper.assetPath('js/wysihtml5/src/bootstrap-wysihtml5.css'),
    appHelper.assetPath('js/wysihtml5/wysihtml5-angular.js')
  ],
}
```

### UIKit Assets

**Purpose:** UIKit framework components

```javascript
'uikit': {
  'base': [
    appHelper.assetPath('js/uikit/uikit.css'),
    appHelper.assetPath('js/uikit/css/addons/uikit.almost-flat.addons.min.css'),
    appHelper.assetPath('js/uikit/js/uikit.min.js'),
  ],
  'codemirror': [
    appHelper.assetPath('js/uikit/vendor/codemirror/codemirror.js'),
    appHelper.assetPath('js/uikit/vendor/codemirror/codemirror.css'),
  ],
  'marked': appHelper.assetPath('js/uikit/vendor/marked.js'),
  'htmleditor': appHelper.assetPath('js/uikit/js/addons/htmleditor.min.js'),
  'nestable': appHelper.assetPath('js/uikit/js/addons/nestable.min.js'),
}
```

### Extra Assets

**Purpose:** Additional utility libraries

```javascript
'extra': {
  'tocify': appHelper.assetPath('js/tocify/jquery.tocify.min.js'),
  'toastr': appHelper.assetPath('js/toastr/toastr.min.js'),
  'fullCalendar': [
    appHelper.assetPath('js/fullcalendar/fullcalendar.min.css'),
    appHelper.assetPath('js/fullcalendar/fullcalendar.min.js'),
  ],
  'cropper': [
    appHelper.assetPath('js/cropper/cropper.min.js'),
    appHelper.assetPath('js/cropper/cropper.min.css'),
  ]
}
```

## Lazy Loading

### oc.lazyLoad Integration

**Purpose:** Load assets on-demand to improve initial page load time

**Module:** `oc.lazyLoad` (AngularJS lazy loading module)

### Usage in Routes

**Pattern:** Load assets in route `resolve` blocks

```javascript
state('app.dashboard-main', {
  url: '/dashboard-main',
  templateUrl: appHelper.templatePath('dashboards/admin'),
  controller: "MainDashboard as System",
  resolve: {
    resources: function($ocLazyLoad) {
      return $ocLazyLoad.load([
        ASSETS.charts.dxGlobalize,
        ASSETS.extra.toastr,
      ]);
    },
    dxCharts: function($ocLazyLoad) {
      return $ocLazyLoad.load([
        ASSETS.charts.dxCharts,
      ]);
    },
  }
})
```

**Benefits:**
- Faster initial page load
- Load assets only when needed
- Better performance for large applications

### Loading Multiple Assets

**Pattern:** Arrays for CSS + JS combinations

```javascript
// Single asset
ASSETS.core.moment

// Multiple assets (array)
ASSETS.forms.select2  // [CSS, CSS, JS]
ASSETS.charts.dxCharts
```

### Asset Loading Order

**Important:** Load dependencies before dependents

```javascript
resolve: {
  // 1. Load dependencies first
  resources: function($ocLazyLoad) {
    return $ocLazyLoad.load([
      ASSETS.charts.dxGlobalize,  // Required for dxCharts
      ASSETS.extra.toastr,
    ]);
  },
  // 2. Load dependent assets
  dxCharts: function($ocLazyLoad) {
    return $ocLazyLoad.load([
      ASSETS.charts.dxCharts,  // Depends on dxGlobalize
    ]);
  },
}
```

## Adding New Assets

### Step 1: Add to ASSETS Constant

```javascript
app.constant('ASSETS', {
  // ... existing assets
  'myCategory': {
    'myAsset': appHelper.assetPath('js/my-asset.js'),
    'myAssetWithCSS': [
      appHelper.assetPath('css/my-asset.css'),
      appHelper.assetPath('js/my-asset.js'),
    ],
  }
});
```

### Step 2: Use in Route Resolve

```javascript
state('app.my-feature', {
  url: '/my-feature',
  templateUrl: appHelper.templatePath('my-feature/list'),
  resolve: {
    myAsset: function($ocLazyLoad) {
      return $ocLazyLoad.load([
        ASSETS.myCategory.myAsset,
      ]);
    },
  }
})
```

### Step 3: Use in Controller

```javascript
.controller('MyFeatureCtrl', function($scope) {
  // Asset is loaded, can use it now
  // e.g., if it's a jQuery plugin:
  // jQuery('#my-element').myPlugin();
});
```

## Critical Patterns

### Always Use appHelper.assetPath()

```javascript
// ✅ CORRECT
'bootstrap': appHelper.assetPath('js/bootstrap.min.js')

// ❌ WRONG
'bootstrap': 'assets/js/bootstrap.min.js'
```

### Use Arrays for CSS + JS

```javascript
// ✅ CORRECT - CSS before JS
'select2': [
  appHelper.assetPath('js/select2/select2.css'),
  appHelper.assetPath('js/select2/select2.min.js'),
]

// ❌ WRONG - Missing CSS
'select2': appHelper.assetPath('js/select2/select2.min.js')
```

### Load Dependencies First

```javascript
// ✅ CORRECT
resolve: {
  deps: function($ocLazyLoad) {
    return $ocLazyLoad.load([ASSETS.core.moment]);
  },
  feature: function($ocLazyLoad) {
    return $ocLazyLoad.load([ASSETS.myFeature.lib]);
  }
}

// ❌ WRONG - Missing dependency
resolve: {
  feature: function($ocLazyLoad) {
    return $ocLazyLoad.load([ASSETS.myFeature.lib]); // Requires moment!
  }
}
```

## Related Documentation

- [Global Utilities](./06-GLOBAL-UTILITIES.md) - appHelper usage
- [Routes and States](./02-ROUTES-STATES.md) - Route configuration
- [Application Initialization](./05-APPLICATION-INITIALIZATION.md) - Module setup

