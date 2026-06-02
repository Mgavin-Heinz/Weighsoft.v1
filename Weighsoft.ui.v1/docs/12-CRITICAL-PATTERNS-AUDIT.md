# Critical Patterns Audit

**Scope:** `app/` directory — `Weighsoft.ui.v1`  
**Date:** 2026-03-23  
**Type:** Architecture / Security Reference

> This document is a living reference. Every pattern listed here represents a non-obvious, risky, or architecturally critical piece of the codebase that a developer must understand before touching the affected files.

---

## Table of Contents

1. [Null / Falsy Semantics](#1-null--falsy-semantics)
2. [Dev Fakes, Stubs, and Environment Bypasses](#2-dev-fakes-stubs-and-environment-bypasses)
3. [Security Patterns and Bypasses](#3-security-patterns-and-bypasses)
4. [Architecture Notes and Gotchas](#4-architecture-notes-and-gotchas)
5. [High-Signal Locations Summary](#5-high-signal-locations-summary)

---

## 1. Null / Falsy Semantics

### 1.1 `parseFloat(...) || 0` — NaN silently becomes 0

**File:** `app/js/controllers/reprint_edit.js` lines 80–94

```javascript
vm.Single.FirstWeight  = parseFloat(vm.Single.FirstWeight)  || 0;
vm.Single.SecondWeight = parseFloat(vm.Single.SecondWeight) || 0;
vm.Single.moisture_deduction = parseFloat(vm.Single.moisture_deduction) || 0;
```

**Risk:** `parseFloat(undefined)` and `parseFloat(null)` both return `NaN`. `NaN || 0` returns `0`. If the API returns bad/missing weight data, the weight silently becomes zero rather than surfacing an error. A legitimate weight of `0.0000` is preserved correctly since `parseFloat("0")` is `0` which is falsy, but `0 || 0` is still `0` — so numerically safe, but genuinely bad data is hidden.

**Rule:** Use `isNaN(parseFloat(x)) ? null : parseFloat(x)` when a missing value must be distinguished from zero.

---

### 1.2 `|| 0` on weight in broadcast

**File:** `app/js/controllers/weighing_update.js` line ~781

```javascript
vm.Single.weight || vm.Single.SecondWeight || 0
```

**Risk:** If `SecondWeight` is a valid `0`, the chain falls through to the literal `0` anyway — functionally harmless here, but the pattern is fragile if the field order changes.

---

### 1.3 `|| "false"` / `|| "No"` string defaults for settings flags

**File:** `app/js/controllers/reprint_print.js` lines 457–484

```javascript
vm.Setting.enable_moisture         = vm.Setting.enable_moisture         || "false";
vm.Setting.enable_handling         = vm.Setting.enable_handling         || "false";
vm.Setting.pallet_enabled          = vm.Setting.pallet_enabled          || "false";
vm.Setting.use_cameras             = vm.Setting.use_cameras             || "false";
vm.Setting.numberplate_1           = vm.Setting.numberplate_1           || "No";
vm.Setting.ticket_header           = vm.Setting.ticket_header           || "false";
vm.Setting.use_product_list        = vm.Setting.use_product_list        || "false";
```

**Note:** Intentional defensive defaults — if the settings record doesn't include a key, features default to off. This is the established pattern across all controllers.

---

### 1.4 `!= null` (loose) vs `!== null` (strict)

**File:** `app/js/app.js` line 128

```javascript
message = message != null ? String(message) : "Request failed";
```

Loose `!= null` catches both `null` **and** `undefined` — intentional here. Use strict `!== null` only when you specifically want to allow `undefined` through.

**File:** `app/js/controllers/weighing_update.js` lines 1230–1237  
Mix of `== null` and `=== null` in validation. In AngularJS-era JS, `== null` is the conventional "null or undefined" check; `=== null` means literally null. Be consistent within a block — mixing can cause subtle bugs.

---

### 1.5 `0` used as an uninitialised sentinel

**File:** `app/js/controllers/weighing_update.js` line 132

```javascript
vm.selected_settings = 0;
```

Any code using `if (vm.selected_settings)` treats this as "not selected". This is intentional, but if settings ID `0` were ever valid, it would silently fail to select. Current IDs are auto-increment starting from 1.

---

### 1.6 Weight validation uses `== 0` correctly

**File:** `app/js/controllers/weighing_update.js` lines 1265–1278

```javascript
if (
    (typeof vm.Single.id !== "undefined" && typeof vm.Single.SecondWeight === "undefined") ||
    (typeof vm.Single.id !== "undefined" && vm.Single.SecondWeight == 0) ||
    (vm.Setting.type_of_weighing == "1" && vm.Single.SecondWeight == 0)
) {
    Error = Error + "Please enter the second weight.\n";
}
```

Explicit `== 0` means a zero weight triggers the "enter weight" error — correct for a scale application where `0` is not a valid weight.

---

### 1.7 `pallet_count` falsy bypass

**File:** `app/js/controllers/weighing_create.js` lines 519–526

```javascript
vm.Single.pallet_count ? parseFloat(vm.Single.pallet_count) : 0
```

A pallet count of `0` is treated as "no pallets" (falsy). For the pallet system this is semantically correct — zero pallets means disabled — but it is a gotcha if pallet count becomes nullable vs zero.

---

### 1.8 `$rootScope.MasterData` silent failure

**File:** `app/js/controllers/reprint_print.js` lines 674–677

If `$rootScope.MasterData` or `$rootScope.Params` is missing or stale, the site/company lookup silently falls through to a `decimals = 2` default. The receipt renders but may show wrong decimal/measure formatting with no error thrown.

---

### 1.9 `factory.js` `$Names` label silently wrong

**File:** `app/js/factory.js` lines 1570–1586  
`weighingLoad` overwrites `Setting.custom_header_text` / `custom_footer_text` from `$Names.SiteH` / `SiteF`, which depend on `$rootScope.Params`. If navigation set `Params` to the wrong site, header/footer labels will be wrong with no visible error.

---

## 2. Dev Fakes, Stubs, and Environment Bypasses

### 2.1 `env.js` typo — `window.__end` instead of `window.__env`

**File:** `app/js/env.js` line 1

```javascript
window.__env = window.__end || {};
```

**Bug:** Should be `window.__env || {}`. `window.__end` is never defined, so this is always `{}`. The subsequent lines then correctly set fields on the empty object. The net effect is that no external `window.__env` injection is possible — the local `env.js` always wins. This prevents environment overrides from a container/host page.

---

### 2.2 Hardcoded Pi hostname for scale WebSocket

**File:** `app/js/env.js` line 5

```javascript
window.__env.scale = `http://henzard-pi:3000`;
```

The scale connector endpoint is hardcoded to a specific hostname (`henzard-pi`). Any workstation without this hostname in DNS/hosts will fail to connect to the scale silently. This must be changed per deployment.

---

### 2.3 `$navigation.clear` typo — `Params` vs `Param`

**File:** `app/js/factory.js` line 415

```javascript
localStorage.setItem("location", JSON.stringify($rootScope.Param));
```

**Bug:** `$rootScope.Param` (no `s`) is undefined. `JSON.stringify(undefined)` returns `undefined` (not a string), and `localStorage.setItem` coerces that to the string `"undefined"`. So when `force = true` is called on `$navigation.clear`, the persisted location is broken. On next page load, `getItem("location")` returns `"undefined"`, which `JSON.parse("undefined")` throws on — caught silently and defaults applied. **Effect:** force-clear does not persist the reset correctly.

---

### 2.4 `$q.defer()` deferred anti-pattern

**Files:**  
- `app/js/factory.js` lines 1571–1586  
- `app/js/controllers/weighing_create.js` lines 586–611  
- `app/js/controllers/reprint_print.js` lines 782–823  
- `app/js/controllers/weighing_update.js` lines 994–1022

Wrapping a Restangular call (which already returns a promise) in a manual `$q.defer()`:

```javascript
var deferred = $q.defer();
Restangular.all('userprofile').getList().then(
    function(data) { deferred.resolve({ data: { message: "userprofile success!" } }); },
    function(err)  { deferred.reject(err); }
);
return deferred.promise;
```

**Problems:**
1. Extra layer of indirection, harder to reason about.
2. `deferred.resolve({ data: { message: "..." } })` discards the actual data — callers only see a fixed success object, not the real user list.
3. If the inner promise throws synchronously, the deferred is never resolved or rejected (memory leak).

**Rule:** Prefer `return Restangular.all(...).getList().then(transform, reject)` directly.

---

### 2.5 `services.js` — Xero menu shown when permissions missing

**File:** `app/js/services.js` lines 134–136

```javascript
if (!permissions || !permissions.xero || permissions.xero === "true" || permissions.xero === true) {
    vm.Xero = vm.Operations.addItem("Xero", "/app/xero", "fa-cloud");
}
```

If `permissions` is null/undefined **or** `permissions.xero` is absent, Xero is added to the menu. This is "default allow" for the UI. The API enforces the actual restriction — this is a UX gotcha only, not a security hole.

---

### 2.6 TODO / commented-out code

| File | Line(s) | Note |
|------|---------|------|
| `controllers/verify.js` | 299 | `//TODO : Check single Company, site` |
| `controllers/weighing_old.js` | 706, 1105, 1473, 1620, 1684 | Multiple unresolved TODOs |
| `js/services.js` | 101–106 | Commented-out weighing create/update menu items |

---

### 2.7 `console.log` / `console.error` left in production controllers

**Files:** `reprint_print.js` lines 162–174, 486–493; `reprint_edit.js` lines 83–90

Settings load diagnostics (`enable_moisture`, `enable_handling`, etc.) are logged on every reprint. Remove or guard with `if (window.__env.debug)` before production hardening.

---

## 3. Security Patterns and Bypasses

### 3.1 Token attached as query parameter

**File:** `app/js/app.js` lines 57–58 (and `settings.js` for image uploads)

```javascript
Restangular.setDefaultRequestParams({ token: MyLocalStorage.getItem('user_info').token });
```

For image uploads in `settings.js`: `'/api/updateImage?token=' + $rootScope.token`

**Risk:** Token in query string leaks in server access logs, browser history, and `Referer` headers. Prefer `Authorization: Bearer` header for new endpoints.

---

### 3.2 `localStorage.clear()` wipes everything, not just `user_info`

**File:** `app/js/app.js` lines 17–19

```javascript
clear: function() {
    localStorage.clear();
}
```

Called with `MyLocalStorage.clear('user_info')` — the argument is ignored. **All** localStorage keys are cleared, including scale preferences, saved navigation state, and any other app data. This is wider than the name implies.

---

### 3.3 `ng-hide` used for role-sensitive controls (visibility only)

**File:** `app/tpls/weighing/verify.html` line 321

```html
ng-hide="System.User.role.delete_transaction_flag === 'false'"
```

`ng-hide` removes the element from view but leaves it in the DOM. Inspect-element → remove `ng-hide` class → button is clickable. All delete/restrict actions **must** be enforced server-side (which they are via the API), but this is worth noting: the UI is not the security layer.

**Pattern found in:** `reprint_list.html`, `reprint.html` (delete buttons), `create.html` (verify user conditional).

---

### 3.4 Auth / routing guard — `restrictedRoutes` is empty

**File:** `app/js/app.js` lines 137–164

```javascript
$rootScope.$on("$stateChangeStart", function (e, to) {
    var normalRoutes = ['login'];
    if (normalRoutes.indexOf(to.name) === -1 && !$state.user_info) {
        e.preventDefault();
        $state.transitionTo('login');
    }
});
```

There is no per-route role check in the router. Any authenticated user can navigate to any route URL. **Role enforcement is purely API-side.** The UI menu hides links based on permissions but does not block direct URL navigation.

---

### 3.5 Fingerprint verification is client-side UI only

**File:** `app/js/controllers/reprint_print.js` lines 801–815 and 839–868

```javascript
// Watcher: compares fingerprint scan result to stored user fingerprint
if ($rootScope.FingerFeedback.length > 800 && $rootScope.FingerFeedback.indexOf(";") === -1) {
    if ($rootScope.FingerFeedback.substring(1, 200) === vm.Single.FirstUser_fingerprint.substring(1, 200)) {
        vm.ScannedUser = vm.Single.FirstUser;
    }
}
```

The fingerprint match (`ScannedUser` being set) gates the print button in the template. There is **no server call** to validate the fingerprint — the match happens in-browser against a fingerprint string stored in `vm.Single.FirstUser_fingerprint` which comes from the API. If the fingerprint data is absent or tampered client-side, the gate can fail open or be bypassed via DevTools. This is UI-gating only; the reprint API save call (`vm.save()`) does not pass fingerprint proof.

---

### 3.6 Sidebar menu built from client-stored permissions

**File:** `app/js/controllers.js` lines 258–261

```javascript
$scope.menuItems = (
    $state.user_info !== null
        ? $sidebarMenuItems.prepareSidebarMenu($state.user_info.permission).getAll()
        : []
);
```

`$state.user_info` is read from `localStorage`. A user who edits their localStorage `permission` object can see menu items they should not. **The API is the real gatekeeper** — this only affects what the UI shows.

---

## 4. Architecture Notes and Gotchas

### 4.1 `$scope.System = vm` — why?

**Files:** `reprint_print.js` line 5, `reprint_edit.js` line 3, and others

```javascript
var vm = this;
$scope.System = vm;
```

The main app uses `controller as System` syntax in templates (e.g. `ng-controller="ReprintPrintCtrl as System"`), which makes `vm` available as `System` in the template scope automatically. The explicit `$scope.System = vm` assignment is **redundant for controller-as templates** but serves as a safety net for:
1. Child directives that access `$scope` directly
2. Legacy `$scope`-based watchers inside the controller
3. `$emit`/`$broadcast` handlers that receive scope
It costs nothing and prevents subtle bugs in directives that access the parent scope by reference.

---

### 4.2 `$rootScope.Params` — cross-navigation state

**File:** `app/js/factory.js` lines 394–461 (`$navigation` service)

`$rootScope.Params` holds `{ company_id, site_id, workstation_id, weighbridge_id }`. It is:
- **Set** by `$navigation.set()` and individual `$navigation.company/site/workstation/weighbridge()` helpers
- **Persisted** to `localStorage["location"]` on every set
- **Restored** on `$navigation.clear()` from localStorage (but see the `Param` typo bug in §2.3)
- **Used** in `Restangular.setDefaultRequestParams` via `$navigation.get()` to scope all API calls

**Critical:** Any controller that calls `$state.go` without first calling `$navigation.set` (or individual helpers) may send the user to a screen with the wrong company/site context. Always verify `$navigation.get()` returns correct IDs before any API call that depends on them.

---

### 4.3 `preservedSelections` — race condition avoidance on save

**File:** `app/js/controllers/weighing_update.js` lines 1198–1205 (save) and 816–823 (SetReportingData)

Before triggering the API save, the controller snapshots all current selections:

```javascript
vm.preservedSelections = {
    businessPartner: angular.copy(vm.selected_businessPartner),
    haulier:         angular.copy(vm.selected_haulier),
    product:         angular.copy(vm.selected_product),
    contract:        angular.copy(vm.selected_contract),
    pallet:          angular.copy(vm.selected_pallet),
};
```

`SetReportingData` (called in the API success callback) then uses `vm.preservedSelections` instead of the live `vm.selected_*` values. This prevents a race condition where the user changes a dropdown between hitting Save and the API responding, which would produce a ticket with mismatched data.

`weighing_create.js` uses the same `preservedSelections` pattern in its save path.

---

### 4.4 `weighingLoad` / `applyWeighingLoadData` pipeline

**`factory.js`** `weighingLoad` (lines ~1570–1586):
- Calls `GET /weighingLoad?settings_id=X&...navigation params`
- Receives a single response with nested hauliers, products, cameras, contracts, pallets, tares
- Decorates `Setting.custom_header_text` and `custom_footer_text` from `$Names` service

**`weighing_create.js`** `applyWeighingLoadData` (lines ~403–447):
- Receives the above and fans it out into `vm.Hauliers`, `vm.Products`, `vm.Cameras`, `vm.Contracts`, `vm.Pallets`, `vm.Tares`
- Each list entry is shaped for both display (`.name`) and reporting (`.report`)
- Triggers `startCamerasIfReady` when cameras are present

**Gotcha:** `applyWeighingLoadData` uses `if (data.haulier !== undefined)` style checks — if the API omits a section (e.g. `data.contracts`), that list is not cleared, it retains whatever was previously loaded. A settings change mid-session could show stale lists if a section is omitted.

---

### 4.5 WebSocket lifecycle (scale + broadcast)

**Files:** `weighing_create.js` ~lines 750–891; `weighing_update.js` ~lines 1026–1192, 1747–1750

Two sockets:
- **`scaleSocket`** (`/ws/emso`): receives live weight from the scale; only open when `WeighBridge.manual === "No"`
- **`broadcastSocket`** (`/ws/syncin`): pushes transaction state to mobile displays

Lifecycle rules:
1. Started on settings selection (after `weighingLoad`)
2. **Stopped before save** — prevents scale updates overwriting the weight that is being saved
3. **Closed permanently on success** (`vm.closeWebSocket`)
4. **Closed on `$destroy`** — prevents leaks on navigation away
5. **Closed on cancel** — explicit cleanup

**Gotcha:** `vm.stopWebSocket` (pauses), `vm.closeWebSocket` (permanent), and `vm.restartWebSocket` are distinct. Using `stop` when `close` is needed leaves the socket object allocated.

---

### 4.6 `ticketPrint` directive — only a template switcher

**File:** `app/js/directives/ticket/ticket.directive.js`

```javascript
scope.getTemplateUrl = function () {
    if (scope.setting && scope.setting.ticket_template === 'thermal') {
        return appHelper.templatePath("print/receipt.tpl");
    }
    return appHelper.templatePath("print/ticket.tpl");
};
```

The directive **does no data transformation**. It is purely a switch between `receipt.tpl.html` (thermal) and `ticket.tpl.html` (normal) based on `setting.ticket_template`. All report data is prepared by the parent controller and passed through isolated scope bindings: `site`, `setting`, `reportData`, `weighingHeader`, `axelSetups`, `cameras`.

**Implication:** Any new field on the receipt must be populated in the parent controller's `ReportData` / `Single` object. The directive never needs changing.

---

### 4.7 `buildProductInvoice` — two implementations, different signatures

| Controller | Signature | `product` source | `nett` source |
|-----------|-----------|-----------------|--------------|
| `reprint_print.js` ~680 | `buildProductInvoice(product)` | argument | `vm.Single.NettWeight \|\| vm.ReportData.nett \|\| 0` |
| `weighing_update.js` ~874 | `buildProductInvoice()` | `vm.selected_product` | `vm.Single.NettWeight` |
| `weighing_create.js` ~956 | `buildProductInvoice()` | `vm.selected_product` | `vm.nettWeight` |

Both produce the same invoice shape (`productLines[]`, `vat`, `subTotal`, `total`, `amountDue`). The `reprint_print.js` version also reads `vm.Single.contract_transaction` for contract-linked pricing.

**Gotcha:** Changes to invoice calculation must be applied in all three controllers independently.

---

### 4.8 `$stateParams` vs `$rootScope.Params`

- `$stateParams` is the URL-bound parameter (`/reprint/edit/:id?company_id&site_id&workstation_id`)
- `$rootScope.Params` is the navigation context managed by `$navigation` service

They should be in sync but are set independently. On deep-link navigation (pasting a URL), `$rootScope.Params` may not match `$stateParams` until a controller calls `$navigation.set(...)`. Always use `$navigation.get()` for API calls (not `$stateParams` directly) to ensure the Restangular default params are correct.

---

## 5. High-Signal Locations Summary

| Pattern | File | Lines |
|---------|------|-------|
| `parseFloat \|\| 0` silences NaN | `reprint_edit.js` | 80–94 |
| `0` as uninitialised sentinel | `weighing_update.js` | 132 |
| `== 0` weight validation (correct) | `weighing_update.js` | 1265–1278 |
| `0` pallet count is falsy | `weighing_create.js` | 519–526 |
| `$rootScope.MasterData` silent fail | `reprint_print.js` | 674–677 |
| `window.__end` typo | `env.js` | 1 |
| Hardcoded Pi hostname | `env.js` | 5 |
| `$rootScope.Param` typo (no `s`) | `factory.js` | 415 |
| `$q.defer` anti-pattern | `factory.js`, `weighing_create.js`, `reprint_print.js`, `weighing_update.js` | Various |
| Xero menu default-allow | `services.js` | 134–136 |
| Console logs in production | `reprint_print.js`, `reprint_edit.js` | 162–174, 83–90 |
| Token in query string | `app.js`, `settings.js` | 57–58 |
| `localStorage.clear()` wipes all | `app.js` | 17–19 |
| `ng-hide` for role controls | `verify.html`, `reprint_list.html` | 321 |
| No per-route ACL in router | `app.js` | 137–164 |
| Fingerprint match is client-side | `reprint_print.js` | 801–868 |
| Menu permissions from localStorage | `controllers.js` | 258–261 |
| `$scope.System = vm` (why) | `reprint_print.js`, `reprint_edit.js` | 5, 3 |
| `$rootScope.Params` state pattern | `factory.js` | 394–461 |
| `preservedSelections` race fix | `weighing_update.js` | 816–823, 1198–1205 |
| `weighingLoad` pipeline | `factory.js`, `weighing_create.js` | 1570–1586, 403–447 |
| WebSocket lifecycle | `weighing_create.js`, `weighing_update.js` | ~750–891, ~1026–1192 |
| `ticketPrint` is a template switch | `ticket.directive.js` | 1–24 |
| `buildProductInvoice` (3 impls) | `reprint_print.js`, `weighing_update.js`, `weighing_create.js` | 680, 874, 956 |
| `$stateParams` vs `$rootScope.Params` | All controllers | — |
