# Weighsoft UI v1 - System Documentation

## Overview

Weighsoft UI is a web-based weighbridge management application built with **AngularJS 1.4.8**. It provides a complete solution for managing weighing operations, including weighbridge configuration, transaction processing, and reporting.

**Current Version:** 0.10.24

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | AngularJS 1.4.8 |
| Routing | UI Router |
| API Client | Restangular |
| UI Framework | Bootstrap 4.5.0 |
| Tables | DataTables |
| Date/Time | Moment.js |
| Notifications | Toastr, SweetAlert |
| Build | Docker (Alpine + Nginx) |

## Quick Start

### Prerequisites
- Node.js
- Yarn

### Installation

```bash
# Install dependencies
yarn install

# Configure environment
cp app/js/env.example.js app/js/env.js
# Edit env.js to set your backend API URL
```

### Environment Configuration

Edit `app/js/env.js`:

```javascript
window.__env = {
    base: "http://localhost:8000",  // Backend API URL
    logo: "assets/images/logos/logo.png"
};
```

### Build & Deploy

```bash
# Build Docker image
./build.bat  # Windows
./build.sh   # Linux/Mac
```

## Project Structure

```
Weighsoft.ui.v1/
├── app/
│   ├── js/
│   │   ├── app.js              # Main module definition
│   │   ├── routes.js           # Route/state definitions
│   │   ├── controllers.js      # Base controllers
│   │   ├── controllers/        # Feature controllers
│   │   ├── services.js         # Services
│   │   ├── factory.js          # Factories
│   │   ├── directives.js       # Base directives
│   │   ├── directives/         # Feature directives
│   │   ├── filters.js          # Filters
│   │   ├── constants.js        # Constants (ASSETS)
│   │   └── env.js              # Environment config
│   └── tpls/                   # HTML templates
│       ├── layout/             # Layout templates
│       ├── weighing/           # Weighing templates
│       ├── companies/          # Company templates
│       └── [feature]/          # Feature templates
├── assets/                     # Static assets
├── docker/                     # Docker config
├── docs/                       # Documentation
├── Dockerfile
├── package.json
└── index.html
```

## Core Modules

The application uses multiple AngularJS modules:

| Module | Purpose |
|--------|---------|
| `xenon-app` | Main application module |
| `xenon.controllers` | All controllers |
| `xenon.services` | All services |
| `xenon.factory` | All factories |
| `xenon.directives` | All directives |

## Features

### Setup Management
- **Companies** - Multi-company support
- **Sites** - Physical locations
- **Workstations** - Weighing stations
- **Weighbridges** - Scale configuration
- **Cameras** - Camera integration

### Weighing Operations
- **First Weight** - Initial weighing
- **Second Weight** - Return weighing
- **Verify** - Transaction verification
- **Reprint** - Ticket reprinting

### Master Data
- **Business Partners** - Customers/Suppliers
- **Products** - Material types
- **Hauliers** - Transport companies
- **RFID Vehicles** - Vehicle tracking
- **Contracts** - Purchase/Sale agreements
- **Pallets** - Pallet management
- **Tares** - Stored tare weights

### Reporting
- **Transactions** - Transaction history
- **Exceptions** - Exception reporting
- **Reporting Centre** - Analytics

### User Management
- **Users** - User accounts
- **User Types** - Role-based permissions

## API Integration

All API calls use Restangular. The base URL is configured in `env.js`.

### Example API Patterns

```javascript
// GET list
Restangular.all('company').getList(params);

// GET single
Restangular.one('company', id).get();

// POST create
Restangular.all('company').post(data);

// PUT update
Restangular.one('company').customPUT(data, id);

// DELETE
Restangular.one('company', id).remove();
```

## Authentication

- Token-based authentication via Satellizer
- Tokens stored in localStorage
- Automatic logout on 401 responses
- Token attached to all API requests

## Hardware Integration

### Weighbridge Communication
- WebSocket connection to scale service
- Real-time weight readings
- Configurable serial port parameters

### ESP32 Control
- Boom gate control
- Traffic light control
- Relay-based switching via backend proxy

### Cameras
- IP camera integration
- Snapshot capture during weighing

## See Also

- [Architecture Guide](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Development Guide](./DEVELOPMENT.md)
