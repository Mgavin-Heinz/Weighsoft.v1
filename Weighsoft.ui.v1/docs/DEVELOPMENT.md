# Development Guide

## Getting Started

### Prerequisites
- Node.js (v14+)
- Yarn
- Git

### Setup

```bash
# Clone repository
git clone <repo-url>
cd Weighsoft.ui.v1

# Install dependencies
yarn install

# Configure environment
cp app/js/env.example.js app/js/env.js
```

Edit `app/js/env.js` with your backend URL.

### Running Locally

Serve the app with any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node
npx serve .

# Using PHP
php -S localhost:8080
```

## Adding New Features

### 1. Create Controller

Create `app/js/controllers/[feature].js`:

```javascript
'use strict';
angular
    .module('xenon.controllers')
    .controller('FeatureCtrl', function($scope, $rootScope, $state, Restangular, $navigation) {
        const vm = this;
        vm.baseData = Restangular.all('feature');
        vm.list = [];
        
        vm.init = function() {
            $navigation.clear();
            $rootScope.Start();
            
            vm.baseData.getList($navigation.get()).then(
                function(data) {
                    vm.list = data;
                    $rootScope.Loaded();
                },
                function(response) {
                    $rootScope.Error(response);
                }
            );
        };
        
        vm.init();
    });
```

### 2. Create Template

Create `app/tpls/[feature]/list.html`:

```html
<div class="row" ng-controller="FeatureCtrl as System">
    <div class="col-md-12">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Feature List</h3>
            </div>
            <div class="panel-body">
                <table datatable="ng" class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr ng-repeat="item in System.list">
                            <td>{{item.name}}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" 
                                        ng-click="System.edit(item.id)">
                                    Edit
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
```

### 3. Add Route

Add to `app/js/routes.js`:

```javascript
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
})
```

### 4. Register Controller Script

Add to `index.html`:

```html
<script src="app/js/controllers/feature.js"></script>
```

### 5. Add Menu Item (Optional)

Edit `app/js/services.js` in `prepareSidebarMenu()`:

```javascript
if (permissions.feature === 'true') {
    vm.Section.addItem('Feature', '/app/feature', 'fa-icon');
}
```

## Code Standards

### Controller Pattern
- Use `const vm = this;`
- Use `'use strict';`
- Handle errors in all promises
- Always show loading states

### Naming
- Files: `lowercase_underscore.js`
- Controllers: `PascalCaseCtrl`
- Routes: `app.lowercase_underscore`
- Variables: `camelCase`

### API Calls
- Always use Restangular (never `$http`)
- Always handle errors
- Always show/hide loading states

### Templates
- Use `ng-controller="Ctrl as System"`
- Reference data as `System.property`
- Use Bootstrap 4 classes

## Version Control

### Updating Versions

When making changes, update these files:

1. `build.bat` - `set version=0.10.X`
2. `build.sh` - `version=0.10.X`
3. `app/tpls/layout/page-title.html` - Version display
4. `package.json` - `"version": "1.3.X"`

### Commit Message Format

```
[Type] Brief description

- Detailed change 1
- Detailed change 2
- Version updated to 0.10.X
```

Types: `[Feature]`, `[Fix]`, `[Update]`, `[Refactor]`, `[UI]`, `[Config]`

## Building for Production

### Docker Build

```bash
# Windows
build.bat

# Linux/Mac
./build.sh
```

This builds a multi-architecture Docker image and pushes to registry.

### Docker Image Details

- Base: Alpine Linux + Nginx
- Exposes: Port 80
- Serves static files from `/usr/share/nginx/html`

## Debugging

### Browser DevTools
- AngularJS Batarang extension
- Check `$rootScope` in console
- Inspect `localStorage.user_info`

### Common Issues

**401 Errors**: Token expired, logout and login again

**State not preserved**: Check `$navigation` and localStorage

**Loading stuck**: Ensure `$rootScope.Loaded()` is called in all paths

## Testing

Currently no automated tests. Manual testing checklist:

1. Login/Logout
2. CRUD operations for each entity
3. Weighing flow (first weight, second weight)
4. Permission-based menu visibility
5. Data filtering by company/site
