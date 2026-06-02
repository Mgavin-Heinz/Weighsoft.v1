# Application Initialization and Configuration

## Overview

This document covers the application initialization, authentication flow, error handling, and global `$rootScope` functions in the Weighsoft frontend application.

## Application Bootstrap

### Main Application Module

**File:** `app/js/app.js`

The application is bootstrapped with AngularJS 1.4.8 and includes multiple dependencies:

```javascript
var app = angular.module('xenon-app', [
  'ngCookies',           // Cookie handling
  'ui.router',           // UI Router for state management
  'ui.bootstrap',        // Bootstrap UI components
  'oc.lazyLoad',         // Lazy loading of modules
  'xenon.controllers',   // Application controllers
  'xenon.directives',    // Application directives
  'xenon.factory',       // Application factories
  'xenon.services',      // Application services
  'FBAngular',          // Firebase integration
  'satellizer',         // Authentication
  'restangular',        // RESTful API client
  'datatables',         // DataTables integration
  'datatables.bootstrap',
  'datatables.buttons',
  'schemaForm',         // Dynamic form generation
  'ngWebSocket',        // WebSocket support
  'textAngular',        // Rich text editor
  'ui.select',          // Select dropdown component
  'daterangepicker',    // Date range picker
  'angular-cron-jobs',  // Cron job configuration
  'angularFileUpload'   // File upload support
]);
```

## Local Storage Utility

### MyLocalStorage

A utility object for managing browser localStorage with JSON serialization:

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
- Stores user authentication information
- Persists user preferences
- Maintains session state

## Application Run Blocks

### Page Loading Overlay

**Purpose:** Manages the initial page loading overlay

```javascript
app.run(function() {
  public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');
  jQuery(window).load(function() {
    public_vars.$pageLoadingOverlay.addClass('loaded');
  });
});
```

### Authentication and Error Handling

**Purpose:** Initializes authentication, error interceptors, and global functions

```javascript
app.run(function($rootScope, $state, Restangular, $location) {
  // Initialize user info from localStorage
  $state.user_info = MyLocalStorage.getItem('user_info');
  
  if($state.user_info) {
    $rootScope.authenticated = true;
    $rootScope.token = $state.user_info.token;
    Restangular.setDefaultRequestParams({token: $state.user_info.token});
  }

  // Logout function
  function logout() {
    MyLocalStorage.clear('user_info');
    $state.user_info = MyLocalStorage.getItem('user_info');
    $state.transitionTo('login');
  }

  // Restangular error interceptor
  Restangular.setErrorInterceptor(function(response) {
    if(response.status === 401) {
      logout();
      return false;
    } else if(response.status === 400) {
      if(response.data && response.data.error === 'token_invalid') {
        logout();
        return false;
      }
    }
    return true;
  });
  
  // ... global functions (see below)
});
```

## Global $rootScope Functions

### $rootScope.Start(Flow)

**Purpose:** Shows loading overlay and optional toast notification

**Parameters:**
- `Flow` (string, optional): Description of the loading operation

**Behavior:**
- Removes 'loaded' class from page loading overlay
- Shows toast notification if `$rootScope.layoutOptions.Toaster === "Yes"`

**Usage:**
```javascript
$rootScope.Start('Loading Companies');
vm.baseData.getList().then(function(data) {
  vm.companies = data;
  $rootScope.Loaded('Companies');
});
```

### $rootScope.Loaded(Flow)

**Purpose:** Hides loading overlay and shows success notification

**Parameters:**
- `Flow` (string, optional): Description of the completed operation

**Behavior:**
- Adds 'loaded' class to page loading overlay
- Shows success toast notification if toaster is enabled

**Usage:**
```javascript
vm.baseData.getList().then(function(data) {
  vm.companies = data;
  $rootScope.Loaded('Companies');
}, function(response) {
  $rootScope.Error(response);
});
```

### $rootScope.Message(response, type)

**Purpose:** Shows informational message via toast

**Parameters:**
- `response` (string): Message text
- `type` (string): Message type - "Info" or "Success"

**Behavior:**
- Shows toast notification if toaster is enabled
- Defaults to "Info" type if not specified

**Usage:**
```javascript
$rootScope.Message('Operation completed successfully', 'Success');
```

### $rootScope.Error(response)

**Purpose:** Handles errors and shows error notifications

**Parameters:**
- `response` (object): Error response object

**Behavior:**
- Hides loading overlay
- Extracts error message from response object (handles nested structures)
- Shows error toast notification
- Automatically logs out if error contains "Token" or "token"

**Error Message Extraction:**
The function attempts to extract error messages from multiple possible locations:
1. `response.data`
2. `response.data.message`
3. `response.data.errors`
4. `response.data.message.data`
5. `response.data.message.data.message`

**Usage:**
```javascript
vm.baseData.post(vm.data).then(function() {
  $rootScope.Loaded();
}, function(response) {
  $rootScope.Error(response);
});
```

## State Change Handling

### Route Protection

**Purpose:** Protects routes and redirects unauthenticated users

```javascript
$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
  var normalRoutes = ['login'];
  var restrictedRoutes = [];
  var loginInfo = MyLocalStorage.getItem('user_info');
  
  // Redirect to login if not authenticated
  if(!loginInfo && $.inArray(toState.name, normalRoutes) == -1) {
    event.preventDefault();
    $state.transitionTo('login');
  }
  
  // Prevent direct navigation to edit/manage/update routes
  var segment_str = toState.url;
  var segment_array = segment_str.split('/');
  var last_segment = segment_array[segment_array.length - 1];
  var shortUrl = segment_str.substring(0, segment_str.lastIndexOf("/"));
  var res0 = shortUrl.substring(1);
  var res = res0.split('/')[0];
  
  if(loginInfo && last_segment == 'edit' && fromState.name == '') {
    event.preventDefault();
    $state.transitionTo('app.' + res);
  }
  
  if(loginInfo && last_segment == 'manage' && fromState.name == '') {
    event.preventDefault();
    $state.transitionTo('app.' + res);
  }
  
  if(loginInfo && last_segment == 'update' && fromState.name == '') {
    event.preventDefault();
    $state.transitionTo('app.' + res);
  }
});
```

**Protected Routes:**
- Routes ending with `/edit` (must navigate from list first)
- Routes ending with `/manage` (must navigate from list first)
- Routes ending with `/update` (must navigate from list first)

## Authentication Flow

### Login Process

1. User submits login form
2. Credentials sent to `/api/authenticate`
3. On success:
   - User info stored in `MyLocalStorage` with key `'user_info'`
   - Token stored in `$rootScope.token`
   - Token added to all Restangular requests
   - User redirected to dashboard

### Token Management

- **Storage:** Token stored in localStorage as part of `user_info` object
- **Usage:** Automatically added to all API requests via `Restangular.setDefaultRequestParams()`
- **Refresh:** Token can be refreshed via API endpoint
- **Expiration:** Handled by error interceptor (401 or token_invalid)

### Logout Process

1. Clear localStorage
2. Clear `$state.user_info`
3. Set `$rootScope.authenticated = false`
4. Redirect to login page

## Error Handling Patterns

### API Error Handling

**Standard Pattern:**
```javascript
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
```

### Error Interceptor

The Restangular error interceptor automatically:
- Logs out user on 401 (Unauthorized)
- Logs out user on 400 with `token_invalid` error
- Returns `false` to prevent error propagation for auth errors
- Returns `true` to allow error propagation for other errors

## Critical Patterns

### Always Use Loading States

```javascript
// ✅ CORRECT
$rootScope.Start();
vm.baseData.getList().then(function(data) {
  vm.items = data;
  $rootScope.Loaded();
}, function(response) {
  $rootScope.Error(response);
});

// ❌ WRONG - No loading state
vm.baseData.getList().then(function(data) {
  vm.items = data;
});
```

### Always Handle Errors

```javascript
// ✅ CORRECT
vm.baseData.post(vm.data).then(function() {
  $rootScope.Loaded();
}, function(response) {
  $rootScope.Error(response);
});

// ❌ WRONG - No error handling
vm.baseData.post(vm.data);
```

### Use MyLocalStorage for Persistence

```javascript
// ✅ CORRECT
MyLocalStorage.setItem('user_info', userInfo);
var userInfo = MyLocalStorage.getItem('user_info');

// ❌ WRONG - Direct localStorage access
localStorage.setItem('user_info', JSON.stringify(userInfo));
```

## Related Documentation

- [Global Utilities](./06-GLOBAL-UTILITIES.md) - appHelper, public_vars
- [Controllers](./01-CONTROLLERS.md) - Controller patterns
- [Routes and States](./02-ROUTES-STATES.md) - State management

