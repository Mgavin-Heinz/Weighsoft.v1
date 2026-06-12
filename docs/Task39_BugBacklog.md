# Task 39: Bug and Improvement Backlog

**AI usage:** AI used to convert raw observations into structured tickets. Priorities set manually.

---

## Bugs found during testing and development

---

### BUG-001 — Migration ordering: contracts table before products table
**Severity:** High  
**Status:** Fixed (Task 25)  
**File:** `database/migrations/2024_10_07_123495_create_contracts_table.php`  
**Description:** The `contracts` migration ran before `products`, causing a foreign key failure on `php artisan migrate`. The contracts table references `products.id` but products hadn't been created yet.  
**Fix:** Renamed migration file to `123503` so it runs after products (`123501`).

---

### BUG-002 — GradeController: wrong dictionary key in index()
**Severity:** High  
**Status:** Fixed (Task 11)  
**File:** `app/Http/Controllers/GradeController.php`  
**Description:** Company lookup used `$grade->id` as the dictionary key instead of `$grade->company_id`. Every grade displayed the wrong company name or null.  
**Fix:** Changed lookup to `$companyDict[$grade->company_id] ?? null`.

---

### BUG-003 — GradeController: toArray() called before get()
**Severity:** High  
**Status:** Fixed (Task 11)  
**File:** `app/Http/Controllers/GradeController.php`  
**Description:** `$grades->toArray()` was called on a query builder instance before executing the query with `->get()`. This returned an empty array, so the company lookup never populated any companies.  
**Fix:** Changed to `$this->model->get()` before calling `->toArray()`.

---

### BUG-004 — rfid_vehicles migration: type mismatch on foreign key
**Severity:** High  
**Status:** Fixed (Task 25)  
**File:** `database/migrations/2025_12_18_000004_add_smart_hauliers_to_rfid_vehicles.php`  
**Description:** `haulier_id` declared as `unsignedInteger` but `hauliers.id` is `unsignedBigInteger`. MySQL rejected the foreign key with errno 150.  
**Fix:** Changed column type to `unsignedBigInteger`.

---

### BUG-005 — contract_transactions: references non-existent table name
**Severity:** High  
**Status:** Fixed (Task 25)  
**File:** `database/migrations/2024_10_07_123496_create_contract_transactions_table.php`  
**Description:** Foreign key referenced `weighingheaders` but the actual table is `weighing_headers` (with underscore). Migration failed with errno 150.  
**Fix:** Updated table name reference and changed column type from `unsignedBigInteger` to `string` to match the string primary key in `weighing_headers`.

---

### BUG-006 — transactions migration: references non-existent currents table
**Severity:** Medium  
**Status:** Fixed (Task 25)  
**File:** `database/migrations/2024_10_07_123505_create_transactions_table.php`  
**Description:** Foreign key referenced a `currents` table that does not exist anywhere in the codebase. The table was never created.  
**Fix:** Removed the foreign key constraint; `current_id` stored as a plain nullable integer.

---

### BUG-007 — users migration: references non-existent roles table
**Severity:** Medium  
**Status:** Fixed (Task 25)  
**File:** `database/migrations/2024_10_07_123508_create_users_table.php`  
**Description:** Foreign key on `role_id` referenced a `roles` table that was never created. Roles are stored as integer IDs with no lookup table.  
**Fix:** Removed foreign key constraint; `role_id` stored as plain nullable integer.

---

### BUG-008 — HaulierController/GradeController/ProductController: update() parameter order
**Severity:** Medium  
**Status:** Fixed (Task 11)  
**File:** Multiple controllers  
**Description:** `update($id, Request $request)` — parameters in wrong order. Laravel resource routing expects `update(Request $request, int $id)`.  
**Fix:** Swapped parameter order in all three controllers.

---

### BUG-009 — PalletController: deleteWithReason() uses wrong variable name
**Severity:** Low  
**Status:** Open — identified in Task 26 PR review  
**File:** `app/Http/Controllers/PalletController.php`  
**Description:** Variable named `$contract` inside `PalletController::deleteWithReason()`. Copy-paste error from another controller.  
**Fix:** Rename `$contract` to `$pallet`.

---

### BUG-010 — PalletController: deleteWithReason() unsafe array access
**Severity:** Medium  
**Status:** Open — identified in Task 26 PR review  
**File:** `app/Http/Controllers/PalletController.php`  
**Description:** `$request->all()['reason']` throws `Undefined index` if `reason` is not in the request body. No validation before access.  
**Fix:** Add `$request->validate(['reason' => 'required|string|max:255'])` before accessing the field.

---

## Improvements identified

---

### IMPROVEMENT-001 — Add indexes to foreign key columns
**Priority:** Medium  
**File:** Multiple migration files  
**Description:** Several foreign key columns (e.g. `company_id`, `site_id` on `hauliers`, `products`) don't have database indexes. On a production database with thousands of records, queries filtering by these columns will be slow.  
**Suggestion:** Add `$table->index('company_id')` to all frequently queried foreign key columns.

---

### IMPROVEMENT-002 — Standardise destroy() response across all controllers
**Priority:** Low  
**File:** `SiteController.php`  
**Description:** SiteController returns `['status' => true]` on delete while all other controllers return the deleted object. Inconsistent for API consumers.  
**Suggestion:** Update SiteController::destroy() to return the deleted object.

---

### IMPROVEMENT-003 — Add request validation to remaining controllers
**Priority:** Medium  
**File:** PalletController, SiteController  
**Description:** These two controllers still use `$request->all()` without validation. Identified in Task 11 but not fixed in that task's scope.  
**Suggestion:** Add `$request->validate([...])` to store() and update() in both controllers, following the pattern established for HaulierController.

---

### IMPROVEMENT-004 — Mobile: Step 2 (Readings) not implemented
**Priority:** High  
**File:** `Weighsoft.mobile.v1/src/WizardProgress.tsx`  
**Description:** The CertificateWizard currently shows a placeholder for Steps 2, 3, and 4. Only Step 1 (Details) is fully implemented.  
**Suggestion:** Implement the Readings screen to capture gross, tare, and reference weight readings from the operator.
