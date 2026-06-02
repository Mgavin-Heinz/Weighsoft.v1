# Weighsoft System Overview

## What is Weighsoft?

Weighsoft is a comprehensive **weighbridge management system** designed to automate and streamline the process of weighing vehicles, recording transactions, and managing related business operations at weighbridge sites.

## System Purpose

The system is used to:
- **Record vehicle weights** at weighbridge sites (entry and exit weights)
- **Calculate net weights** (gross weight minus tare weight)
- **Manage business partners** (suppliers, customers)
- **Track contracts** and deliveries against contracts
- **Generate tickets and reports** for compliance and business tracking
- **Control physical devices** (booms, traffic lights, cameras)
- **Export data** to external systems (AS/400)

## Core Use Cases

### 1. **Incoming Goods (Receiving)**
A supplier delivers goods (e.g., grain, materials) to your site:
- Vehicle enters, gets weighed (full)
- Vehicle unloads goods
- Vehicle exits, gets weighed (empty)
- System calculates net weight of delivered goods

### 2. **Outgoing Goods (Dispatching)**
Your company dispatches goods to a customer:
- Vehicle enters empty, gets weighed
- Vehicle loads goods
- Vehicle exits full, gets weighed
- System calculates net weight of dispatched goods

### 3. **Single Weighing**
Quick weighing without entry/exit:
- Vehicle drives onto scale
- Single weight recorded
- Immediate ticket printed

## System Architecture

### Technology Stack

**Backend:**
- Laravel 8 (PHP 8.3)
- MySQL database with UUID support
- JWT authentication
- RESTful API

**Frontend:**
- AngularJS 1.4.8
- Bootstrap 4.5.0
- DataTables for grids
- UI Router for navigation

**Integration:**
- WebSocket for real-time scale readings
- ESP32 devices for boom/light control
- Camera integration for vehicle photos
- AS/400 export capability

## Key Components

### Organizational Hierarchy
```
Company (Top level organization)
  └── Site (Physical location with weighbridge)
      └── Workstation (Operator station)
          └── Weighbridge (Physical scale)
              └── Cameras (Optional photo capture)
```

### Master Data
- **Business Partners** - Customers and suppliers
- **Products** - Items being weighed (grain, materials, etc.)
- **Hauliers** - Transport companies
- **Contracts** - Agreements for delivery/collection
- **Settings (Weigh Types)** - Configuration templates for different weighing scenarios

### Transactional Data
- **Weighing Headers** - Main weighing record
- **Weighing Transactions** - Individual weight readings (1st weight, 2nd weight)
- **Contract Transactions** - Links weighings to contracts

## Current Version

- **Frontend Version**: 0.10.3
- **Backend Version**: 0.10.3
- **Connector Version**: 0.10.3

## Deployment

The system is typically deployed as:
- **Backend API** - Serves data and business logic
- **Frontend Web App** - User interface for operators
- **Scale Connector** - Middleware service that reads from physical scales
- **Database** - MySQL server

## Next Steps

Refer to the following documentation files:
- `01-USER-ROLES.md` - User types and permissions
- `02-BUSINESS-WORKFLOWS.md` - Detailed process flows
- `03-REPORTS.md` - Available reports and data exports
- `04-UI-REQUIREMENTS.md` - User interface specifications
- `05-INTEGRATIONS.md` - External system connections
- `06-DATA-MODEL.md` - Database structure and relationships

