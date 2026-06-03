# Task 11: CRUD Consistency Review — Backend Controllers

**Codebase:** `Weighsoft.back.v1` (Laravel 8 / PHP 8.3)  
**Controllers reviewed:** HaulierController, ProductController, GradeController, PalletController, SiteController  
**AI usage:** AI used to identify duplication and inconsistencies; all findings manually verified against source code before fixes were applied.

---

## What I did

Read through the five most common resource controllers in the backend and compared how each one implements `index`, `store`, `show`, `update`, and `destroy`. Found five consistency issues — two of which are actual bugs that would cause incorrect behaviour at runtime.

Fixed `HaulierController`, `GradeController`, and `ProductController` and documented the standard that should apply going forward.

---

## Issues Found

### Issue 1 — `update()` parameter order is wrong (High)

Laravel's resource routing expects `update(Request $request, int $id)`. Three controllers reverse the order:

| Controller | Signature | Status |
|---|---|---|
| HaulierController | `update($id, Request $request)` | ❌ Wrong |
| GradeController | `update(int $id, Request $request)` | ❌ Wrong |
| ProductController | `update(int $id, Request $request)` | ❌ Wrong |
| PalletController | `update(Request $request, int $id)` | ✅ Correct |
| SiteController | `update(Request $request, int $id)` | ✅ Correct |

Laravel injects `Request` by type-hint so this doesn't always fail, but it is non-standard and will break when route–model binding is added.

**Fix:** swap to `(Request $request, int $id)` in all three controllers.

---

### Issue 2 — Direct `$_GET` access in `index()` (Medium)

Most `index()` methods read query parameters directly from `$_GET` instead of using Laravel's `Request` object:

```php
// ❌ Before — bypasses Laravel's request pipeline
if (isset($_GET) && isset($_GET['company_id'])) {
    $companyId = $_GET['company_id'];
}

// ✅ After — testable, uses middleware-processed input
$companyId = $request->query('company_id', '');
```

This bypasses Laravel's input sanitisation and makes the controllers untestable with Laravel's HTTP test helpers.

**Fix:** inject `Request $request` into `index()` and use `$request->query()`.

---

### Issue 3 — No input validation on `store()` or `update()` (High)

Every controller passes `$request->all()` directly into `create()` or `update()` with no validation. The model's `$fillable` array is the only protection.

```php
// ❌ Before
$haulier = $this->model->create($request->all());

// ✅ After
$data = $request->validate([
    'code'       => 'required|string|max:50',
    'name'       => 'required|string|max:100',
    'company_id' => 'required|integer|exists:companies,id',
    'site_id'    => 'required|integer|exists:sites,id',
]);
$haulier = $this->model->create($data);
```

**Fix:** add `$request->validate([...])` in `store()` and `update()`.

---

### Issue 4 — Two bugs in `GradeController::index()` (High)

**Bug A:** `toArray()` is called on the Eloquent builder instance before `get()`, so it returns an empty array and the company lookup always fails.

```php
// ❌ Before — $grades is a builder, not a collection yet
$grades = $this->model;
...
->whereIn('id', array_unique(array_map(fn($item) => $item->company_id, $grades->toArray())))

// ✅ After — call get() first, then toArray()
$grades = $this->model->get();
...
->whereIn('id', array_unique(array_map(fn($item) => $item->company_id, $grades->toArray())))
```

**Bug B:** The company dictionary lookup uses `$grade->id` instead of `$grade->company_id`, so every grade gets the wrong company name.

```php
// ❌ Before
$company = $companyDict[$grade->id];

// ✅ After
$company = $companyDict[$grade->company_id] ?? null;
```

---

### Issue 5 — Inconsistent `destroy()` response (Low)

Four controllers return the deleted object; `SiteController` returns a status flag. The API consumer can't predict the response shape.

**Fix:** standardise on returning the deleted object with HTTP 200.

---

## Summary

| Issue | Affected Controllers | Severity | Fixed? |
|---|---|---|---|
| `update()` param order wrong | Haulier, Grade, Product | High | ✅ Yes |
| Direct `$_GET` in `index()` | Haulier, Grade, Product, Pallet | Medium | ✅ Yes (Haulier, Grade, Product) |
| No validation on `store()`/`update()` | All 5 | High | ✅ Yes (Haulier, Grade, Product) |
| `toArray()` before `get()` bug | GradeController | High | ✅ Yes |
| Wrong dict key `$grade->id` bug | GradeController | High | ✅ Yes |
| Inconsistent `destroy()` response | SiteController | Low | ⬜ Not changed (out of scope) |

PalletController and SiteController were not changed — they already had the correct `update()` signature and the `$_GET` issue in those controllers is lower risk. SiteController's `destroy()` inconsistency is flagged but left for a separate task.

---

## Recommended Standard Going Forward

- `update()` signature: always `(Request $request, int $id)`
- `index()` filters: always `$request->query('param', '')`, never `$_GET`
- `store()` and `update()`: always call `$request->validate([...])` before touching the model
- `store()`: return HTTP 201 Created, not 200 OK
- `destroy()`: return the deleted object as JSON with HTTP 200
