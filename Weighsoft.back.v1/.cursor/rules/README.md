# Cursor Rules for Weighsoft Backend

This directory contains comprehensive rules for the Weighsoft Backend Laravel application. These rules help AI assistants understand the codebase architecture, patterns, and conventions to ensure consistent, maintainable code.

## Rule Files Overview

### 01-architecture.mdc
**Always Applied** - Core architecture and technology stack
- Framework version (Laravel 8, PHP 8.3)
- Project structure
- Authentication architecture
- UUID pattern
- Service layer pattern
- Critical architecture rules

### 02-controller-patterns.mdc
**Applies to**: Controllers in `app/Http/Controllers/`
- Controller base classes (JwtAuthController)
- Standard CRUD patterns
- Request validation
- Response patterns
- Database transactions
- Logging

### 03-models-database.mdc
**Applies to**: Models and migrations
- Model structure
- UUID handling (CRITICAL)
- Soft deletes
- Relationships
- Mass assignment
- Query patterns
- Raw SQL with UUIDs

### 04-services.mdc
**Applies to**: Services in `app/Services/`
- Service layer patterns
- Complex business logic
- Dependency injection
- Service responsibilities
- Error handling in services

### 05-routing-api.mdc
**Applies to**: Route files
- API route patterns
- Resource routes
- Custom routes
- Route naming conventions
- Route organization

### 06-authentication.mdc
**Applies to**: Controllers and middleware
- JWT authentication
- JwtAuthController pattern
- User access control
- Role-based authorization
- User properties

### 07-common-pitfalls.mdc
**Always Applied** - Common mistakes to avoid
- Framework confusion warnings
- UUID handling mistakes
- Controller mistakes
- Service mistakes
- Database mistakes
- Critical rules summary

### 08-adding-new-features.mdc
**Manual Application** - Step-by-step guide
- Complete workflow for adding features
- Code templates
- Checklists
- Common patterns reference

### 09-version-control-commits.mdc
**Always Applied** - Version management and commit workflow
- Version update process
- Commit message format
- Version file locations
- Workflow checklist

## How Rules Work

### Rule Types

1. **Always Apply**: Rules that are always included in context
   - Architecture rules
   - Common pitfalls
   - Version control and commits

2. **Apply Intelligently**: Rules that apply based on file patterns
   - Controller patterns (for Controllers)
   - Models/database (for Models and migrations)
   - Services (for Services)
   - Routing (for route files)
   - Authentication (for Controllers and middleware)

3. **Apply Manually**: Rules you reference with @
   - Adding new features guide

### Using These Rules

When working with the codebase:

1. **For new features**: Reference `@08-adding-new-features.mdc`
2. **For controllers**: Rules automatically apply when editing Controllers
3. **For models**: Rules automatically apply when editing Models
4. **For services**: Rules automatically apply when editing Services
5. **For routes**: Rules automatically apply when editing route files

## Key Principles

1. **This is Laravel 8** - NOT Laravel 9+
2. **Always extend JwtAuthController** - For authenticated endpoints
3. **Always use UUID functions** - `UUID_TO_BIN()` / `BIN_TO_UUID()`
4. **Always validate requests** - Use Validator facade
5. **Always use Services** - For complex business logic
6. **Always use transactions** - For multi-step operations
7. **Always return JSON** - With proper status codes
8. **Use routes/api.php** - Not app/Http/routes.php
9. **Always update versions and commit** - Every change requires version bump and commit

## Quick Reference

### Controller Template
```php
class MyController extends JwtAuthController
{
    private Model $model;

    public function __construct() {
        parent::__construct();
        $this->model = new Model();
    }

    public function index(): JsonResponse
    {
        // Implementation
    }
}
```

### UUID Query Template
```php
$item = Model::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
    ->first(["table.*", DB::raw("BIN_TO_UUID(id, TRUE) as id2")]);

if (!empty($item)) {
    $item['id'] = $item['id2'];
    unset($item['id2']);
}
```

### Service Template
```php
class MyService
{
    public function getItems($filters): array
    {
        // Complex query
        return [$data, $count];
    }
}
```

## For New Developers

1. Read `01-architecture.mdc` to understand the project structure
2. Read `02-controller-patterns.mdc` to understand controller patterns
3. Read `03-models-database.mdc` to understand UUID handling (CRITICAL)
4. Read `07-common-pitfalls.mdc` to avoid common mistakes
5. Use `08-adding-new-features.mdc` as a step-by-step guide
6. Reference other rules as needed when working on specific areas

## Critical Warnings

1. **UUID Handling**: ALWAYS use `UUID_TO_BIN()` / `BIN_TO_UUID()` - never compare UUIDs directly
2. **Authentication**: ALWAYS extend `JwtAuthController` and call `parent::__construct()`
3. **Framework**: This is Laravel 8 - do not use Laravel 9+ features
4. **Routes**: Use `routes/api.php` - not `app/Http/routes.php`

## Maintenance

These rules should be updated when:
- New patterns are established
- Architecture changes
- Common mistakes are identified
- New conventions are adopted

Keep rules focused, actionable, and under 500 lines each. Split large rules into multiple files if needed.

