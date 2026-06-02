# Architecture Guide

## Framework: AngularJS 1.4.8

This is a **legacy AngularJS 1.x application**. Do not use Angular 2+ patterns, TypeScript, or ES6 modules.

## Module Structure

```
xenon-app (Main)
├── xenon.controllers
├── xenon.services
├── xenon.factory
├── xenon.directives
└── Third-party modules
    ├── ui.router
    ├── restangular
    ├── datatables
    ├── ui.bootstrap
    └── ...
```

## Controller Pattern

Controllers use the "controller as" syntax with `vm`:

```javascript
'use strict';
angular
    .module('xenon.controllers')
    .controller('FeatureCtrl', function($scope, $rootScope, $state, Restangular) {
        const vm = this;
        
        // Data
        vm.list = [];
        vm.data = {};
        
        // Initialize
        vm.init = function() {
            $rootScope.Start();
            // Load data...
        };
        
        // Actions
        vm.saveForm = function(form) {
            if (!form.$valid) return;
            // Save logic...
        };
        
        vm.init();
    });
```

## Template Path Helper

Always use `appHelper.templatePath()` for template references:

```javascript
// Correct
templateUrl: appHelper.templatePath('companies/list')

// Wrong
templateUrl: 'app/tpls/companies/list.html'
```

## State Management

### UI Router States

Routes are defined in `routes.js`:

```javascript
$stateProvider
    .state('app.feature', {
        url: '/feature',
        templateUrl: appHelper.templatePath('feature/list'),
        controller: 'FeatureCtrl as System',
        resolve: {
            deps: function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ASSETS.tables.datatables,
                    ASSETS.extra.toastr
                ]);
            }
        }
    });
```

### Navigation State

Use `$rootScope.Params` and `$navigation` factory for state:

```javascript
// Setting state
$navigation.set({
    company_id: id,
    site_id: siteId,
    workstation_id: workstationId
});

// Getting state
var params = $navigation.get();
```

### Persisted Selection

Location state is persisted in localStorage:

```javascript
localStorage.setItem('location', JSON.stringify($rootScope.Params));
```

## Service Layer

### $Functions Factory

Central data loading factory (`factory.js`):

```javascript
$Functions.Company(id)     // Load companies
$Functions.Site(id)        // Load sites
$Functions.Workstation(id) // Load workstations
$Functions.Product(id)     // Load products
$Functions.Haulier(id)     // Load hauliers
$Functions.Settings()      // Load weigh settings
```

### $navigation Factory

Manages location context:

```javascript
$navigation.set(data)      // Set full state
$navigation.get()          // Get current state
$navigation.clear()        // Reset state
$navigation.Company(id)    // Set company
$navigation.Site(id)       // Set site
$navigation.Workstation(id)// Set workstation
```

## Loading States

Always show loading indicators:

```javascript
// Start loading
$rootScope.Start('Loading data');

// Success
vm.data = response;
$rootScope.Loaded('Data loaded');

// Error
$rootScope.Error(response);
```

## Error Handling

Use `$rootScope.Error()` for error display:

```javascript
vm.baseData.getList().then(
    function(data) {
        vm.list = data;
        $rootScope.Loaded();
    },
    function(response) {
        $rootScope.Error(response);
    }
);
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | lowercase_underscore | `weighing_create.js` |
| Controllers | PascalCaseCtrl | `WeighingCreateCtrl` |
| Routes | lowercase_underscore | `app.weigh_create` |
| Variables | camelCase | `companyList` |
| Template alias | `System` | `controller: 'Ctrl as System'` |

## Data Flow

```
User Action
    ↓
Controller Method
    ↓
$rootScope.Start() (show loading)
    ↓
Restangular API Call
    ↓
Promise Resolution
    ↓
$rootScope.Loaded() or $rootScope.Error()
    ↓
UI Update
```

## Memory Management

Clean up intervals and watchers on navigation:

```javascript
$scope.$on('$destroy', function() {
    if (vm.timer) {
        $interval.cancel(vm.timer);
    }
});
```

## Menu System

The sidebar menu is permission-based (`services.js`):

```javascript
$menuItems.prepareSidebarMenu(permissions);
```

Permissions are loaded from user profile on login.
