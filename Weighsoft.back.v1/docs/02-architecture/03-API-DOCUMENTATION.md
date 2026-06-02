# API Documentation

## Base URL

All API endpoints are prefixed with `/api`

## Authentication

### Login
**POST** `/api/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "permission": {
    "id": 1,
    "name": "Admin",
    "permissions": {...}
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `500` - Could not create token

### Get Authenticated User
**GET** `/api/me`

Get current authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com"
}
```

### Logout
**POST** `/api/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### Refresh Token
**POST** `/api/auth/refresh`

Refresh JWT token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "access_token": "new_token...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Register User
**POST** `/api/register`

Register a new user (if enabled).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "company_id": 1,
  "role_id": 1
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "access_token": "new_token...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## Weighing Headers

### List Weighing Headers
**GET** `/api/weighingheaders`

Get list of weighing headers with optional filters.

**Query Parameters:**
- `company_id` (optional) - Filter by company
- `site_id` (optional) - Filter by site
- `workstation_id` (optional) - Filter by workstation
- `status` (optional) - Filter by status (OPEN, VERIFY, CLOSED)
- `pageSize` (optional, default: 500) - Results per page
- `pageStart` (optional, default: 0) - Pagination offset
- `orderByCol` (optional, default: "updated_at") - Sort column
- `orderByDir` (optional, default: "desc") - Sort direction
- `searchTerm` (optional) - Search term

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "transaction": "WB001",
    "RegNumber": "ABC123",
    "FirstWeight": 15000.5,
    "SecondWeight": 5000.0,
    "TotalWeight": 10000.5,
    "NettWeight": 10000,
    "status": "CLOSED",
    "company_id": 1,
    "site_id": 1,
    "workstation_id": 1,
    "created_at": "2024-01-01 10:00:00",
    "updated_at": "2024-01-01 10:05:00"
  }
]
```

### Get Single Weighing Header
**GET** `/api/weighingheaders/{id}`

Get single weighing header by UUID.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transaction": "WB001",
  ...
}
```

**Error Responses:**
- `404` - Not found

### Create Weighing Header
**POST** `/api/weighingheaders`

Create new weighing header.

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "workstation_id": 1,
  "weighbridge_id": 1,
  "settings_id": 1,
  "RegNumber": "ABC123",
  "FirstWeight": 15000.5,
  "businesspartner_id": 1,
  "product_id": 1,
  "haulier_id": 1,
  "actiontype": "Create"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transaction": "WB001",
  "status": "OPEN",
  ...
}
```

### Update Weighing Header
**PUT** `/api/weighingheaders/{id}`

Update existing weighing header.

**Request Body:** (same as create)

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

### Delete Weighing Header
**DELETE** `/api/weighingheaders/{id}`

Soft delete weighing header.

**Response (200):**
```json
{
  "message": "Deleted successfully"
}
```

### Delete Weighing Header with Reason
**POST** `/api/weighingheaders/{id}/delete`

Soft delete weighing header with reason.

**Request Body:**
```json
{
  "reason": "Reason for deletion"
}
```

**Response (200):**
```json
{
  "message": "Deleted successfully"
}
```

### Load Second Weight
**GET** `/api/secondWeightLoad?weighing_header_id={id}&site_id={id}`

Load data for second weight entry.

**Response (200):**
```json
{
  "weighingHeader": {...},
  "settings": {...},
  "site": {...}
}
```

### Verify Weighing Header
**POST** `/api/weighingheaders/{id}/verify`

Verify a weighing header (changes status from VERIFY to CLOSED).

**Request Body:**
```json
{
  "SiloOverride": "No"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CLOSED",
  ...
}
```

## Weighing Transactions

### Create Weighing Transaction
**POST** `/api/weighingtransactions`

Create new weighing transaction (axle weights).

**Request Body:**
```json
{
  "weighing_header_id": "550e8400-e29b-41d4-a716-446655440000",
  "Status": "FIRST",
  "Weight1": 5000.0,
  "Weight2": 5000.0,
  "Weight3": 5000.0,
  "WeightTotal": 15000.0,
  "site_id": 1,
  "workstation_id": 1,
  "company_id": 1
}
```

**Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "weighing_header_id": "550e8400-e29b-41d4-a716-446655440000",
  "Weight1": 5000.0,
  ...
}
```

### Get Weighing Transactions
**GET** `/api/weighingtransactions?weighing_header_id={id}`

Get transactions for a weighing header.

**Response (200):**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "weighing_header_id": "550e8400-e29b-41d4-a716-446655440000",
    "Weight1": 5000.0,
    ...
  }
]
```

## Settings

### List Settings
**GET** `/api/settings?company_id={id}`

Get settings for a company.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Standard Weighing",
    "company_id": 1,
    "type_of_weighing": "1",
    "haulier": "true",
    "business_partner": "true",
    ...
  }
]
```

### Get Setting
**GET** `/api/settings/{id}`

Get single setting.

**Response (200):**
```json
{
  "id": 1,
  "name": "Standard Weighing",
  ...
}
```

### Create Setting
**POST** `/api/settings`

Create new setting.

**Request Body:**
```json
{
  "company_id": 1,
  "name": "New Setting",
  "type_of_weighing": "1",
  "haulier": "true",
  ...
}
```

### Update Setting
**PUT** `/api/settings/{id}`

Update setting.

### Update Setting Image
**POST** `/api/updateImage`

Update header or footer image for a setting.

**Request:**
- `id` - Setting ID
- `option` - "header" or "footer"
- `file` - Image file

**Response (200):**
```json
{
  "message": "base64_encoded_image..."
}
```

### Load Weighing Settings
**GET** `/api/weighingLoad?company_id={id}&site_id={id}`

Load weighing settings for company/site.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Standard Weighing",
    ...
  }
]
```

### Add Weighing Setting
**GET** `/api/weighingAdd?company_id={id}`

Get default weighing setting template.

**Response (200):**
```json
{
  "name": "New Setting",
  "company_id": 1,
  ...
}
```

### Send Report Email
**POST** `/api/reportEmail`

Send report email manually.

**Request Body:**
```json
{
  "reportId": 1
}
```

**Response (200):**
```json
{
  "message": "Report sent successfully"
}
```

**Request:**
- `file` - Image file
- `option` - "header" or "footer"

**Response (200):**
```json
{
  "message": "base64_encoded_image..."
}
```

## Companies

### List Companies
**GET** `/api/company`

Get all companies.

**Response (200):**
```json
[
  {
    "id": 1,
    "registered_name": "Company Name",
    "display_custom_logo_img": "base64...",
    ...
  }
]
```

### Get Company
**GET** `/api/company/{id}`

### Create Company
**POST** `/api/company`

### Update Company
**PUT** `/api/company/{id}`

### Delete Company
**DELETE** `/api/company/{id}`

## Sites

### List Sites
**GET** `/api/site?company_id={id}`

Get sites for a company.

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "site_name": "Main Site",
    "decimals": 2,
    "measure_type": "kg",
    ...
  }
]
```

### Get Site
**GET** `/api/site/{id}`

### Create Site
**POST** `/api/site`

### Update Site
**PUT** `/api/site/{id}`

### Delete Site
**DELETE** `/api/site/{id}`

## Workstations

### List Workstations
**GET** `/api/workstation?site_id={id}`

### Get Workstation
**GET** `/api/workstation/{id}`

### Create Workstation
**POST** `/api/workstation`

### Update Workstation
**PUT** `/api/workstation/{id}`

### Delete Workstation
**DELETE** `/api/workstation/{id}`

## Weighbridges

### List Weighbridges
**GET** `/api/weighbridge?site_id={id}`

### Get Weighbridge
**GET** `/api/weighbridge/{id}`

### Create Weighbridge
**POST** `/api/weighbridge`

### Update Weighbridge
**PUT** `/api/weighbridge/{id}`

### Delete Weighbridge
**DELETE** `/api/weighbridge/{id}`

## Products

### List Products
**GET** `/api/product?company_id={id}`

### Get Product
**GET** `/api/product/{id}`

### Create Product
**POST** `/api/product`

### Update Product
**PUT** `/api/product/{id}`

### Delete Product
**DELETE** `/api/product/{id}`

## Business Partners

### List Business Partners
**GET** `/api/businesspartner?company_id={id}`

### Get Business Partner
**GET** `/api/businesspartner/{id}`

### Create Business Partner
**POST** `/api/businesspartner`

### Update Business Partner
**PUT** `/api/businesspartner/{id}`

### Delete Business Partner
**DELETE** `/api/businesspartner/{id}`

## Hauliers

### List Hauliers
**GET** `/api/haulier?company_id={id}`

### Get Haulier
**GET** `/api/haulier/{id}`

### Create Haulier
**POST** `/api/haulier`

### Update Haulier
**PUT** `/api/haulier/{id}`

### Delete Haulier
**DELETE** `/api/haulier/{id}`

## Contracts

### List Contracts
**GET** `/api/contract?company_id={id}&site_id={id}`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Contract Name",
    "contract_number": "CT001",
    "product": "Product Name",
    "businesspartner": "Partner Name",
    "amount": 1000.00,
    "has_transaction": true,
    ...
  }
]
```

### Get Contract
**GET** `/api/contract/{id}`

### Create Contract
**POST** `/api/contract`

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "name": "Contract Name",
  "businesspartner_id": 1,
  "product_id": 1,
  "contract_number": "CT001",
  "contract_date": "2024-01-01",
  "expiry_date": "2024-12-31",
  "amount": 1000.00,
  "price": "10.00"
}
```

### Update Contract
**PUT** `/api/contract/{id}`

### Delete Contract
**DELETE** `/api/contract/{id}`

### Delete Contract with Reason
**POST** `/api/contract/{id}/delete`

Soft delete contract with reason.

**Request Body:**
```json
{
  "reason": "Reason for deletion"
}
```

## Contract Transactions

### List Contract Transactions
**GET** `/api/contracttransaction?contract_id={id}`

### Get Contract Transaction
**GET** `/api/contracttransaction/{id}`

### Create Contract Transaction
**POST** `/api/contracttransaction`

## Pallets

### List Pallets
**GET** `/api/pallet?company_id={id}&site_id={id}`

### Get Pallet
**GET** `/api/pallet/{id}`

### Create Pallet
**POST** `/api/pallet`

### Update Pallet
**PUT** `/api/pallet/{id}`

### Delete Pallet
**DELETE** `/api/pallet/{id}`

### Delete Pallet with Reason
**POST** `/api/pallets/{id}/delete`

Soft delete pallet with reason.

**Request Body:**
```json
{
  "reason": "Reason for deletion"
}
```

## Tares

### List Tares
**GET** `/api/tare?company_id={id}&site_id={id}`

**Note:** Only returns tares that haven't expired.

### Get Tare
**GET** `/api/tare/{id}`

### Create Tare
**POST** `/api/tare`

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "RegNumber": "ABC123",
  "tare_weight": 5000.0,
  "expiry_date": "2024-12-31"
}
```

### Update Tare
**PUT** `/api/tare/{id}`

### Delete Tare
**DELETE** `/api/tare/{id}`

## Cameras

### List Cameras
**GET** `/api/camera?company_id={id}&site_id={id}&workstation_id={id}&weighbridge_id={id}`

### Get Camera
**GET** `/api/camera/{id}`

### Create Camera
**POST** `/api/camera`

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "workstation_id": 1,
  "weighbridge_id": 1,
  "name": "Front Camera",
  "ip_address": "192.168.1.100",
  "auth_type": "basic",
  "username": "admin",
  "password": "password",
  "print_camera": "true"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `print_camera` | string | No | `"true"` or `"false"`. Controls whether this camera's images appear on printed tickets. Defaults to `"true"`. |

### Update Camera
**PUT** `/api/camera/{id}`

### Delete Camera
**DELETE** `/api/camera/{id}`

### Get Image from IP
**POST** `/api/getImageFromIpString`

Get image from camera IP address.

**Request Body:**
```json
{
  "imageUrl": "http://192.168.1.100/image.jpg",
  "authType": "basic",
  "username": "admin",
  "password": "password"
}
```

**Response (200):**
```json
"base64_encoded_image_string"
```

### Numberplate Recognition (LPR)
**POST** `/api/numberplate-recognition`

Recognize a license plate from a base64-encoded camera image using OpenAI Vision. Requires `OPENAI_API_KEY` to be set in `.env`; if missing, the endpoint returns 503.

**Request Body:**
```json
{
  "imageBase64": "raw_base64_image_string"
}
```
Alternatively, send `imageDataUrl` with a data URL (e.g. `data:image/png;base64,...`). One of `imageBase64` or `imageDataUrl` is required.

**Response (200):**
```json
{
  "plate_number": "ABC 123 GP"
}
```

**Error Responses:**
- `400` - Missing or invalid image (e.g. `{"success": false, "error": "Missing image. Send imageBase64 or imageDataUrl."}`)
- `422` - No plate found or recognition failed (e.g. `{"success": false, "error": "Numberplate not recognized"}`)
- `503` - LPR not configured (e.g. `{"success": false, "error": "Numberplate recognition is not configured."}`). Set `OPENAI_API_KEY` in `.env` to enable.

## Reporting

### List Reports
**GET** `/api/reporting?company_id={id}`

### Get Report
**GET** `/api/reporting/{id}`

### Create Report
**POST** `/api/reporting`

**Request Body:**
```json
{
  "company_id": 1,
  "name": "Daily Report",
  "email": "admin@example.com;manager@example.com",
  "time_frame": 1
}
```

### Get Report Data
**POST** `/api/reporting/getdata`

Generate report data.

**Request Body:**
```json
{
  "id": 1,
  "Setting": 1,
  "Site": "",
  "Weighbridge": "",
  "DateRange": {
    "startDate": "2024-01-01 00:00:00",
    "endDate": "2024-01-31 23:59:59"
  }
}
```

**Response (200):**
```json
{
  "data": [...],
  "info": {...}
}
```

## Users

### List Users
**GET** `/api/user?company_id={id}`

### Get User
**GET** `/api/user/{id}`

### Create User
**POST** `/api/user`

### Update User
**PUT** `/api/user/{id}`

### Delete User
**DELETE** `/api/user/{id}`

## User Types

### List User Types
**GET** `/api/usertype`

### Get User Type
**GET** `/api/usertype/{id}`

### Create User Type
**POST** `/api/usertype`

### Update User Type
**PUT** `/api/usertype/{id}`

### Delete User Type
**DELETE** `/api/usertype/{id}`

## Additional Endpoints

For additional endpoints including Grades, Axel Setups, Exceptions, Error Logs, Time/Date, User Workstations, and more, see [08-ADDITIONAL-ENDPOINTS.md](./08-ADDITIONAL-ENDPOINTS.md).

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthenticated",
  "message": "Token invalid or expired"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "The requested resource was not found"
}
```

### 422 Validation Error
```json
{
  "field_name": ["Validation error message"],
  "another_field": ["Another error"]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Common Query Parameters

Most list endpoints support:
- `company_id` - Filter by company
- `site_id` - Filter by site
- `workstation_id` - Filter by workstation
- Pagination parameters (where applicable)

## UUID Format

All UUID fields in requests and responses use standard UUID format:
```
550e8400-e29b-41d4-a716-446655440000
```

## Date Formats

- Dates: `YYYY-MM-DD`
- Timestamps: `YYYY-MM-DD HH:MM:SS`
- ISO 8601 format preferred for API responses

