# Task 25: Debug a Known Issue and Document the Root Cause

**AI usage:** Used AI as a debugging rubber duck — talked through what the error meant and what could cause it. Did not ask AI to just give me the answer, worked through it myself and used AI to confirm my thinking.

---

## Issue 1 — GradeController::index() returning wrong company names

### How I found it

While reviewing the controllers for Task 11, I noticed the `index()` method in `GradeController` was building a company lookup dictionary but the grades were always showing the wrong company name. I traced through the code manually to figure out why.

### The error

No crash — it was a silent logic bug. Every grade was either showing `null` for its company name or showing the wrong company entirely.

### What I did

I read through the method step by step and talked it through out loud (rubber duck style, with AI listening). I described what each line was doing and something felt off about the lookup — it was looking up `$grade->id` in the company dictionary instead of `$grade->company_id`.

```php
// ❌ Bug — looking up by the grade's own id, not its company_id
foreach ($grades as $grade) {
    $company = $companyDict[$grade->id];
}
```

The dictionary is keyed by company id. So `$companyDict[$grade->id]` is looking up a company using the grade's primary key — which is a completely different number. It would sometimes accidentally find a company (if a company happened to have the same id as a grade) or return null.

### Second bug in the same method

While looking at this I also noticed the grades collection was being called with `->toArray()` before `->get()`:

```php
// ❌ Bug — $grades is still a query builder here, not a collection
$grades = $this->model;
...
->whereIn('id', array_unique(array_map(
    fn($item) => $item->company_id,
    $grades->toArray()   // calling toArray() on a builder returns empty
)))
```

Calling `->toArray()` on an Eloquent query builder object doesn't execute the query — it just returns an empty array representation of the builder itself. So the `whereIn` was always getting an empty array, meaning the company lookup was fetching nothing.

### Root cause

Two separate bugs introduced at the same time:
1. The wrong key was used in the dictionary lookup (`$grade->id` instead of `$grade->company_id`)
2. `->get()` was never called before `->toArray()` so the grades collection was always empty when building the company lookup

### Fix

```php
// ✅ Call ->get() first to execute the query
$grades = $this->model->get();

// ✅ Look up by company_id, not grade id
foreach ($grades as $grade) {
    $company = $companyDict[$grade->company_id] ?? null;
}
```

### What I learned

Reading code line by line and asking "what does this variable actually contain at this point" is the most effective debugging approach. The rubber duck helped because explaining it out loud forced me to be precise about what each variable was — and that's when I noticed `$grades` was still a builder object, not a collection.

---

## Issue 2 — Migration failing with foreign key constraint error on rfid_vehicles

### How I found it

When running `php artisan migrate:fresh` during setup, the migration kept failing with this error:

```
SQLSTATE[HY000]: General error: 1005 Can't create table `weighsoft`.`rfid_vehicles`
(errno: 150 "Foreign key constraint is incorrectly formed")
(SQL: alter table `rfid_vehicles` add constraint `rfid_vehicles_haulier_id_foreign`
foreign key (`haulier_id`) references `hauliers` (`id`) on delete set null)
```

### What I did

I looked at the error message carefully. "Foreign key constraint is incorrectly formed" with errno 150 in MySQL almost always means a type mismatch — the foreign key column and the primary key it references are different data types.

I checked the `hauliers` table migration:

```php
// hauliers table — id is auto-incremented bigInteger
$table->id(); // this creates an unsignedBigInteger
```

Then checked the `rfid_vehicles` migration that was adding the foreign key:

```php
// ❌ rfid_vehicles — haulier_id declared as unsignedInteger (not BigInteger)
$table->unsignedInteger('haulier_id')->nullable();
$table->foreign('haulier_id')->references('id')->on('hauliers');
```

There it was. `hauliers.id` is `unsignedBigInteger` (which is what `$table->id()` creates in Laravel) but `rfid_vehicles.haulier_id` was declared as `unsignedInteger`. MySQL is strict about this — both sides of a foreign key relationship must be exactly the same type.

### Root cause

The developer who wrote the migration used `unsignedInteger` instead of `unsignedBigInteger` for the foreign key column. This is a common mistake in Laravel because `$table->id()` creates a `bigInteger` under the hood, but it's not obvious unless you know to check.

### Fix

```php
// ✅ Match the type of hauliers.id exactly
$table->unsignedBigInteger('haulier_id')->nullable();
$table->foreign('haulier_id')->references('id')->on('hauliers')->onDelete('set null');
```

### What I learned

MySQL errno 150 always means type mismatch on a foreign key. When I see that error in future I'll go straight to comparing the column types on both sides of the relationship. I also learned that Laravel's `$table->id()` shorthand creates a `bigInteger`, so any foreign key referencing it must use `unsignedBigInteger`, not `unsignedInteger`.

---

## Issue 3 — Migrations running in the wrong order

### How I found it

The very first run of `php artisan migrate` failed on the `contracts` table:

```
SQLSTATE[HY000]: General error: 1005 Can't create table `weighsoft`.`contracts`
(errno: 150 "Foreign key constraint is incorrectly formed")
(SQL: alter table `contracts` add constraint `contracts_product_id_foreign`
foreign key (`product_id`) references `products` (`id`) on delete cascade)
```

### What I did

The `contracts` table has a foreign key to `products`. I checked the migration filenames — Laravel runs migrations in alphabetical/timestamp order:

```
2024_10_07_123495_create_contracts_table.php     ← runs first
2024_10_07_123501_create_products_table.php      ← runs after
```

The `contracts` migration was numbered `123495` and `products` was `123501`. Contracts was trying to reference a `products` table that hadn't been created yet.

### Root cause

The migrations were written and numbered out of dependency order. The developer created the `contracts` migration before the `products` migration but didn't account for the fact that contracts has a foreign key dependency on products.

### Fix

Renamed the contracts migration file to run after products:

```powershell
Rename-Item 2024_10_07_123495_create_contracts_table.php 2024_10_07_123503_create_contracts_table.php
```

### What I learned

In Laravel, migration order is determined entirely by the filename timestamp prefix. If table A has a foreign key to table B, table B's migration filename must come first alphabetically. When you have circular or complex dependencies it's worth drawing out the dependency order before numbering your migrations.

---

## Summary

| Bug | File | Type | How found |
|---|---|---|---|
| Wrong dictionary key `$grade->id` | GradeController.php | Logic bug | Manual code review |
| `toArray()` before `get()` | GradeController.php | Logic bug | Manual code review |
| `unsignedInteger` vs `unsignedBigInteger` | rfid_vehicles migration | Type mismatch | MySQL errno 150 error message |
| Migration ordering | contracts migration | Dependency order | MySQL foreign key error on migrate |

All four bugs were in the existing codebase, not in code I wrote. They were discovered during environment setup and the Task 11 code review.
