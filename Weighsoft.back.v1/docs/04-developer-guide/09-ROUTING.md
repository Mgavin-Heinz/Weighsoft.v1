# API Routing Documentation

## Overview

This document details all API routes defined in the Weighsoft backend application.

## Route File

**Location:** `routes/api.php`

**Base Prefix:** All routes are prefixed with `/api`

**Middleware:** All routes (except login) require JWT authentication via `auth:api` middleware

## Authentication Routes

### Login
```
POST /api/authenticate
POST /api/login (alias)
```

### Register
```
POST /api/register
```

### Refresh Token
```
GET /api/refresh
```

## Resource Routes

Laravel resource routes provide standard CRUD operations:

### Standard Resource Routes

For each resource, the following routes are automatically created:

- `GET /api/{resource}` - List all
- `POST /api/{resource}` - Create
- `GET /api/{resource}/{id}` - Show single
- `PUT /api/{resource}/{id}` - Update
- `DELETE /api/{resource}/{id}` - Delete

### Resources

1. **Users**
   - Route: `/api/userprofile`
   - Controller: `UserController`

2. **User Types**
   - Route: `/api/usertype`
   - Controller: `UserTypeController`

3. **Companies**
   - Route: `/api/company`
   - Controller: `CompanyController`

4. **Sites**
   - Route: `/api/site`
   - Controller: `SiteController`

5. **Workstations**
   - Route: `/api/workstation`
   - Controller: `WorkStationsController`

6. **Weighbridges**
   - Route: `/api/weighbridge`
   - Controller: `WeighbridgeController`

7. **Cameras**
   - Route: `/api/camera`
   - Controller: `CameraController`

8. **Contracts**
   - Route: `/api/contract`
   - Controller: `ContractsController`

9. **Pallets**
   - Route: `/api/pallets`
   - Controller: `PalletController`

10. **Tares**
    - Route: `/api/tares`
    - Controller: `TareController`

11. **Contract Transactions**
    - Route: `/api/contracttransaction`
    - Controller: `ContractTransactionsController`

12. **Error Logs**
    - Route: `/api/errorlog`
    - Controller: `ErrorLogController`

13. **Exceptions**
    - Route: `/api/exceptions`
    - Controller: `ExceptionsController`

14. **Reporting**
    - Route: `/api/reporting`
    - Controller: `ReportingController`

15. **Business Partners**
    - Route: `/api/businesspartner`
    - Controller: `BusinessPartnerController`

16. **Hauliers**
    - Route: `/api/haulier`
    - Controller: `HaulierController`

17. **RFID Vehicles**
    - Route: `/api/rfidvehicle`
    - Controller: `RFIDVehicleController`

18. **Grades**
    - Route: `/api/grade`
    - Controller: `GradeController`

19. **Products**
    - Route: `/api/product`
    - Controller: `ProductController`

20. **Weighing Transactions**
    - Route: `/api/weighingtransactions`
    - Controller: `WeighingTransactionsController`

21. **Weighing Headers**
    - Route: `/api/weighingheaders`
    - Controller: `WeighingHeadersController`

22. **Settings**
    - Route: `/api/settings`
    - Controller: `SettingsController`

23. **Axel Setups**
    - Route: `/api/axelsetup`
    - Controller: `AxelSetupsController`

24. **Axle Types**
    - Route: `/api/axletypes`
    - Controller: `AxelTypesController`

## Custom Routes

### Weighing Headers

**Delete with Reason:**
```
POST /api/weighingheaders/{id}/delete
```

**Verify:**
```
POST /api/weighingheaders/{id}/verify
```

**Load Second Weight:**
```
GET /api/secondWeightLoad?weighing_header_id={id}&site_id={id}
```

### Contracts

**Delete with Reason:**
```
POST /api/contract/{id}/delete
```

### Pallets

**Delete with Reason:**
```
POST /api/pallets/{id}/delete
```

### Settings

**Update Image:**
```
POST /api/updateImage
```

**Load Weighing Settings:**
```
GET /api/weighingLoad?company_id={id}&site_id={id}
```

**Add Weighing Setting:**
```
GET /api/weighingAdd?company_id={id}
```

### Cameras

**Get Image from IP:**
```
POST /api/getImageFromIpString
```

### Reporting

**Send Report Email:**
```
POST /api/reportEmail
```

### Time and Date

**Set System Time:**
```
POST /api/timeAndDate
```

## Route Groups

All routes are grouped together but currently don't have additional middleware groups applied at the route level. Authentication is handled by individual controllers extending `JwtAuthController`.

## Route Naming

### Resource Routes

Resource routes follow Laravel conventions:
- Index: `{resource}.index`
- Store: `{resource}.store`
- Show: `{resource}.show`
- Update: `{resource}.update`
- Destroy: `{resource}.destroy`

### Custom Routes

Custom routes use descriptive names:
- `weighingheaders.delete` - Delete with reason
- `weighingheaders.verify` - Verify weighing
- `settings.updateImage` - Update image
- `camera.getImageFromIp` - Get camera image

## Route Parameters

### UUID Parameters

Routes with UUID parameters:
- `/api/weighingheaders/{id}` - UUID string
- `/api/weighingtransactions/{id}` - UUID string
- `/api/contracttransaction/{id}` - UUID string

### Integer Parameters

Most other routes use integer IDs:
- `/api/company/{id}` - Integer
- `/api/site/{id}` - Integer
- `/api/settings/{id}` - Integer

## Query Parameters

Most list endpoints support filtering via query parameters:

**Common Parameters:**
- `company_id` - Filter by company
- `site_id` - Filter by site
- `workstation_id` - Filter by workstation
- `weighbridge_id` - Filter by weighbridge
- `status` - Filter by status (for weighing headers)

**Pagination Parameters:**
- `pageSize` - Results per page
- `pageStart` - Pagination offset
- `orderByCol` - Sort column
- `orderByDir` - Sort direction (asc/desc)
- `searchTerm` - Search term

## Route Middleware

### Authentication

All routes except `/api/authenticate` and `/api/login` require JWT authentication.

**Middleware:** `auth:api`

**Applied in:** Controllers extending `JwtAuthController`

### CORS

CORS middleware is applied globally for API routes.

**Middleware:** `Cors`

## Route Organization

Routes are organized in `routes/api.php`:

1. **Resource Routes** - Standard CRUD operations
2. **Custom Routes** - Special operations
3. **Authentication Routes** - Login, register, refresh

## Route Testing

### Testing Routes

Use Laravel's testing tools:

```php
$response = $this->postJson('/api/weighingheaders', $data);
$response->assertStatus(200);
```

### API Testing Tools

- Postman
- Insomnia
- cURL
- Swagger UI (if configured)

## Route Documentation

For detailed endpoint documentation, see:
- [03-API-DOCUMENTATION.md](./03-API-DOCUMENTATION.md) - Main API reference
- [08-ADDITIONAL-ENDPOINTS.md](./08-ADDITIONAL-ENDPOINTS.md) - Additional endpoints

## Notes

### Route Prefix

All routes are automatically prefixed with `/api` by Laravel's route service provider.

### Route Caching

In production, routes should be cached:

```bash
php artisan route:cache
```

### Route List

View all routes:

```bash
php artisan route:list
```

Filter by path:

```bash
php artisan route:list --path=api
```

