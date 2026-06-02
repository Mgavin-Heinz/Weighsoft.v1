# Additional API Endpoints

## Overview

This document covers additional API endpoints that were not fully detailed in the main API documentation.

## Grades

### List Grades
**GET** `/api/grade?company={id}`

Get product grades for a company.

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "name": "Grade A",
    "company": "Company Name"
  }
]
```

### Get Grade
**GET** `/api/grade/{id}`

### Create Grade
**POST** `/api/grade`

**Request Body:**
```json
{
  "company_id": 1,
  "name": "Grade A"
}
```

### Update Grade
**PUT** `/api/grade/{id}`

### Delete Grade
**DELETE** `/api/grade/{id}`

## Axel Setups

### List Axel Setups
**GET** `/api/axelsetup?company_id={id}`

Get axle configurations for a company.

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "name": "Standard 3-Axle",
    "configuration": {...}
  }
]
```

### Get Axel Setup
**GET** `/api/axelsetup/{id}`

### Create Axel Setup
**POST** `/api/axelsetup`

**Request Body:**
```json
{
  "company_id": 1,
  "name": "Standard 3-Axle",
  "configuration": {...}
}
```

### Update Axel Setup
**PUT** `/api/axelsetup/{id}`

### Delete Axel Setup
**DELETE** `/api/axelsetup/{id}`

## Axel Types

### List Axel Types
**GET** `/api/axeltype`

Get available axle types.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Single Axle",
    "description": "Standard single axle"
  }
]
```

### Get Axel Type
**GET** `/api/axeltype/{id}`

### Create Axel Type
**POST** `/api/axeltype`

### Update Axel Type
**PUT** `/api/axeltype/{id}`

### Delete Axel Type
**DELETE** `/api/axeltype/{id}`

## Exceptions

### List Exceptions
**GET** `/api/exception?company_id={id}&site_id={id}&workstation_id={id}&weighbridge_id={id}`

Get exception logs with optional filters.

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "site_id": 1,
    "code": "Transaction Deleted",
    "description": "Transaction was deleted by user",
    "jsondata": "{}",
    "comment": "User comment",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

### Get Exception
**GET** `/api/exception/{id}`

### Create Exception
**POST** `/api/exception`

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "workstation_id": 1,
  "weighbridge_id": 1,
  "code": "Exception Code",
  "description": "Exception description",
  "jsondata": "{}",
  "comment": "User comment"
}
```

### Update Exception
**PUT** `/api/exception/{id}`

### Delete Exception
**DELETE** `/api/exception/{id}`

## Error Log

### List Error Logs
**GET** `/api/errorlog`

Get system error logs.

**Response (200):**
```json
[
  {
    "id": 1,
    "error": "Error message",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

### Get Error Log
**GET** `/api/errorlog/{id}`

### Create Error Log
**POST** `/api/errorlog`

**Request Body:**
```json
{
  "error": "Error message"
}
```

## Time and Date

### Set System Time
**POST** `/api/timeanddate/set`

Set system time (Linux/Windows).

**Request Body:**
```json
[1704067200000]
```

**Note:** Timestamp in milliseconds.

**Response (200):**
```json
"Current date/time string"
```

**Security:** Only works on non-localhost hosts.

**Platform Support:**
- Linux: Uses `date -s` command
- Windows: Uses `date` and `time` commands

## User Workstations

### List User Workstations
**GET** `/api/userworkstation?user_id={id}`

Get workstation assignments for a user.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "workstation_id": 1,
    "created_at": "2024-01-01 10:00:00"
  }
]
```

### Get User Workstation
**GET** `/api/userworkstation/{id}`

### Create User Workstation
**POST** `/api/userworkstation`

**Request Body:**
```json
{
  "user_id": 1,
  "workstation_id": 1
}
```

### Update User Workstation
**PUT** `/api/userworkstation/{id}`

### Delete User Workstation
**DELETE** `/api/userworkstation/{id}`

## Weighing Transactions

### List Weighing Transactions
**GET** `/api/weighingtransactions?weighing_header_id={id}`

Get transactions for a weighing header.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "weighing_header_id": "660e8400-e29b-41d4-a716-446655440001",
    "Status": "FIRST",
    "Weight1": 5000.0,
    "Weight2": 5000.0,
    "Weight3": 5000.0,
    "Weight4": 0,
    "Weight5": 0,
    "Weight6": 0,
    "WeightTotal": 15000.0,
    "AxelSetups": 0
  }
]
```

### Get Weighing Transaction
**GET** `/api/weighingtransactions/{id}`

### Create Weighing Transaction
**POST** `/api/weighingtransactions`

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
  "company_id": 1,
  "AxelSetups": 0
}
```

### Update Weighing Transaction
**PUT** `/api/weighingtransactions/{id}`

### Delete Weighing Transaction
**DELETE** `/api/weighingtransactions/{id}`

## Contract Transactions

### List Contract Transactions
**GET** `/api/contracttransaction?contract_id={id}`

Get transactions for a contract.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "contract_id": 1,
    "weighing_header_id": "660e8400-e29b-41d4-a716-446655440001",
    "amount": 1000.0,
    "site_id": 1,
    "company_id": 1
  }
]
```

### Get Contract Transaction
**GET** `/api/contracttransaction/{id}`

### Create Contract Transaction
**POST** `/api/contracttransaction`

**Request Body:**
```json
{
  "contract_id": 1,
  "weighing_header_id": "550e8400-e29b-41d4-a716-446655440000",
  "contract_amount": 1000.0,
  "site_id": 1,
  "company_id": 1
}
```

### Update Contract Transaction
**PUT** `/api/contracttransaction/{id}`

### Delete Contract Transaction
**DELETE** `/api/contracttransaction/{id}`

## RFID Vehicles

### List RFID Vehicles
**GET** `/api/rfidvehicle?company_id={id}&site_id={id}`

Get RFID vehicle mappings.

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "site_id": 1,
    "RegNumber": "ABC123",
    "rfid_tag": "RFID123456",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

### Get RFID Vehicle
**GET** `/api/rfidvehicle/{id}`

### Create RFID Vehicle
**POST** `/api/rfidvehicle`

**Request Body:**
```json
{
  "company_id": 1,
  "site_id": 1,
  "RegNumber": "ABC123",
  "rfid_tag": "RFID123456"
}
```

### Update RFID Vehicle
**PUT** `/api/rfidvehicle/{id}`

### Delete RFID Vehicle
**DELETE** `/api/rfidvehicle/{id}`

## Additional Notes

### UUID Endpoints

All endpoints that return UUIDs convert them from BINARY(16) to string format:
- `weighingheaders`
- `weighingtransactions`
- `weighingcameras`
- `contract_transactions`

### Filtering

Most list endpoints support filtering by:
- `company_id`
- `site_id`
- `workstation_id`
- `weighbridge_id` (where applicable)

### Soft Deletes

Most entities support soft deletes:
- Records marked with `deleted_at` timestamp
- Excluded from normal queries
- Can be restored or permanently deleted

### Error Responses

All endpoints follow standard error response format:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

