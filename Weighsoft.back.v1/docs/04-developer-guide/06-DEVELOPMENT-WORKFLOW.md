# Development Workflow

## Overview

This document outlines the development workflow, coding standards, and best practices for the Weighsoft system.

## Development Environment Setup

### Prerequisites

- PHP 8.3
- Composer
- MySQL 5.7+
- Node.js and Yarn (for frontend)
- Docker (optional)

### Backend Setup

1. **Clone Repository:**
```bash
git clone [repository-url] Weighsoft.back.v1
cd Weighsoft.back.v1
```

2. **Install Dependencies:**
```bash
composer install
```

3. **Configure Environment:**
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

4. **Configure Database:**
```env
DB_HOST=127.0.0.1
DB_DATABASE=weighsoft
DB_USERNAME=root
DB_PASSWORD=password
```

5. **Run Migrations:**
```bash
php artisan migrate
```

6. **Seed Database (optional):**
```bash
php artisan db:seed
```

7. **Start Development Server:**
```bash
php artisan serve
```

### Frontend Setup

1. **Clone Repository:**
```bash
git clone [repository-url] Weighsoft.ui.v1
cd Weighsoft.ui.v1
```

2. **Install Dependencies:**
```bash
yarn install
# or
npm install
```

3. **Configure Environment:**
```bash
cp app/js/env.example.js app/js/env.js
```

4. **Update API URL:**
```javascript
window.__env.base = "http://localhost:8000";
```

5. **Serve Application:**
```bash
# Using simple HTTP server
python -m http.server 8080
# or
npx http-server -p 8080
```

## Coding Standards

### PHP/Laravel Standards

**PSR Standards:**
- PSR-1: Basic Coding Standard
- PSR-2: Coding Style Guide
- PSR-4: Autoloading Standard
- PSR-12: Extended Coding Style

**Laravel Conventions:**
- Use Eloquent models
- Follow Laravel naming conventions
- Use service layer for complex logic
- Validate all inputs

### JavaScript/AngularJS Standards

**Code Style:**
- Use `'use strict'` in all files
- Use `controller as` syntax
- Use `const` and `let` (no `var`)
- Consistent indentation (2 spaces)

**Naming Conventions:**
- Controllers: PascalCase with `Ctrl` suffix
- Variables: camelCase
- Files: lowercase with underscores
- Routes: lowercase with underscores

## Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Development branch

**Feature Branches:**
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/issue-name` - Critical fixes

### Commit Messages

**Format:**
```
type(scope): subject

body

footer
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Maintenance tasks

**Examples:**
```
feat(weighing): add moisture deduction calculation

fix(auth): resolve JWT token expiration issue

docs(api): update API documentation
```

### Pull Request Process

1. **Create Feature Branch:**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes:**
- Write code
- Add tests
- Update documentation

3. **Commit Changes:**
```bash
git add .
git commit -m "feat(scope): description"
```

4. **Push Branch:**
```bash
git push origin feature/new-feature
```

5. **Create Pull Request:**
- Fill out PR template
- Request review
- Address feedback

6. **Merge:**
- After approval
- Squash and merge
- Delete branch

## Development Process

### Adding New Features

1. **Plan Feature:**
   - Define requirements
   - Design database schema
   - Plan API endpoints
   - Design UI components

2. **Create Database Migration:**
```bash
php artisan make:migration create_feature_table
```

3. **Create Model:**
```bash
php artisan make:model Feature
```

4. **Create Controller:**
```bash
php artisan make:controller FeatureController
```

5. **Create Service (if needed):**
```bash
# Manual creation in app/Services/
```

6. **Define Routes:**
```php
// routes/api.php
Route::resource('feature', 'FeatureController');
```

7. **Implement Backend:**
   - Controller methods
   - Service logic
   - Validation
   - Error handling

8. **Create Frontend:**
   - Controller
   - Template
   - Route definition
   - API integration

9. **Test:**
   - Unit tests
   - Integration tests
   - Manual testing

10. **Document:**
    - Update API docs
    - Update user docs
    - Code comments

### Bug Fix Process

1. **Identify Bug:**
   - Reproduce issue
   - Document steps
   - Identify root cause

2. **Create Bugfix Branch:**
```bash
git checkout -b bugfix/bug-description
```

3. **Fix Bug:**
   - Implement fix
   - Add tests
   - Verify fix

4. **Test:**
   - Test fix
   - Regression testing
   - Edge cases

5. **Commit and PR:**
   - Commit fix
   - Create PR
   - Get review
   - Merge

## Testing

### Backend Testing

**Unit Tests:**
```bash
php artisan test
```

**Feature Tests:**
```php
public function test_create_weighing_header()
{
    $response = $this->postJson('/api/weighingheaders', [
        'company_id' => 1,
        'site_id' => 1,
        // ...
    ]);
    
    $response->assertStatus(200);
}
```

### Frontend Testing

**Manual Testing:**
- Test in browser
- Test different scenarios
- Test error cases

**Integration Testing:**
- Test API integration
- Test user workflows
- Test error handling

## Code Review

### Review Checklist

**Backend:**
- [ ] Follows Laravel conventions
- [ ] Uses service layer for complex logic
- [ ] Validates all inputs
- [ ] Handles errors properly
- [ ] Uses UUID functions correctly
- [ ] Extends JwtAuthController
- [ ] Includes tests
- [ ] Updates documentation

**Frontend:**
- [ ] Uses `controller as` syntax
- [ ] Uses Restangular for API calls
- [ ] Handles errors properly
- [ ] Uses `$rootScope` loading states
- [ ] Follows naming conventions
- [ ] Includes error handling
- [ ] Updates documentation

### Review Process

1. **Submit PR:**
   - Fill out PR template
   - Link related issues
   - Add reviewers

2. **Review:**
   - Code review
   - Test review
   - Documentation review

3. **Address Feedback:**
   - Make changes
   - Respond to comments
   - Update PR

4. **Approve and Merge:**
   - Get approval
   - Merge PR
   - Delete branch

## Documentation

### Code Documentation

**PHP DocBlocks:**
```php
/**
 * Create a new weighing header.
 *
 * @param array $data Weighing header data
 * @return weighingHeaders
 * @throws Exception
 */
public function insertWeighingHeader($data)
{
    // ...
}
```

**JavaScript Comments:**
```javascript
/**
 * Load companies for the current user.
 * @returns {Promise} Promise resolving to company list
 */
vm.loadCompanies = function() {
    // ...
};
```

### API Documentation

**Swagger Annotations:**
```php
/**
 * @OA\Post(
 *     path="/api/weighingheaders",
 *     summary="Create weighing header",
 *     tags={"Weighing"},
 *     @OA\RequestBody(...),
 *     @OA\Response(...)
 * )
 */
```

### User Documentation

- Feature documentation
- User guides
- API documentation
- Deployment guides

## Debugging

### Backend Debugging

**Enable Debug Mode:**
```env
APP_DEBUG=true
APP_ENV=local
```

**View Logs:**
```bash
tail -f storage/logs/laravel.log
```

**Debug Tools:**
- Laravel Debugbar
- Xdebug
- Log statements

### Frontend Debugging

**Browser DevTools:**
- Console for errors
- Network tab for API calls
- Application tab for storage

**Debug Statements:**
```javascript
console.log('Debug:', vm.data);
```

**AngularJS Debugging:**
- Batarang extension
- $log service
- Breakpoints

## Performance Optimization

### Backend Optimization

- Database query optimization
- Eager loading relationships
- Caching frequently accessed data
- Index optimization

### Frontend Optimization

- Lazy loading assets
- Minification
- Image optimization
- Code splitting

## Security

### Security Checklist

- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Authentication/Authorization
- [ ] Secure password storage
- [ ] HTTPS in production
- [ ] Secure headers

### Security Practices

- Never commit secrets
- Use environment variables
- Regular security updates
- Security audits
- Penetration testing

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment configured
- [ ] Database migrations ready
- [ ] Backup current version

### Deployment Steps

1. **Merge to Main:**
```bash
git checkout main
git merge develop
```

2. **Tag Release:**
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

3. **Deploy:**
   - Build Docker images
   - Run migrations
   - Deploy containers
   - Verify deployment

4. **Post-Deployment:**
   - Verify functionality
   - Monitor logs
   - Check performance
   - Update documentation

## Maintenance

### Regular Tasks

- Update dependencies
- Security patches
- Database optimization
- Log rotation
- Backup verification

### Monitoring

- Application logs
- Error tracking
- Performance metrics
- User feedback

## Resources

### Documentation

- Laravel Documentation: https://laravel.com/docs/8.x
- AngularJS Documentation: https://docs.angularjs.org
- UI Router: https://ui-router.github.io
- Restangular: https://github.com/mgonto/restangular

### Tools

- PHPStorm / VS Code
- Postman for API testing
- MySQL Workbench
- Git
- Docker

