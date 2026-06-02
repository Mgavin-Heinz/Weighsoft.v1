# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Weighsoft backend API — a Laravel 8 (PHP 8.3) application that backs a weighbridge / weighing-station system. JWT-authenticated REST API (`tymon/jwt-auth`) with Swagger docs via `darkaonline/l5-swagger`. Deployed as a Docker image (`weighsoftsa/weighsoft-backv1`) built for both `linux/amd64` and `linux/arm/v7` (on-site ARM devices).

## Common commands

```bash
# PHP / Laravel
composer install
php artisan migrate
php artisan serve
php artisan l5-swagger:generate       # regenerate Swagger docs

# Tests (PHPUnit)
vendor/bin/phpunit                    # run all
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --filter SomeTest  # single test

# Frontend assets (Laravel Mix)
npm run dev
npm run watch
npm run prod

# Docker image build/push (multi-arch, pushes to registry)
./build.sh         # linux — builds version from $version in script, pushes tags
build.bat          # windows equivalent
```

Versioning: bump the `version=` line in `build.sh` / `build.bat` when releasing (current: 0.10.5). Commit messages follow `[Fix|Feature] ... - Version X.Y.Z`.

## Architecture

Standard Laravel layout with a domain-specific twist around the **weighing workflow**:

- `app/Http/Controllers/` — one controller per resource; most routes in `routes/api.php` are `Route::resource(...)` pointing at these. Custom endpoints (e.g. `contract/{id}/delete`, `reportEmail`, `weighingLoad`, `secondWeightLoad`) are added alongside the resource routes.
- `app/Services/` — the core domain logic lives here, not in controllers. Key services:
  - `WeighingHeaderService` / `WeighingTransactionService` — the two-stage weigh-in/weigh-out flow (first weight → second weight completes the transaction).
  - `ContractTransactionService` — links weighings to contracts.
  - `WeighingCameraService` — captures camera images during a weighing (see also `cam_pic.php`, `npr.php` at repo root — legacy camera endpoints).
  - `ReportEmailer` — scheduled report delivery.
- `app/Models/` — Eloquent models. `Transactions` / `weighingHeaders` / `weighingTransactions` are the heart of the weighing data model; `Tare`, `Pallet`, `AxelSetups`, `AxelTypes` feed into weight calculations. `settings.php` holds the system config model (note the lower-case filename).
- `app/Console/Commands/` — `SendDailyEmail`, `SendReports`. Scheduled via cron inside the container (`docker-build/cronjobs`).
- `routes/api.php` — single flat route file, all API endpoints; resource routes use string controller names (Laravel 7-style), so route caching requires the full namespace in `RouteServiceProvider`.

### External integrations

- **AS400 export** — a settings-gated export block (`export_AS400` flag). Guard against null/empty before executing (see recent fix in 3addcfb).
- **Cameras** — image fetching over HTTP/IP with explicit cURL timeouts (3s connect / 5s total) to prevent hanging weighings when a camera is offline.
- **JWT Auth** — uses `dev-develop` of `tymon/jwt-auth`; `AuthController` and `JwtAuthController` coexist (legacy vs current).

### Database

- MySQL (InnoDB; see `D-SwitchToInnoDB.sql`). Laravel migrations live under `database/migrations/`, but `database_scripts/` holds hand-written upgrade SQL that is applied in sequence on existing deployments — `current.sql`, `old.sql`, `upgrade.sql` plus numbered/lettered migration steps. When changing schema for released sites, add a new script here *in addition to* any Laravel migration.
- Docker backup/bootstrap SQL: `docker/backup.sql`.

### Deployment

- Base image: `weighsoftsa/weighsoft-php-nginx-base` (built from `Dockerfile.base.sup`) — rarely rebuilt.
- App image: `Dockerfile.sup` — copies code, runs `composer install/update`, installs cron, launches via `supervisord`. Production env is hard-coded (`APP_ENV=production`, `APP_DEBUG=false`).
- CI: `azure-pipelines.yml` (Azure DevOps). Primary branch is `master`, active work on `QA`.

## Conventions worth knowing

- Controllers stay thin; put new logic in `app/Services/` and inject the service.
- Resource routes use string controller references; when adding new resources, match the existing `Route::resource('name', 'NameController')` style rather than the `[Controller::class, 'method']` form (except for non-RESTful custom endpoints, which do use the array form).
- SQL upgrade scripts in `database_scripts/` must be idempotent-friendly — they are run against live customer DBs of varying versions.
- Camera / external I/O must have explicit timeouts; do not rely on PHP defaults.
