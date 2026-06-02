# CRITICAL WARNINGS — Backend — Never Assume These Wrong

> Single-block reference for any agent or developer touching `Weighsoft.back.v1`.
> Every item here has caused or will cause silent bugs if assumed incorrectly.

---

## Framework

**This is Laravel 8 with PHP 8.3 — NOT Laravel 9+.**
Never suggest PHP 8.4+ features, enum types without approval, or Laravel 9+ syntax.
Always use: `JwtAuthController` (never `Controller` for protected routes), `UUID_TO_BIN`/`BIN_TO_UUID` (never direct UUID comparison), `routes/api.php` (never `app/Http/routes.php`), `DB::transaction` for multi-step writes.

---

## `JwtAuthController` — the `return response()` in the constructor does nothing

```php
// app/Http/Controllers/JwtAuthController.php
protected function __construct() {
    $this->middleware('auth:api');
    try {
        $this->user = auth()->user();
        if (!$this->user) {
            return response('Not Found', 404);  // PHP IGNORES constructor return values
        }
    } catch (Exception $e) {
        return response('Token Error', 401);    // PHP IGNORES constructor return values
    }
}
```

**PHP constructors cannot return values.** Those `return response(...)` lines are silently discarded. Auth is enforced solely by `$this->middleware('auth:api')` — which is the Laravel middleware registered on the controller. If the middleware passes but `auth()->user()` is still null (edge case), `$this->user` is unset and child controllers will throw on first access. **Do not add "auth fallback" logic in the constructor — it will not run.**

---

## Never extend `Controller` for protected endpoints — always `JwtAuthController`

```php
// WRONG — no JWT verification
class MyController extends Controller { ... }

// CORRECT
class MyController extends JwtAuthController {
    public function __construct() {
        parent::__construct();  // REQUIRED — registers auth:api middleware
        $this->model = new MyModel();
    }
}
```

Missing `parent::__construct()` silently skips JWT registration. The three controllers that intentionally do NOT extend `JwtAuthController`: `AuthController` (handles login), `XeroCallbackController` (OAuth callback — by design), `TimeAndDateController` (see critical warning below).

---

## `TimeAndDateController` — unauthenticated shell execution

```php
// app/Http/Controllers/TimeAndDateController.php — extends Controller, no auth
public function set(Request $request): JsonResponse {
    $data = $request->all();
    $correctValue = round($data[0] / 1000);
    $dt = new DateTime("@$correctValue");
    $input = "date -s '$newDate'";
    $output2 = shell_exec($input);
}
```

`POST /api/timeAndDate` is **unauthenticated**. The only guard is a host check (`localhost`/`127.0.0.1` is blocked). Any caller on the same network can trigger OS `shell_exec`. **Do not add further shell commands to this controller.** If auth is ever added, it must be `auth:api` middleware, not the constructor guard pattern.

---

## `ReportingController` — dynamic SQL built from filter data

```php
// app/Http/Controllers/ReportingController.php
error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);   // line 5 — suppresses all notices/warnings
...
$this->SQLQuery .= " haulier_id = '$data->Haulier' and ";  // string interpolation into SQL
...
DB::select(DB::raw($this->SQLQuery), array());   // no bound parameters for the dynamic portion
```

Two problems:
1. `error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING)` at the top of the file hides bugs throughout the class.
2. Filter values from saved `jsondata` report definitions are **interpolated directly into SQL** — no parameterisation for the dynamic portion. Tampering with saved report data is an injection path.

**Never add new filter/column logic to `ReportingController` using string interpolation. Use bound parameters.**

---

## `UserController::update` — plaintext password window

```php
// app/Http/Controllers/UserController.php ~174
$user->update($request->all());                   // persists plaintext password from request
$pass = $user->password;
$user->password = $user->password == "" ? $pass : Hash::make($user->password);
$user->update();
```

The first `update()` writes the raw password to the DB. The second `update()` (with hash) overwrites it. If anything throws between the two calls the plaintext password is live in the database. **Any change to the user update flow must hash before the first write.**

---

## `UserController::update` — `role_id` is fillable on user update

`User` model `$fillable` includes `role_id`. `update($request->all())` will set `role_id` to whatever the client sends. There is no check that the calling user has permission to change another user's role. **Always strip `role_id` from the update payload unless the caller has an admin role.**

---

## UUIDs are BINARY(16) — never use direct comparison

```php
// WRONG — always returns empty
$header = weighingHeaders::where('id', $id)->first();

// CORRECT
$header = weighingHeaders::whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])->first();

// CORRECT — selecting back as string
->first(["weighingheaders.*", DB::raw("BIN_TO_UUID(id, TRUE) as id2")]);
$header['id'] = $header['id2'];
unset($header['id2']);
```

Note the binding is `[$id]` (array) — not `$id` (string). `WeighingHeadersController` ~line 620 passes `$id` as a string; line 680 correctly uses `[$id]`. **Always pass an array for bindings.**

---

## `ContractTransactionService::getOne` — broken SQL (period instead of comma)

```php
// app/Services/ContractTransactionService.php ~56
->first(["contract_transactions.*",
    DB::raw("UUID_TO_BIN(id, TRUE) as id2. UUID_TO_BIN(weighing_header_id, TRUE) as weighing_header_id2")
]);
```

Three bugs in one line:
1. Period (`.`) between aliases instead of a comma — invalid SQL.
2. Should be `BIN_TO_UUID` to convert binary → readable string, not `UUID_TO_BIN` (binary → binary).
3. Binding for `whereRaw` should be `[$id]` (array). **Do not call this method and expect correct UUID output until fixed.**

---

## `DB::raw` with string interpolation — injection risk

```php
// app/Services/XeroInvoiceService.php ~38
'weighing_header_id' => DB::raw("UUID_TO_BIN('{$weighingHeaderId}', TRUE)"),
```

`$weighingHeaderId` is interpolated directly into the SQL fragment. In this specific case the value originates from an internal service call, but the pattern is unsafe. **Always use parameterised form or validate UUIDs with a regex before interpolation.** UUID format: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`.

---

## `ESP32RelayController` — hardcoded credentials + SSRF surface

```php
// app/Http/Controllers/ESP32RelayController.php ~23
private const ESP32_USERNAME = 'admin';
private const ESP32_PASSWORD = 'admin';
```

The controller accepts an IP address from the authenticated request and makes outbound HTTP calls to it using these credentials. Any authenticated WeighSoft user can instruct the backend to send `admin:admin` auth to any IP on the internal network. **Do not expand this controller's IP acceptance without network-level allowlisting.**

---

## Route–controller mismatches (routes that will 500 at runtime)

```php
// routes/api.php
Route::post('register', [AuthController::class, 'register']);         // method does not exist
Route::get('refresh',   [AuthController::class, 'refreshToken']);     // method does not exist (exists as 'refresh')
Route::resource('authenticate', 'AuthController', ['only' => ['welcome']]); // method does not exist
```

Calling any of these routes throws a `BadMethodCallException`. **Never rely on `register`, `refreshToken`, or `welcome` on `AuthController`.**

---

## `empty()` on Eloquent Collections always returns `false`

```php
// app/Http/Controllers/SettingsController.php ~45
$data = $query->get();
if (empty($data)) { ... }  // BUG: Collection object is never "empty" to PHP
```

`empty($collection)` is always `false` because an object is truthy even when it has no items. Use `$data->isEmpty()`. This affects any controller that guards on `empty()` after a `->get()` call.

---

## `empty()` swallows `0` — do not use on numeric fields

```php
empty(0)   // true  — would incorrectly treat zero weight/price as "missing"
empty("")  // true
empty(null)// true
isset(0)   // true  — correct
```

Use `!== null` for nullable numerics. Only use `empty()` when `0` and `""` are genuinely invalid values (like a required string field).

---

## `->first()` is used more widely than `->firstOrFail()` — silences missing rows

Throughout `WeighingHeadersController`, `XeroController`, `XeroSyncService`, many service methods use `->first()` and proceed without null checks. A missing row returns `null`; subsequent property access (`$result->id`) throws a PHP error that may not propagate clearly. **Any new query on a single expected row should use `->firstOrFail()` or an explicit null guard.**

---

## Soft deletes — `withTrashed()` is almost never used in `app/`

`weighingHeaders`, `Company`, `ContractTransactions` and others use `SoftDeletes`. Queries without `withTrashed()` silently exclude deleted rows. Foreign key lookups against soft-deleted parents return null. **When debugging "record not found" issues, always check if the record was soft-deleted.**

---

## CORS is fully open and applied twice

```php
// config/cors.php
'allowed_origins' => ['*'],
'supports_credentials' => false,
```

There is also `app/Http/Middleware/Cors.php` that sets `Access-Control-Allow-Origin: *` on every response, registered globally in `app/Http/Kernel.php`. Two separate CORS mechanisms are both active. `credentials: false` is intentional (token in header, not cookie). **Do not enable `supports_credentials: true` while `allowed_origins` is `*` — browsers block that combination.**

---

## `app/Models/test.php` exists in production autoload

```php
// app/Models/test.php
class test extends Model {
    use HasFactory;
}
```

An empty `test` model is autoloaded into the production application. It maps to a `tests` table (Eloquent convention). This is dead code but is part of the classmap. **Never use `test` as a model name; remove this file if safe.**

---

## Transactions — gaps in multi-step writes

`DB::transaction()` is confirmed in `WeighingHeadersController` (~line 516) and `XeroInvoiceStatusService`. The Xero sync flow (`XeroSyncService::syncItems`) and contract + weighing updates in several controllers run **without transaction wrapping**. If any step fails mid-way, partial writes persist. **Any new multi-model write must be wrapped in `DB::transaction()`.**

---

## AS400 export — file path from settings

```php
// app/Http/Controllers/WeighingHeadersController.php ~645
file_put_contents($settings["export_AS400"], $as400 . "\r\n", FILE_APPEND | LOCK_EX);
```

`export_AS400` is a path value stored in the `settings` table, which is writable via the settings API. If an attacker can write to settings, they control the file path. **Validate this path against an allowlist or a fixed directory prefix before writing.**

---

## `UserController::store` — exception swallowed silently

```php
// app/Http/Controllers/UserController.php ~103
} catch (Exception $e) {
    // Log::error($e->getMessage());   // commented out
}
```

On user creation failure, the exception is silently swallowed, the log call is commented out, and the function may return `null` (no response). **Never comment out the Log call; always return a 500 response in catch blocks.**
