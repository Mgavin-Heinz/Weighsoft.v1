# Weighsoft System Overview

## Introduction

Weighsoft is a comprehensive weighbridge management system designed for managing vehicle weighing operations, transactions, and reporting across multiple companies, sites, and workstations. The system handles complex weighing workflows including first weight, second weight (tare), multi-axle weighing, contract management, invoicing, and automated reporting.

## System Architecture

Weighsoft consists of three main components:

1. **Backend API** (`Weighsoft.back.v1`) - Laravel 8 REST API
2. **Frontend UI** (`Weighsoft.ui.v1`) - AngularJS 1.4.8 Single Page Application
3. **Scale Integration Service** - External service for weighbridge hardware communication

## Core Functionality

### 1. Weighing Operations
- **First Weight**: Initial vehicle weight capture
- **Second Weight (Tare)**: Empty vehicle weight for net weight calculation
- **Multi-Axle Weighing**: Support for up to 6 axles with individual weight tracking
- **Status Management**: OPEN, VERIFY, CLOSED states
- **Transaction Numbering**: Auto-generated transaction numbers with configurable prefixes

### 2. Configuration & Settings
- **Settings Profiles**: Highly configurable weighing profiles per company
- **Custom Fields**: Up to 20 user-defined custom fields per setting
- **Weighing Types**: Single weight, two-weight (in/out), multi-axle
- **Feature Toggles**: 
  - Number plate recognition (1-3 plates)
  - Business partner management
  - Product lists
  - Stored tares
  - Moisture deduction
  - Handling charges
  - Pallet charges
  - Contract management
  - Invoice generation
  - Camera integration
  - Silo verification

### 3. Master Data Management
- **Companies**: Multi-tenant company management
- **Sites**: Physical locations within companies
- **Workstations**: Individual weighing stations
- **Weighbridges**: Physical scale hardware
- **Products**: Product catalog
- **Grades**: Product quality grades
- **Business Partners**: Customer/supplier management
- **Hauliers**: Transport company management
- **Pallets**: Pallet type and charge management
- **Tares**: Stored tare weight management
- **Users**: User accounts with role-based permissions
- **User Types**: Permission groups

### 4. Contract Management
- Contract creation with expiry dates
- Contract amount tracking
- Automatic contract transaction linking
- Contract status monitoring (promised, delivered, remaining)
- Product and business partner associations

### 5. Transaction Management
- Transaction history with full audit trail
- Soft delete support
- User tracking (first weight, second weight, verify, delete users)
- Exception logging
- Reprint functionality
- Edit/update capabilities

### 6. Reporting & Analytics
- Custom report definitions
- Scheduled email reports (CSV attachments)
- Transaction filtering and export
- Multi-setting report aggregation
- Date range reporting

### 7. Integration Points
- **Scale Hardware**: WebSocket and HTTP integration for real-time weight capture
- **Cameras**: IP camera integration for image capture during weighing
- **RFID**: Vehicle RFID tag support
- **Fingerprint**: Biometric authentication support
- **Number Plate Recognition**: Automated vehicle identification
- **AS/400 Export**: Legacy system integration support

### 8. Print & Documentation
- **Weighing Tickets**: Printable weighing tickets with configurable headers/footers
- **Invoices**: Invoice generation with line items
- **Custom Branding**: Company logos and custom images
- **Camera Images**: Optional camera images on tickets

## Technology Stack

### Backend
- **Framework**: Laravel 8.40
- **PHP**: 8.3
- **Database**: MySQL with UUID support (BINARY(16))
- **Authentication**: JWT (tymon/jwt-auth)
- **API Documentation**: Swagger/OpenAPI (darkaonline/l5-swagger)
- **Deployment**: Docker with Nginx + PHP-FPM

### Frontend
- **Framework**: AngularJS 1.4.8
- **Routing**: UI Router
- **HTTP Client**: Restangular
- **UI Framework**: Bootstrap 4.5.0
- **Tables**: DataTables
- **Date Handling**: Moment.js
- **Notifications**: Toastr
- **Lazy Loading**: oc.lazyLoad
- **Deployment**: Docker with Nginx

## Data Flow

### Weighing Workflow

1. **User Selection**: Company → Site → Workstation → Weighbridge
2. **Setting Selection**: Choose weighing configuration profile
3. **Data Entry**: 
   - Vehicle registration (manual or automatic)
   - Business partner selection
   - Product selection
   - Custom field entry
4. **First Weight Capture**: 
   - Real-time scale integration
   - Camera capture (optional)
   - Transaction creation
5. **Status Determination**:
   - If silo verification enabled → VERIFY status
   - If two-weight required → OPEN status
   - Otherwise → CLOSED status
6. **Second Weight** (if applicable):
   - Tare weight capture
   - Net weight calculation
   - Status → CLOSED
7. **Verification** (if required):
   - Manual verification step
   - Status → CLOSED
8. **Completion**:
   - Ticket printing
   - Contract transaction linking (if applicable)
   - Invoice generation (if enabled)

## Key Features

### Multi-Tenancy
- Complete data isolation per company
- Site-level and workstation-level filtering
- User permissions scoped to companies/sites

### Flexibility
- 20 custom fields per setting
- Configurable weighing types
- Multiple number plate support
- Flexible transaction numbering

### Audit Trail
- User tracking for all operations
- Soft deletes for data recovery
- Exception logging
- Full transaction history

### Integration Ready
- RESTful API design
- WebSocket support for real-time data
- Camera integration
- External system export capabilities

## System Statuses

### Weighing Header Statuses
- **OPEN**: First weight captured, awaiting second weight
- **VERIFY**: Requires manual verification (silo operations)
- **CLOSED**: Transaction complete
- **DELETED**: Soft deleted (recoverable)

### Transaction Statuses
- Tracked per weighing transaction
- Links to weighing header status

## Security

- JWT-based authentication
- Role-based access control
- API endpoint protection
- User permission management
- Secure password handling

## Scalability

- Multi-company support
- Multi-site deployment
- Workstation-level isolation
- Efficient UUID-based primary keys
- Optimized database queries with proper indexing

## Future Considerations

- Modern framework migration path
- Enhanced reporting capabilities
- Mobile application support
- Real-time dashboard
- Advanced analytics

