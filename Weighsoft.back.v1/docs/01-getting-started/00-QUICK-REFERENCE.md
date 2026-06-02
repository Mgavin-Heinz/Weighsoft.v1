# Weighsoft Quick Reference Guide

## System Overview

**Weighsoft** is a comprehensive weighbridge management system with:
- Multi-tenant architecture (Companies → Sites → Workstations)
- Complex weighing workflows (First weight, Second weight, Multi-axle)
- Contract management and invoicing
- Real-time scale integration
- Camera integration
- Automated reporting

## Technology Stack

### Backend
- **Framework:** Laravel 8.40
- **PHP:** 8.3
- **Database:** MySQL with UUID (BINARY(16))
- **Auth:** JWT (tymon/jwt-auth)
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** AngularJS 1.4.8
- **Routing:** UI Router
- **HTTP:** Restangular
- **UI:** Bootstrap 4.5.0
- **Tables:** DataTables

## Critical Patterns

### UUID Handling (CRITICAL)

**NEVER compare UUIDs directly!**

```php
// ✅ CORRECT
$header = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])->first();

// ❌ WRONG
$header = weighingHeaders::where('id', $id)->first();
```

**Selecting with UUID:**
```php
$result = DB::select("
    SELECT BIN_TO_UUID(id, TRUE) as id, ...
    FROM weighingheaders
    WHERE id = UUID_TO_BIN(?, TRUE)
", [$id]);
```

### Controller Pattern

```php
class MyController extends JwtAuthController
{
    public function __construct() {
        parent::__construct();  // REQUIRED
        $this->model = new MyModel();
    }
}
```

### Service Pattern

```php
class MyService
{
    public function doSomething($data) {
        // Complex business logic
        // Database operations
        return $result;
    }
}
```

### Frontend Controller Pattern

```javascript
'use strict';
angular.module('xenon.controllers')
  .controller('MyCtrl', function($scope, $rootScope, Restangular) {
    const vm = this;
    vm.baseData = Restangular.all('route');
    
    vm.loadData = function() {
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
    };
  });
```

## Key Entities

### Core Entities
- **Companies** - Top-level tenant
- **Sites** - Physical locations
- **Workstations** - Individual stations
- **Weighbridges** - Scale hardware
- **Settings** - Weighing configurations

### Transaction Entities
- **weighingHeaders** - Main weighing records (UUID)
- **weighingTransactions** - Axle weights (UUID)
- **weighingCameras** - Camera images (UUID)
- **contractTransactions** - Contract links (UUID)

### Master Data
- **Products** - Product catalog
- **Business Partners** - Customers/suppliers
- **Hauliers** - Transport companies
- **Pallets** - Pallet types
- **Tares** - Stored tare weights
- **Contracts** - Contract definitions

## Weighing Workflow

1. **User Selection:** Company → Site → Workstation → Weighbridge
2. **Setting Selection:** Choose weighing configuration
3. **Data Entry:** Registration, partner, product, custom fields
4. **First Weight:** Capture initial weight
5. **Status Determination:**
   - Silo verification → VERIFY
   - Two-weight required → OPEN
   - Otherwise → CLOSED
6. **Second Weight** (if OPEN): Capture tare weight
7. **Verification** (if VERIFY): Manual verification
8. **Completion:** Print ticket, link contract, generate invoice

## Status Flow

```
CREATE → OPEN/VERIFY → CLOSED
         ↓
      DELETED (soft)
```

- **OPEN:** Awaiting second weight
- **VERIFY:** Requires manual verification
- **CLOSED:** Transaction complete
- **DELETED:** Soft deleted (recoverable)

## API Quick Reference

### Authentication
```bash
POST /api/login
  Body: { "email": "...", "password": "..." }
  Returns: { "token": "...", "user": {...} }

GET /api/me
  Headers: Authorization: Bearer {token}
```

### Weighing Headers
```bash
GET    /api/weighingheaders?company_id=1&status=OPEN
POST   /api/weighingheaders
GET    /api/weighingheaders/{id}
PUT    /api/weighingheaders/{id}
DELETE /api/weighingheaders/{id}
POST   /api/weighingheaders/{id}/verify
```

### Common Endpoints
```bash
GET  /api/company
GET  /api/site?company_id=1
GET  /api/settings?company_id=1
GET  /api/product?company_id=1
GET  /api/businesspartner?company_id=1
GET  /api/contract?company_id=1
```

## Database Quick Reference

### UUID Tables
- `weighingheaders` - id (BINARY(16))
- `weighingtransactions` - id, weighing_header_id (BINARY(16))
- `weighingcameras` - id, weighing_transaction_id (BINARY(16))
- `contract_transactions` - id, weighing_header_id (BINARY(16))

### Integer ID Tables
- `companies`, `sites`, `work_stations`, `weighbridges`
- `settings`, `products`, `business_partners`, `hauliers`
- `contracts`, `pallets`, `tares`, `users`

### Soft Deletes
Most tables support soft deletes via `deleted_at` column.

## Common Queries

### Get Weighing Header
```php
$header = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
    ->first(["weighingheaders.*", DB::raw("BIN_TO_UUID(id, TRUE) as id2")]);

if (!empty($header)) {
    $header['id'] = $header['id2'];
    unset($header['id2']);
}
```

### Get Weighing Transactions
```php
$transactions = DB::select("
    SELECT 
        BIN_TO_UUID(id, TRUE) as id,
        BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id,
        Weight1, Weight2, ...
    FROM weighingtransactions
    WHERE weighing_header_id = UUID_TO_BIN(?, TRUE)
", [$headerId]);
```

### Filter by Company/Site
```php
$query = weighingHeaders::where('company_id', $companyId)
    ->where('site_id', $siteId)
    ->where('status', 'CLOSED');
```

## Frontend Quick Reference

### Restangular Usage
```javascript
// List
Restangular.all('weighingheaders').getList({company_id: 1}).then(...);

// Single
Restangular.one('weighingheaders', id).get().then(...);

// Create
Restangular.all('weighingheaders').post(data).then(...);

// Update
Restangular.one('weighingheaders', id).customPUT(data).then(...);

// Delete
Restangular.one('weighingheaders', id).remove().then(...);
```

### State Navigation
```javascript
// Navigate
$state.go('app.weigh_create', {
  company_id: 1,
  site_id: 1,
  workstation_id: 1
});

// Preserve state
$rootScope.Params = {
  company_id: 1,
  site_id: 1,
  workstation_id: 1
};
```

### Loading States
```javascript
$rootScope.Start();      // Show loading
$rootScope.Loaded();     // Hide loading
$rootScope.Error(res);   // Show error + hide loading
```

## Integration Quick Reference

### Scale WebSocket
```javascript
scaleSocket = new WebSocket("ws://" + window.__env.scale + "/ws/emso");
scaleSocket.onmessage = function(event) {
  const weight = parseFloat(event.data);
  vm.currentWeight = weight;
  $scope.$apply();
};
```

### Camera Image
```javascript
Restangular.all('getImageFromIpString').post({
  imageUrl: 'http://192.168.1.100/image.jpg',
  authType: 'basic',
  username: 'admin',
  password: 'password'
}).then(function(base64Image) {
  vm.image = base64Image;
});
```

## Common Issues & Solutions

### UUID Not Found
**Problem:** Query returns null even though record exists
**Solution:** Use `UUID_TO_BIN()` in WHERE clause

### Authentication Fails
**Problem:** 401 Unauthorized
**Solution:** Check JWT token, verify `parent::__construct()` called

### Scale Not Connecting
**Problem:** WebSocket connection fails
**Solution:** Verify `window.__env.scale` is correct, check network

### Camera Image Fails
**Problem:** Image not loading
**Solution:** Verify camera IP, check authentication, test HTTP access

## File Locations

### Backend
- Controllers: `app/Http/Controllers/`
- Services: `app/Services/`
- Models: `app/Models/`
- Routes: `routes/api.php`
- Migrations: `database/migrations/`

### Frontend
- Controllers: `app/js/controllers/`
- Templates: `app/tpls/`
- Services: `app/js/services.js`
- Routes: `app/js/routes.js`
- Directives: `app/js/directives/`

## Environment Variables

### Backend (.env)
```
DB_HOST=127.0.0.1
DB_DATABASE=weighsoft
DB_USERNAME=root
DB_PASSWORD=password
JWT_SECRET=...
APP_ENV=production
APP_DEBUG=false
```

### Frontend (env.js)
```javascript
window.__env.base = "http://api.example.com";
window.__env.scale = "http://scale-service:3000";
window.__env.logo = "assets/images/logos/logo.png";
```

## Deployment Quick Steps

1. **Build Images:**
```bash
docker build -t weighsoft-backend .
docker build -t weighsoft-frontend .
```

2. **Run Containers:**
```bash
docker run -d -p 8000:80 weighsoft-backend
docker run -d -p 80:80 weighsoft-frontend
```

3. **Run Migrations:**
```bash
docker exec weighsoft-backend php artisan migrate
```

4. **Generate JWT Secret:**
```bash
docker exec weighsoft-backend php artisan jwt:secret
```

## Documentation Index

- **System Overview:** [00-SYSTEM-OVERVIEW.md](./00-SYSTEM-OVERVIEW.md)
- **Architecture:** [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)
- **Database:** [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md)
- **API:** [03-API-DOCUMENTATION.md](./03-API-DOCUMENTATION.md)
- **Integrations:** [04-INTEGRATIONS.md](./04-INTEGRATIONS.md)
- **Deployment:** [05-DEPLOYMENT.md](./05-DEPLOYMENT.md)
- **Development:** [06-DEVELOPMENT-WORKFLOW.md](./06-DEVELOPMENT-WORKFLOW.md)
- **Business Logic:** [07-BUSINESS-LOGIC.md](./07-BUSINESS-LOGIC.md)
- **Additional Endpoints:** [08-ADDITIONAL-ENDPOINTS.md](./08-ADDITIONAL-ENDPOINTS.md)

## Support

For detailed information, refer to the specific documentation files listed above.

