# API Reference

## Base Configuration

The API base URL is configured in `app/js/env.js`:

```javascript
window.__env = {
    base: "http://localhost:8000"
};
```

All endpoints are prefixed with `/api/`.

## Authentication

### Login
```
POST /api/authenticate
Body: { email, password }
Response: { token, user }
```

Token is stored in localStorage and attached to all subsequent requests.

## Core Endpoints

### Companies
```
GET    /api/company              # List all
GET    /api/company/:id          # Get one
POST   /api/company              # Create
PUT    /api/company/:id          # Update
DELETE /api/company/:id          # Delete
```

### Sites
```
GET    /api/site                 # List all
GET    /api/site/:id             # Get one
POST   /api/site                 # Create
PUT    /api/site/:id             # Update
```

### Workstations
```
GET    /api/workstation          # List all
GET    /api/workstation/:id      # Get one
POST   /api/point                # Create (legacy)
PUT    /api/point/:id            # Update (legacy)
```

### Weighbridges
```
GET    /api/weighbridge          # List all
GET    /api/weighbridge/:id      # Get one
POST   /api/weighbridge          # Create
PUT    /api/weighbridge/:id      # Update
```

### Cameras
```
GET    /api/camera               # List all
GET    /api/camera/:id           # Get one
POST   /api/camera               # Create
PUT    /api/camera/:id           # Update
```

## Master Data Endpoints

### Business Partners
```
GET    /api/businesspartner      # List all
GET    /api/businesspartner/:id  # Get one
POST   /api/businesspartner      # Create
PUT    /api/businesspartner/:id  # Update
```

### Products
```
GET    /api/product              # List all
GET    /api/product/:id          # Get one
POST   /api/product              # Create
PUT    /api/product/:id          # Update
```

### Hauliers
```
GET    /api/haulier              # List all
GET    /api/haulier/:id          # Get one
POST   /api/haulier              # Create
PUT    /api/haulier/:id          # Update
```

### RFID Vehicles
```
GET    /api/rfidvehicle          # List all
POST   /api/rfidvehicle          # Create
PUT    /api/rfidvehicle/:id      # Update
```

## Weighing Endpoints

### Weighing Operations
```
GET    /api/weighingAdd          # Get weighing form data
GET    /api/weighingLoad         # Load first weight data
GET    /api/secondWeightLoad     # Load second weight data
POST   /api/weighing             # Create transaction
PUT    /api/weighing/:id         # Update transaction
```

### Weigh Settings
```
GET    /api/settings             # List weigh types
GET    /api/settings/:id         # Get one
POST   /api/settings             # Create
PUT    /api/settings/:id         # Update
```

### Reprint
```
GET    /api/weighing_headers     # List transactions
GET    /api/weighing_headers/:id # Get transaction
PUT    /api/weighing_headers/:id # Update transaction
```

## Operations Endpoints

### Contracts
```
GET    /api/contract             # List all
GET    /api/contract/:id         # Get one
POST   /api/contract             # Create
PUT    /api/contract/:id         # Update
```

### Pallets
```
GET    /api/pallets              # List all
GET    /api/pallets/:id          # Get one
POST   /api/pallets              # Create
PUT    /api/pallets/:id          # Update
```

### Tares (Stored Tares)
```
GET    /api/tares                # List all
GET    /api/tares/:id            # Get one
POST   /api/tares                # Create
PUT    /api/tares/:id            # Update
```

## Reporting Endpoints

### Transactions
```
GET    /api/transaction          # List transactions
```

### Exceptions
```
GET    /api/exceptions           # List exceptions
POST   /api/exceptions           # Log exception
```

### Reporting
```
GET    /api/reporting            # Get reports
```

## User Management

### Users
```
GET    /api/user                 # List all
GET    /api/user/:id             # Get one
POST   /api/user                 # Create
PUT    /api/user/:id             # Update
```

### User Profile
```
GET    /api/userprofile/:id      # Get profile with companies
```

### User Types (Roles)
```
GET    /api/usertype             # List all
GET    /api/usertype/:id         # Get one
POST   /api/usertype             # Create
PUT    /api/usertype/:id         # Update
```

## Hardware Control

### ESP32 Relay Control
```
POST   /api/esp32/relay
Body: { ip, relay_number, state }

GET    /api/esp32/relay?ip=...   # Get relay states
```

## Query Parameters

Most list endpoints accept these parameters:

| Parameter | Description |
|-----------|-------------|
| company_id | Filter by company |
| site_id | Filter by site |
| workstation_id | Filter by workstation |

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Token Invalid |
| 404 | Not Found |
| 500 | Server Error |

Error response format:
```json
{
    "error": "error_code",
    "message": "Human readable message"
}
```
