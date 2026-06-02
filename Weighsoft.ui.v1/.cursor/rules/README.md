# Cursor Rules for Weighsoft UI

This directory contains comprehensive rules for the Weighsoft UI AngularJS application. These rules help AI assistants understand the codebase architecture, patterns, and conventions to ensure consistent, maintainable code.

## Rule Files Overview

### 01-architecture.mdc
**Always Applied** - Core architecture and technology stack
- Framework version (AngularJS 1.4.8)
- Project structure
- Module organization
- Environment configuration
- Critical architecture rules

### 02-angularjs-patterns.mdc
**Applies to**: JavaScript files in `app/js/`
- Controller patterns (controller as syntax)
- Dependency injection
- Scope usage
- Loading states
- Error handling
- Form validation

### 03-api-data-handling.mdc
**Applies to**: JavaScript files in `app/js/`
- Restangular usage (REQUIRED - never use $http)
- Data loading patterns
- Error handling
- File uploads
- State persistence

### 04-file-organization.mdc
**Always Applied** - File naming and organization
- File naming conventions
- Directory structure
- Template path references
- Naming conventions (underscores vs camelCase)

### 05-common-pitfalls.mdc
**Always Applied** - Common mistakes to avoid
- Framework confusion warnings
- API call mistakes
- Controller mistakes
- Routing mistakes
- Critical rules summary

### 06-routing-state-management.mdc
**Applies to**: `routes.js` and controller files
- UI Router configuration
- State naming conventions
- Navigation patterns
- State persistence
- Route guards

### 07-templates-views.mdc
**Applies to**: HTML templates in `app/tpls/`
- Template organization
- Controller as syntax in templates
- Common template patterns
- Form validation
- Bootstrap components

### 08-adding-new-features.mdc
**Manual Application** - Step-by-step guide
- Complete workflow for adding features
- Code templates
- Checklists
- Common patterns reference

### 09-version-control-commits.mdc
**Always Applied** - Version management and commit workflow
- Version update process
- Commit message format
- Version file locations
- Workflow checklist

## How Rules Work

### Rule Types

1. **Always Apply**: Rules that are always included in context
   - Architecture rules
   - File organization rules
   - Common pitfalls
   - Version control and commits

2. **Apply Intelligently**: Rules that apply based on file patterns
   - AngularJS patterns (for .js files)
   - API handling (for .js files)
   - Routing (for routes.js and controllers)
   - Templates (for .html files)

3. **Apply Manually**: Rules you reference with @
   - Adding new features guide

### Using These Rules

When working with the codebase:

1. **For new features**: Reference `@08-adding-new-features.mdc`
2. **For controllers**: Rules automatically apply when editing `.js` files
3. **For templates**: Rules automatically apply when editing `.html` files
4. **For routing**: Rules automatically apply when editing `routes.js`

## Key Principles

1. **This is AngularJS 1.4.8** - NOT Angular 2+
2. **Always use Restangular** - Never use $http directly
3. **Always use controller as syntax** - With `vm` pattern
4. **Always handle errors** - Use `$rootScope.Error()`
5. **Always manage loading states** - Use `$rootScope.Start()` / `$rootScope.Loaded()`
6. **Always use appHelper.templatePath()** - For template references
7. **Always use $state.go()** - For navigation
8. **Use underscores for file/route names** - Use camelCase for variables
9. **Always update versions and commit** - Every change requires version bump and commit

## Quick Reference

### Controller Template
```javascript
'use strict';
angular
  .module('xenon.controllers')
  .controller('FeatureCtrl', function($scope, $rootScope, $state, Restangular) {
    $rootScope.Start();
    const vm = this;
    const routeName = 'feature';
    
    vm.baseData = Restangular.all(routeName);
    // ... rest of controller
  });
```

### Route Template
```javascript
state('app.feature', {
  url: '/feature',
  templateUrl: appHelper.templatePath('feature/list'),
  controller: 'FeatureCtrl as System',
  resolve: {
    deps: function ($ocLazyLoad) {
      return $ocLazyLoad.load([
        ASSETS.tables.datatables,
        ASSETS.extra.toastr,
      ]);
    },
  }
})
```

### Template Template
```html
<div ng-controller="FeatureCtrl as System">
  <page-title title="Feature" description="Manage features"></page-title>
  <!-- Content -->
</div>
```

## For New Developers

1. Read `01-architecture.mdc` to understand the project structure
2. Read `02-angularjs-patterns.mdc` to understand controller patterns
3. Read `05-common-pitfalls.mdc` to avoid common mistakes
4. Use `08-adding-new-features.mdc` as a step-by-step guide
5. Reference other rules as needed when working on specific areas

## Maintenance

These rules should be updated when:
- New patterns are established
- Architecture changes
- Common mistakes are identified
- New conventions are adopted

Keep rules focused, actionable, and under 500 lines each. Split large rules into multiple files if needed.

