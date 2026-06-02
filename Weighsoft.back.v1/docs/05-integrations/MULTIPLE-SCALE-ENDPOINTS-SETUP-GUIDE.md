# Multiple Scale Endpoints Setup Guide

This guide explains, step-by-step, how to configure **different Node-RED scale endpoints per workstation** in Weighsoft.

It is written for first-time deployers and support staff, with copy/paste SQL and verification steps.

---

## Table of Contents

1. [What This Solves](#1-what-this-solves)
2. [How Endpoint Routing Works](#2-how-endpoint-routing-works)
3. [Prerequisites](#3-prerequisites)
4. [Step 1 - Add Required Database Columns](#4-step-1---add-required-database-columns)
5. [Step 2 - Set Endpoint Values Per Workstation](#5-step-2---set-endpoint-values-per-workstation)
6. [Step 3 - (Optional) Enable Shared Workstation Mode](#6-step-3---optional-enable-shared-workstation-mode)
7. [Step 4 - Build and Deploy Backend + UI](#7-step-4---build-and-deploy-backend--ui)
8. [Step 5 - Verify Endpoint Resolution in Browser](#8-step-5---verify-endpoint-resolution-in-browser)
9. [Step 6 - Functional End-to-End Test](#9-step-6---functional-end-to-end-test)
10. [Troubleshooting](#10-troubleshooting)
11. [Rollback](#11-rollback)
12. [Quick Reference](#12-quick-reference)

---

## 1) What This Solves

Without per-workstation endpoints, all scale traffic can go to one global endpoint (`window.__env.scale`), which can cause:

- Wrong serial port list shown for a workstation.
- Weighing websocket connecting to wrong Node-RED flow.
- Mixed behavior between Raspberry Pi and Windows/PC scale hosts.

With this setup:

- Workstation 1 can use `thelab.taile6b86.ts.net/nr1`
- Workstation 2 can use `thelab.taile6b86.ts.net/nr2`
- Weighsoft automatically resolves endpoint by workstation, with fallback to global env value if missing.

---

## 2) How Endpoint Routing Works

At runtime, UI scale calls resolve in this order:

1. Read `workstations.scale_endpoint` for selected workstation.
2. If present and valid, build:
   - `http(s)://<scale_endpoint>/scale`
   - `http(s)://<scale_endpoint>/setup`
   - `http(s)://<scale_endpoint>/ports`
   - `ws(s)://<scale_endpoint>/ws/emso`
3. If no workstation endpoint exists, fallback to `window.__env.scale`.

This applies to:

- Weighing Create
- Weighing Update
- Tare Edit
- Weighbridge Setup
- Weighbridge screens
- Shared `$nodeRed` helpers

---

## 3) Prerequisites

Before starting, confirm:

- You have DB access to the `weighsoft` database.
- You know your workstation IDs (or names + site/company).
- Your Node-RED endpoints are reachable from user machines.
- Backend and UI are built from code containing workstation endpoint resolver support.

Recommended tools:

- MySQL client (CLI, DBeaver, HeidiSQL, or phpMyAdmin)
- Browser DevTools (Network tab)
- `curl` or browser URL access for endpoint tests

---

## 4) Step 1 - Add Required Database Columns

### 4.1 Add `scale_endpoint` to `workstations`

Run:

```sql
USE weighsoft;

ALTER TABLE workstations
ADD COLUMN scale_endpoint VARCHAR(255) NULL
COMMENT 'Node-RED scale endpoint (host:port)';
```

Reference script:

- `database_scripts/14-addScaleEndpointToWorkstations.sql`

If this column already exists, skip this step.

### 4.2 Add `shared_workstation` to `sites` (if not already present)

Run:

```sql
USE weighsoft;

ALTER TABLE sites
ADD COLUMN shared_workstation VARCHAR(255) NOT NULL DEFAULT 'No'
AFTER override_silo;
```

Reference script:

- `database_scripts/13-addSharedWorkstationToSites.sql`

This field is optional for endpoint routing itself, but useful for mixed first/second weighing workflows across workstations.

---

## 5) Step 2 - Set Endpoint Values Per Workstation

### 5.1 View existing workstation records

```sql
SELECT
  id,
  workstation_name,
  company_id,
  site_id,
  workstation_active,
  scale_endpoint
FROM workstations
ORDER BY company_id, site_id, id;
```

### 5.2 Update endpoint values

Example for your verified setup:

```sql
UPDATE workstations
SET scale_endpoint = 'thelab.taile6b86.ts.net/nr1'
WHERE id = 1;

UPDATE workstations
SET scale_endpoint = 'thelab.taile6b86.ts.net/nr2'
WHERE id = 2;
```

### 5.3 Verify data persisted correctly

```sql
SELECT id, workstation_name, scale_endpoint
FROM workstations
WHERE id IN (1,2);
```

Expected:

- Workstation 1 -> `thelab.taile6b86.ts.net/nr1`
- Workstation 2 -> `thelab.taile6b86.ts.net/nr2`

### 5.4 Endpoint format rules (important)

Use this format:

- `host/path`
- `host:port/path`
- `hostname.tailnet.ts.net/nrX`

Avoid:

- protocol prefix (`http://` or `https://`) in DB value
- trailing slash (`/`)

Why: the frontend resolver normalizes values, but clean values reduce ambiguity and troubleshooting noise.

---

## 6) Step 3 - (Optional) Enable Shared Workstation Mode

If first and second weight may happen on different workstations at the same site:

```sql
UPDATE sites
SET shared_workstation = 'Yes'
WHERE id = <site_id>;
```

Verify:

```sql
SELECT id, name, shared_workstation
FROM sites
WHERE id = <site_id>;
```

Use `No` if each transaction must stay on one workstation only.

---

## 7) Step 4 - Build and Deploy Backend + UI

Deploy the backend and frontend that include workstation endpoint resolver logic.

At minimum:

- Backend migration/DB changes applied
- Frontend bundle updated and deployed
- Services restarted (web, php-fpm, node-red/proxy as applicable)

If your environment uses project build scripts, run your standard deployment process from:

- `Weighsoft.back.v1/build.bat`
- `Weighsoft.ui.v1/build.bat`

After deployment, force-refresh browser (`Ctrl+F5`) to avoid cached JS.

---

## 8) Step 5 - Verify Endpoint Resolution in Browser

### 8.1 Verify ports endpoint per workstation

For workstation using `/nr1`:

- `https://thelab.taile6b86.ts.net/nr1/ports` -> should show Pi ports

For workstation using `/nr2`:

- `https://thelab.taile6b86.ts.net/nr2/ports` -> should show PC ports

You already validated this behavior correctly.

### 8.2 Verify websocket endpoint in Network tab

In browser:

1. Open DevTools -> Network.
2. Filter by `WS`.
3. Open Weighing Create on workstation 2.
4. Confirm websocket URL includes workstation path:
   - expected: `wss://thelab.taile6b86.ts.net/nr2/ws/emso`
   - not expected: `wss://thelab.taile6b86.ts.net/ws/emso`

Repeat for workstation 1 and confirm `/nr1/ws/emso`.

### 8.3 Verify related HTTP calls

While using each workstation, check requests target the matching path:

- `/scale`
- `/setup`
- `/ports`

All should include `/nr1` or `/nr2` when workstation endpoint is set.

---

## 9) Step 6 - Functional End-to-End Test

Run this exact test sequence:

1. Login and select company/site/workstation 1.
2. Open Weighing Create.
3. Confirm live weight and ports match Pi-side scale host.
4. Save a test weighing.
5. Switch to workstation 2.
6. Open Weighing Create and Weighing Update.
7. Confirm live weight and ports match PC-side scale host.
8. Open Tare Edit and test start/stop read behavior.
9. Open Weighbridge Setup and refresh ports.
10. Confirm no screen falls back to root `/ws/emso` while workstation endpoint exists.

Pass criteria:

- No cross-routing between workstation hosts.
- No unexpected wrong port lists.
- No websocket connection to pathless `/ws/emso` for configured workstations.

---

## 10) Troubleshooting

### Problem: Websocket still opens `/ws/emso` (without `/nrX`)

Check:

- Workstation record actually has `scale_endpoint` populated.
- User selected correct workstation in UI context.
- Browser cache cleared (hard refresh).
- Correct frontend build deployed (new JS loaded).

### Problem: Wrong COM/tty ports shown

Check:

- `scale_endpoint` points to correct Node-RED path.
- Reverse proxy routing for `/nr1` and `/nr2` is correct.
- `/nr1/ports` and `/nr2/ports` return different expected lists.

### Problem: 404 on `/nr2/ws/emso` or `/nr2/ports`

Check proxy and Node-RED route mapping:

- `/nr2/*` must route to the correct Node-RED instance/flow root.
- websocket upgrade headers must be enabled in proxy.

### Problem: Works in setup screen, fails in weighing screen

This usually means frontend bundle mismatch/caching.

- Rebuild UI
- Redeploy
- Hard refresh client browser
- Confirm updated controllers are loaded

---

## 11) Rollback

If needed, you can safely revert to global endpoint behavior by clearing per-workstation values:

```sql
UPDATE workstations
SET scale_endpoint = NULL
WHERE site_id = <site_id>;
```

With NULL values, the app falls back to `window.__env.scale`.

Do not drop columns unless you are intentionally rolling back schema.

---

## 12) Quick Reference

### SQL - Show workstation endpoints

```sql
SELECT id, workstation_name, scale_endpoint
FROM workstations
ORDER BY id;
```

### SQL - Set two endpoints

```sql
UPDATE workstations SET scale_endpoint = 'thelab.taile6b86.ts.net/nr1' WHERE id = 1;
UPDATE workstations SET scale_endpoint = 'thelab.taile6b86.ts.net/nr2' WHERE id = 2;
```

### Verify URLs

- `https://thelab.taile6b86.ts.net/nr1/ports`
- `https://thelab.taile6b86.ts.net/nr2/ports`

### Expected behavior

- Workstation 1 uses `/nr1/*`
- Workstation 2 uses `/nr2/*`
- Missing workstation endpoint falls back to global env endpoint

