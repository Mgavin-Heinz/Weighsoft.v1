# Weighsoft Backend Architecture

## Overview

The Weighsoft backend is built on Laravel 8.40 with PHP 8.3, providing a RESTful API for the AngularJS frontend. The system uses MySQL with custom UUID functions for primary key management.

## Project Structure

```
app/
  Console/
    Commands/          # Artisan commands (e.g., SendReports)
  Exceptions/
    Handler.php        # Global exception handler
  Http/
    Controllers/       # All API controllers
      AuthController.php
      JwtAuthController.php  # Base controller for authenticated endpoints
      WeighingHeadersController.php
      [Other controllers...]
    Middleware/        # Custom middleware
    routes.php         # Legacy routes (deprecated)
  Mail/
    Report.php         # Email report mailable
  Models/              # Eloquent models
    weighingHeaders.php
    settings.php
    [Other models...]
  Providers/           # Service providers
  Services/            # Business logic services
    WeighingHeaderService.php
    WeighingTransactionService.php
    ContractTransactionService.php
    WeighingCameraService.php
    ReportEmailer.php
database/
  migrations/          # Database migrations
  seeders/            # Database seeders
routes/
  api.php             # API routes (PRIMARY)
  web.php             # Web routes
  channels.php        # Broadcast channels
  console.php         # Console routes
config/               # Configuration files
  jwt.php             # JWT configuration
  database.php        # Database configuration
```

## Core Architecture Patterns

### 1. Controller Pattern

All authenticated controllers extend `JwtAuthController`:

```php
class WeighingHeadersController extends JwtAuthController
{
    public function __construct() {
        parent::__construct();  // REQUIRED - sets up authentication
        $this->model = new weighingHeaders();
    }
}
```

**Key Points:**
- `JwtAuthController` provides `$this->user` (authenticated user)
- All API endpoints (except `/api/login`) require authentication
- Controllers delegate complex logic to Services

### 2. Service Layer Pattern

Complex business logic is encapsulated in Services:

```php
class WeighingHeaderService
{
    public function insertWeighingHeader($data) {
        // Complex business logic here
        // Database operations
        // Data transformations
    }
}
```

**Service Responsibilities:**
- Complex database queries
- Business rule enforcement
- Data transformations
- Transaction management

**Service Location:** `app/Services/`

### 3. Model Pattern

Models use Eloquent ORM with custom UUID handling:

```php
class weighingHeaders extends Model
{
    use SoftDeletes;
    
    protected $table = 'weighingheaders';
    protected $keyType = "string";
    public $incrementing = false;
}
```

**Key Features:**
- Soft deletes for data recovery
- UUID primary keys (stored as BINARY(16) in DB)
- Fillable properties for mass assignment protection

### 4. UUID Pattern

**CRITICAL**: UUIDs are stored as `BINARY(16)` in MySQL but returned as strings in API.

**Database Functions:**
- `UUID_TO_BIN(uuid, TRUE)` - Convert string UUID to BINARY(16)
- `BIN_TO_UUID(binary_uuid, TRUE)` - Convert BINARY(16) to string UUID

**Usage Pattern:**
```php
// Querying
$weighingHeader = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])->first();

// Selecting with conversion
$result = DB::select("
    SELECT 
        BIN_TO_UUID(id, TRUE) as id,
        ...
    FROM weighingheaders
    WHERE id = UUID_TO_BIN(?, TRUE)
", [$id]);
```

## Authentication Architecture

### JWT Authentication Flow

1. **Login** (`POST /api/login`):
   - Validates credentials
   - Generates JWT token
   - Returns user data with token

2. **Protected Endpoints**:
   - All endpoints except `/api/login` require JWT token
   - Token sent in `Authorization: Bearer {token}` header
   - `JwtAuthController` validates token and sets `$this->user`

3. **Token Refresh** (`POST /api/auth/refresh`):
   - Allows token renewal without re-login

### Authentication Middleware

- `auth:api` middleware applied to all routes except login
- Token validation via `tymon/jwt-auth`
- Automatic user injection into controllers

## Database Architecture

### UUID Storage

- Primary keys use UUIDs stored as `BINARY(16)`
- Custom MySQL functions handle conversion
- Migration creates functions: `UUID_TO_BIN()` and `BIN_TO_UUID()`

### Soft Deletes

Many models use `SoftDeletes` trait:
- Records marked as deleted with `deleted_at` timestamp
- Not returned in normal queries
- Can be recovered using `withTrashed()` or `onlyTrashed()`

### Relationships

**Key Relationships:**
- `weighingHeaders` → `weighingTransactions` (one-to-many)
- `weighingHeaders` → `contractTransactions` (one-to-one)
- `weighingHeaders` → `weighingCameras` (via transactions)
- `Contracts` → `ContractTransactions` (one-to-many)
- `Company` → `Sites` → `Workstations` (hierarchical)

## API Architecture

### RESTful Design

- Standard HTTP methods: GET, POST, PUT, DELETE
- Resource-based URLs: `/api/weighingheaders`, `/api/settings`
- JSON request/response format
- Consistent error responses

### Response Patterns

**Success Response:**
```json
{
  "id": "uuid-string",
  "data": "..."
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed message"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Service Layer Details

### WeighingHeaderService

**Responsibilities:**
- Create weighing headers
- Calculate net weights
- Handle status transitions
- Manage transaction numbering
- Link related entities

**Key Methods:**
- `insertWeighingHeader($data)` - Create new weighing
- `getWeighingHeaders(...)` - Query with filters
- `updateWeighingHeader($id, $data)` - Update existing

### WeighingTransactionService

**Responsibilities:**
- Create weighing transactions (axle weights)
- Link transactions to headers
- Handle multi-axle weight data

**Key Methods:**
- `createWeighingTransaction($data)` - Create transaction
- `deleteWeighingTransaction($id)` - Delete transaction

### ContractTransactionService

**Responsibilities:**
- Link weighing headers to contracts
- Track contract fulfillment
- Calculate contract amounts

**Key Methods:**
- `insertItem($data)` - Create contract transaction
- `getOne($id)` - Retrieve transaction
- `updateItem($id, $data)` - Update transaction

### WeighingCameraService

**Responsibilities:**
- Store camera images (base64)
- Link images to weighing transactions
- Retrieve images for display/printing

**Key Methods:**
- `insertWeighingCamera($data)` - Store image
- `getByWeighingTransaction($id)` - Get images for transaction

### ReportEmailer

**Responsibilities:**
- Generate scheduled reports
- Email reports as CSV attachments
- Handle multiple report types

**Key Methods:**
- `SendReportEmails($reportId)` - Process and send report
- `TransactionReport($start, $end, $report)` - Generate report data

## Transaction Management

### Database Transactions

Multi-step operations use database transactions:

```php
DB::transaction(function () use ($data) {
    $header = $this->headerService->insertWeighingHeader($data);
    $transaction = $this->transactionService->createWeighingTransaction($data);
    // If any step fails, all are rolled back
});
```

**Used For:**
- Creating weighing headers with transactions
- Updating related entities
- Contract transaction linking

## Error Handling

### Exception Handling

- Global exception handler in `app/Exceptions/Handler.php`
- Logging via Laravel's Log facade
- Consistent error response format

### Validation

- Request validation in controllers
- Returns 422 status with validation errors
- Custom validation rules where needed

## Configuration

### Environment Variables

Key environment variables:
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` - JWT signing key
- `MAIL_*` - Email configuration
- `APP_ENV` - Environment (local, production)

### Configuration Files

- `config/jwt.php` - JWT settings
- `config/database.php` - Database connections
- `config/mail.php` - Email settings

## Deployment Architecture

### Docker Setup

- **Base Image**: `nginx:1.19-alpine`
- **PHP**: PHP 8.3 with FPM
- **Web Server**: Nginx
- **Process Manager**: PHP-FPM

### Container Structure

```
/var/www/laravel/     # Application root
/etc/php8/            # PHP configuration
/etc/nginx/conf.d/    # Nginx configuration
/etc/crontabs/        # Cron jobs
```

### Process Management

- PHP-FPM runs as daemon
- Nginx serves as reverse proxy
- Cron jobs for scheduled tasks (reports)

## Security Considerations

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Token refresh mechanism

### Authorization
- Role-based access control
- User type permissions
- Company/site-level data isolation

### Data Protection
- Input validation
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF protection (where applicable)

## Performance Considerations

### Database Optimization
- Proper indexing on foreign keys
- Efficient UUID queries
- Soft delete optimization
- Query result pagination

### Caching
- Configuration caching
- Route caching
- Query result caching (where applicable)

## Logging

### Log Levels
- `Log::info()` - General information
- `Log::error()` - Error conditions
- `Log::debug()` - Debug information (when enabled)

### Log Locations
- Laravel log files: `storage/logs/laravel.log`
- Application-specific logging in services

## Testing Considerations

### Unit Tests
- Service layer testing
- Model testing
- Utility function testing

### Integration Tests
- API endpoint testing
- Authentication flow testing
- Database transaction testing

## Migration Strategy

### Database Migrations
- Version-controlled schema changes
- UUID function creation
- Table creation with proper indexes
- Data migration scripts

### Deployment Process
1. Run migrations
2. Seed initial data (if needed)
3. Generate JWT secret
4. Configure environment
5. Start services

