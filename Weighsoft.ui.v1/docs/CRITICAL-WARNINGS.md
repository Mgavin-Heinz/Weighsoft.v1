# CRITICAL WARNINGS — Never Assume These Wrong

> Single-block reference for any agent or developer touching this codebase.
> Every item here has caused or will cause silent bugs if assumed incorrectly.

---

## Framework

**This is AngularJS 1.4.8 — NOT Angular 2+.**
Never suggest TypeScript, `import/export`, `HttpClient`, RxJS, or Angular CLI.
Always use: `Restangular` (never `$http`), `$state.go` (never `window.location`), `controller as vm` (never `$scope` for data), `appHelper.templatePath()` (never hardcoded paths).

---

## `goods_type` — "1" means RECEIVED, not dispatched

```
goods_type === "1"  →  Received Goods  →  show purchase_price
goods_type !== "1"  →  Dispatched      →  show sale_price
```

- The value is a **string** `"1"`, not a number. Always use `=== "1"`.
- The default in the settings object is `"Received Goods"` (a string label), but the DB/API stores `"1"` for received and other values for dispatched.
- This pattern is used identically in: `weighing_create.js`, `weighing_update.js`, `reprint_print.js`, `TicketPdfService.php`, `XeroInvoiceService.php`.

---

## Zero is a valid price — never use falsy checks on prices

```javascript
// WRONG — hides a legitimate $0.00 price
if (product.sale_price) { ... }
vm.ReportData.productPrice = product.sale_price || null;

// CORRECT
var parsed = parseFloat(product.sale_price);
vm.ReportData.productPrice = isNaN(parsed) ? null : parsed;

// CORRECT in template
ng-if="reportData.productPrice != null"   // NOT ng-if="reportData.productPrice"
```

Same rule applies to any numeric field: weight, moisture, VAT, charges.

---

## `parseFloat(x) || 0` silences bad data

```javascript
vm.Single.FirstWeight = parseFloat(vm.Single.FirstWeight) || 0;
```

`parseFloat(undefined)` → `NaN` → `NaN || 0` → `0`. Bad API data becomes silent zero weight. Only use `|| 0` when zero is genuinely the right fallback and you do not need to detect missing data.

---

## `reprint_edit.js` has NO ticket printing

`reprint_edit.html` contains zero `<ticket-print>` directives. It is a form editor only. The controller that prints reprints is **`reprint_print.js`** / **`reprint_print.html`**. Never add price, label, or receipt logic to `reprint_edit.js` expecting it to appear on a receipt.

---

## `ticketPrint` directive does NO data work — it only switches templates

```javascript
if (scope.setting.ticket_template === 'thermal') {
    return appHelper.templatePath("print/receipt.tpl");
}
return appHelper.templatePath("print/ticket.tpl");
```

The directive passes data through unchanged. Any new field on a receipt must be populated in the **parent controller's `vm.ReportData`**. The directive never needs changing for data features.

---

## `buildProductInvoice` exists in THREE controllers independently

`weighing_create.js` (~line 956), `weighing_update.js` (~line 874), `reprint_print.js` (~line 680) each have their own copy with different signatures and data sources. A change to invoice calculation logic must be applied in **all three** separately.

---

## `$navigation.get()` — not `$stateParams` — for API calls

`$rootScope.Params` (managed by `$navigation`) is what Restangular uses as default request params (company/site/workstation scope). `$stateParams` holds URL params but may not match `$rootScope.Params` on deep-link navigation. Always use `$navigation.get()` as the source of truth for scoping API calls.

---

## `$rootScope.Param` (no `s`) typo in `factory.js` line 415

```javascript
// BUG — should be $rootScope.Params
localStorage.setItem("location", JSON.stringify($rootScope.Param));
```

`$rootScope.Param` is undefined. `JSON.stringify(undefined)` returns `undefined` (not a string). localStorage coerces it to `"undefined"`. Force-clear navigation does not persist correctly. **Do not fix without testing the full navigation reset flow.**

---

## `window.__end` typo in `env.js` line 2

```javascript
window.__env = window.__end || {};  // bug: __end not __env
```

`window.__end` is never defined so it is always `{}`. External `window.__env` injection (e.g. from a host page or container) **does not work** — `env.js` always reinitialises it from scratch. Do not rely on injecting env vars from outside.

---

## `localStorage.clear()` wipes ALL keys, not just `user_info`

```javascript
MyLocalStorage.clear('user_info');  // argument is IGNORED
// Internally: localStorage.clear()  — clears everything
```

On logout, every localStorage key is wiped: navigation state, scale preferences, everything. Do not store session-critical data in localStorage expecting it to survive logout.

---

## `ng-hide` is visibility only — it is NOT a security control

Controls hidden with `ng-hide` remain in the DOM and are clickable after removing the class via DevTools. Role and permission enforcement lives entirely in the **API**. Never use `ng-hide` as the sole guard on a destructive action.

---

## Fingerprint verification is client-side UI only

The fingerprint match in `reprint_print.js` (lines 801–868) sets `vm.ScannedUser` in-browser by comparing strings. No server call validates the fingerprint. `vm.save()` does not pass fingerprint proof to the API. The gate is UI-only.

---

## `preservedSelections` — must not be bypassed on save

`weighing_update.js` and `weighing_create.js` snapshot all selected values (`angular.copy`) into `vm.preservedSelections` immediately before the save API call. `SetReportingData` uses this snapshot — not the live `vm.selected_*` values — to build the receipt. Bypassing or clearing this snapshot before the API callback will produce a receipt with wrong data.

---

## WebSocket: `stopWebSocket` ≠ `closeWebSocket`

`vm.stopWebSocket` — pauses, socket object kept, can be restarted.
`vm.closeWebSocket` — permanent close, must be called on successful save, cancel, and `$destroy`.
Using `stop` where `close` is needed leaves the socket allocated and prevents reconnection on next weighing.

---

## `$scope.System = vm` is intentional — do not remove it

```javascript
var vm = this;
$scope.System = vm;
```

`controller as System` in the template already exposes `vm` as `System`. The `$scope.System = vm` assignment is kept so that child directives accessing `$scope` directly, `$broadcast`/`$emit` handlers, and nested watcher callbacks all reference the same object. Removing it breaks directive integration.

---

## UUIDs in the backend are BINARY(16) — never compare directly

Always use `UUID_TO_BIN(?, TRUE)` in WHERE clauses and `BIN_TO_UUID(id, TRUE) as id2` in SELECT. Never pass a UUID string to `where('id', $uuid)` or Eloquent `find($uuid)`.

---

## Backend extends `JwtAuthController` — never `Controller`

Every authenticated API controller must:
```php
class MyController extends JwtAuthController {
    public function __construct() {
        parent::__construct();  // REQUIRED
        $this->model = new MyModel();
    }
}
```
Missing `parent::__construct()` silently skips JWT verification.
