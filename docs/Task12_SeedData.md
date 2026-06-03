# Task 12: Database Seed Data for Demo Companies and Users

**Codebase:** `Weighsoft.back.v1` (Laravel 8)  
**AI usage:** AI used to generate realistic but fictional South African company data; all field names manually verified against migrations before use.

---

## What I did

Created four Laravel seeder classes covering the full set of entities needed for a working demo environment. Used three fictional South African companies that represent different industries the app serves: mining, construction aggregates, and grain farming.

---

## Demo Companies

| Code | Company | Industry | City |
|------|---------|----------|------|
| IVM | Ironveld Mining (Pty) Ltd | Mining | Johannesburg |
| CAG | Coastal Aggregates (Pty) Ltd | Construction materials | Durban |
| HGC | Highveld Grain Co-operative Ltd | Agriculture | Klerksdorp |

---

## Files Created

| File | Location | Purpose |
|------|----------|---------|
| `CompanySeeder.php` | `database/seeders/` | 3 demo companies |
| `SiteSeeder.php` | `database/seeders/` | 1 site per company (weighbridge or silo) |
| `UserSeeder.php` | `database/seeders/` | 7 users: 1 super admin + 2 per company |
| `ProductAndHaulierSeeder.php` | `database/seeders/` | 3 products + 2 hauliers per company |
| `DatabaseSeeder.php` | `database/seeders/` | Master seeder — calls all in correct order |

---

## User Roles Seeded

| Email | Role | Company |
|-------|------|---------|
| admin@weighsoft.demo | Super Admin | (all companies) |
| thabo.nkosi@ironveld.demo | Company Admin | Ironveld Mining |
| sipho.dlamini@ironveld.demo | Operator | Ironveld Mining |
| priya.naidoo@coastalagg.demo | Company Admin | Coastal Aggregates |
| ravi.pillay@coastalagg.demo | Operator | Coastal Aggregates |
| johan.vdm@highveldgrain.demo | Company Admin | Highveld Grain |
| amahle.zulu@highveldgrain.demo | Operator | Highveld Grain |

**Demo password for all users:** `Password1!`

---

## How to Run

```bash
# From Weighsoft.back.v1/
php artisan db:seed
```

Or run individual seeders:

```bash
php artisan db:seed --class=CompanySeeder
php artisan db:seed --class=SiteSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=ProductAndHaulierSeeder
```

> **Important:** always run in this order — Companies → Sites → Users → Products & Hauliers. Each seeder looks up IDs from the previous one by code rather than hardcoding numeric IDs, so the order matters but the IDs don't.

---

## Design Decisions

- Used `insertOrIgnore()` on all seeders so running them twice does not throw duplicate key errors.
- IDs are never hardcoded — each seeder looks up parent records by a stable `code` field so it works regardless of what IDs the database assigns.
- All emails use `.demo` domain to make it impossible to accidentally email real people.
- Passwords are hashed with `Hash::make()` — never stored in plain text.
- Grain products have VAT 0% (agricultural exemption in South Africa); mining and aggregates have 15%.
