# WeighSoft Xero Integration - Complete Setup Guide

This guide covers every step needed to set up the Xero integration for a new WeighSoft deployment, from registering the Xero app through to verifying the connection works end-to-end. It also covers the full HTTPS proxy setup required to secure all WeighSoft services.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Register a Xero App](#2-register-a-xero-app)
3. [Run the Database Migration](#3-run-the-database-migration)
4. [Configure the Backend `.env`](#4-configure-the-backend-env)
5. [Set Up SSL (HTTPS)](#5-set-up-ssl-https)
6. [Update `docker-compose.yml` for the Proxy](#6-update-docker-composeyml-for-the-proxy)
7. [Update the Frontend `env.js`](#7-update-the-frontend-envjs)
8. [Deploy and Verify](#8-deploy-and-verify)
9. [Set User Permissions](#9-set-user-permissions)
10. [Connect WeighSoft to Xero](#10-connect-weighsoft-to-xero)
11. [Troubleshooting](#11-troubleshooting)
12. [Rollback](#12-rollback)

---

## 1. Prerequisites

- WeighSoft backend and frontend Docker images built and deployed
- SSH access to the deployment server (e.g. Raspberry Pi)
- MySQL/MariaDB access to the `weighsoft` database
- A Xero account with a company/organisation
- A domain or hostname (e.g. Tailscale MagicDNS hostname) that can serve HTTPS
- Docker and Docker Compose on the deployment server

---

## 2. Register a Xero App

### 2.1 Go to Xero Developer Console

Open: **https://developer.xero.com/app/manage**

If you don't have a developer account, sign up at https://developer.xero.com.

### 2.2 Create a New App

1. Click **"New app"**
2. Fill in the form:
   - **App name**: `WeighSoft` (or your preferred name)
   - **Integration type**: Select **"Web app"**
   - **Company or application URL**: Your deployment URL, e.g. `https://yourhost.tailnet-name.ts.net`
   - **OAuth 2.0 Redirect URI**: This is critical. Set it to:
     ```
     https://<YOUR_HOSTNAME>/api/xero/callback
     ```
     For example:
     ```
     https://thelab.taile6b86.ts.net/api/xero/callback
     ```
     **IMPORTANT**: 
     - Must be `https://` (Xero requires HTTPS for OAuth callbacks)
     - Do NOT include a port number (the Nginx proxy handles SSL on port 443)
     - The path must be exactly `/api/xero/callback`
3. Click **"Create app"**

### 2.3 Copy Your Credentials

After creating the app, you'll see:
- **Client ID** - a 32-character hex string (e.g. `85ECE4B27C404D1F81369DD7AC996876`)
- **Client Secret** - click "Generate a secret" if not already generated

**Save both values** -- you'll need them for the `.env` file.

### 2.4 Required OAuth 2.0 Scopes

The WeighSoft backend requests the following scopes automatically during the OAuth flow (configured in `config/xero.php`):

| Scope | Purpose |
|-------|---------|
| `openid` | Standard OpenID Connect |
| `profile` | User profile information |
| `email` | User email |
| `offline_access` | **Required** -- enables refresh tokens so the connection persists |
| `accounting.transactions` | Create/read invoices |
| `accounting.contacts` | Sync customers/business partners |
| `accounting.settings` | Read Xero organisation settings |
| `accounting.attachments` | Attach PDF invoices to Xero invoices |

The `offline_access` scope is essential. Without it, Xero will not return a refresh token, and the connection status will show "Not Connected" even after a successful OAuth flow.

---

## 3. Run the Database Migration

### 3.1 Migration Script Location

```
Weighsoft.back.v1/database_scripts/12-addXeroIntegration.sql
```

### 3.2 What the Script Creates

| Object | Type | Purpose |
|--------|------|---------|
| `xero_settings` | Table | Stores per-company Xero credentials, tokens, and settings |
| `xero_sync_log` | Table | Logs every sync operation (customers, products, invoices) |
| `xero_invoice_queue` | Table | Tracks invoices being sent to Xero with retry support |
| `jobs` | Table | Laravel queue driver table for background processing |
| `failed_jobs` | Table | Laravel failed queue jobs |
| `businesspartners.xero_contact_id` | Column | Links WeighSoft customers to Xero contacts |
| `businesspartners.xero_synced_at` | Column | Tracks when a customer was last synced |
| `products.xero_item_id` | Column | Links WeighSoft products to Xero items |
| `products.xero_synced_at` | Column | Tracks when a product was last synced |
| `weighingheaders.xero_invoice_id` | Column | Links a weighing ticket to its Xero invoice |
| `weighingheaders.invoice_modified` | Column | Flags if invoice was modified after being sent to Xero |
| `usertypes.xero` | Column | Permission flag to control who can access the Xero menu |

### 3.3 Run the Migration

Connect to your MySQL database and execute:

```sql
SOURCE /path/to/12-addXeroIntegration.sql;
```

Or via command line:

```bash
mysql -u root -p weighsoft < database_scripts/12-addXeroIntegration.sql
```

Or via Docker on the deployment server:

```bash
sudo docker exec -i weighsoftv1-db mysql -u root weighsoft < 12-addXeroIntegration.sql
```

The script is **idempotent** -- safe to run multiple times. It checks if each object exists before creating it.

### 3.4 Verify the Migration

The script outputs verification results at the end. Every line should show a check mark. Example:

```
========================================
XERO INTEGRATION - VERIFICATION RESULTS
========================================
✓ xero_settings TABLE EXISTS
✓ xero_sync_log TABLE EXISTS
✓ xero_invoice_queue TABLE EXISTS
✓ businesspartners.xero_contact_id EXISTS
✓ businesspartners.xero_synced_at EXISTS
✓ idx_bp_xero_contact INDEX EXISTS
✓ products.xero_item_id EXISTS
✓ products.xero_synced_at EXISTS
✓ idx_prod_xero_item INDEX EXISTS
✓ weighingheaders.xero_invoice_id EXISTS
✓ weighingheaders.invoice_modified EXISTS
✓ idx_wh_xero_invoice INDEX EXISTS
✓ jobs TABLE EXISTS
✓ failed_jobs TABLE EXISTS
✓ fk_xero_settings_company FK EXISTS
✓ fk_xero_sync_log_company FK EXISTS
✓ fk_xero_invoice_company FK EXISTS
✓ usertypes.xero COLUMN EXISTS
========================================
```

### 3.5 Enable Xero Permission for Admin Users

After running the migration, update the `usertypes` table so admin users can see the Xero menu:

```sql
UPDATE usertypes SET xero = 'true' WHERE usertypes = 'Admin';
```

Replace `'Admin'` with whatever role(s) should have access.

### 3.6 Packaging and shipping on Xero invoices (script 18)

When contracts include packaging or shipping per ton, WeighSoft can send **additional Xero invoice lines** (second and third line items) using **dedicated WeighSoft products** that exist only to map to Xero items. The **amounts** on each ticket still come from the weighing header snapshots (`contract_packaging_price_per_ton`, `contract_shipping_price_per_ton`, and metric tons from net weight), not from those products’ catalogue prices.

1. Run the idempotent script (after script 12):

   ```bash
   mysql -u root -p weighsoft < database_scripts/18-xeroSettingsPackagingShippingProducts.sql
   ```

2. Create the packaging and shipping **items** in Xero (codes such as `WS-PKG` / `WS-SHP`). Run **product sync** in WeighSoft so matching products are created and `xero_item_id` is populated from Xero.

3. Point `xero_settings` at those products (replace IDs with yours):

   ```sql
   UPDATE xero_settings
   SET packaging_product_id = <id_of_packaging_product>,
       shipping_product_id = <id_of_shipping_product>
   WHERE company_id = <YOUR_COMPANY_ID>;
   ```

If a ticket has a non-zero packaging or shipping rate per ton but the matching column is NULL or the product is not synced to Xero, invoice creation will fail with an explicit error until this is configured.

### 3.7 Widen sync direction columns (script 19) — required for “Strict Xero → WeighSoft”

The value `strict_xero_to_weighsoft` is **24 characters**. The original Xero integration used `VARCHAR(20)` for `sync_customers` and `sync_products`. Saving strict mode **truncates** the value in MySQL (e.g. to `strict_xero_to_weighs`). Symptoms:

- After save, **Sync Customers** / **Sync Products** dropdowns look **blank**
- Logs show `local_pruned=0` and `reconciled_orphans=0` even when you expect strict mirror cleanup

Run (once per database):

```bash
mysql -u root -p weighsoft < database_scripts/19-widenXeroSyncDirectionColumns.sql
```

Or run `php artisan migrate` so migration `2026_04_08_120000_widen_xero_settings_sync_direction_columns` applies. Then open Xero settings, choose **Strict Xero → WeighSoft** again, and **Save**.

---

## 4. Configure the Backend `.env`

On the deployment server, edit the `.env` file used by the backend container (e.g. `~/weighsoft/.env`).

Add or update these three lines:

```env
# Xero Integration (register app at https://developer.xero.com/app/manage)
XERO_CLIENT_ID=<your Client ID from step 2.3>
XERO_CLIENT_SECRET=<your Client Secret from step 2.3>
XERO_REDIRECT_URI=https://<YOUR_HOSTNAME>/api/xero/callback
```

**Example:**

```env
XERO_CLIENT_ID=85ECE4B27C404D1F81369DD7AC996876
XERO_CLIENT_SECRET=oAk1fo4-2j8BlW1jIw8yP_1gYCi36CeapGjWmF17RfxMUo63
XERO_REDIRECT_URI=https://thelab.taile6b86.ts.net/api/xero/callback
```

**Critical rules for `XERO_REDIRECT_URI`:**
- Must start with `https://`
- Must NOT include a port number (no `:5000`)
- Must end with `/api/xero/callback`
- Must exactly match the Redirect URI you entered in the Xero Developer Console (Step 2.2)

---

## 5. Set Up SSL (HTTPS)

Xero requires HTTPS for OAuth 2.0 redirect URIs. Beyond Xero, **all WeighSoft services should run behind HTTPS** in production -- this includes the Laravel backend (port 5000) and Node-RED / scale connector (port 3000).

### Option A: Self-Signed Certificate (Tailscale / Private Network)

If the server is only accessible via a private network (e.g. Tailscale), a self-signed certificate works.

#### 5.1 Create the certificate directory

```bash
mkdir -p ~/weighsoft/certs
```

#### 5.2 Generate a self-signed certificate

Replace the hostname and IP with your actual values:

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout ~/weighsoft/certs/selfsigned.key \
  -out ~/weighsoft/certs/selfsigned.crt \
  -subj '/C=ZA/ST=YourState/O=YourCompany/CN=yourhost.tailnet-name.ts.net' \
  -addext 'subjectAltName=DNS:yourhost.tailnet-name.ts.net,DNS:yourhost,IP:100.x.x.x'
```

**Example for Tailscale:**

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout ~/weighsoft/certs/selfsigned.key \
  -out ~/weighsoft/certs/selfsigned.crt \
  -subj '/C=ZA/ST=Free State/O=Weighsoft/CN=thelab.taile6b86.ts.net' \
  -addext 'subjectAltName=DNS:thelab.taile6b86.ts.net,DNS:thelab,IP:100.72.251.104'
```

The certificate is valid for 10 years (3650 days).

> **Note**: Browsers will show a security warning for self-signed certificates. You must accept/trust the certificate the first time.

### Option B: Let's Encrypt (Public-Facing Server)

If your server has a public domain name, use Certbot:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

Certificates will be at:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

Update the Nginx config paths accordingly.

### Option C: Tailscale Built-in HTTPS (Requires Pro Plan)

If you have a Tailscale Pro plan:

```bash
tailscale cert yourhost.tailnet-name.ts.net
```

#### 5.3 Create the Nginx Proxy Configuration

Create `~/weighsoft/proxy.conf`:

```nginx
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/certs/selfsigned.crt;
    ssl_certificate_key /etc/nginx/certs/selfsigned.key;

    # API requests go to the Laravel backend container (port 80 internal)
    location /api/ {
        proxy_pass http://app:80/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Node-RED / Scale connector - HTTP endpoints
    location /scale {
        proxy_pass http://nodered:1880/scale;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Node-RED / Scale connector - WebSocket endpoints
    location /ws/ {
        proxy_pass http://nodered:1880/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Everything else goes to the frontend container
    location / {
        proxy_pass http://ui:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **IMPORTANT**: The Node-RED WebSocket location (`/ws/`) requires `proxy_http_version 1.1` and the `Upgrade` / `Connection` headers for WebSocket connections to work through the reverse proxy. The `proxy_read_timeout 86400` keeps long-lived WebSocket connections open for up to 24 hours.

> **Note**: Adjust the Node-RED upstream (`nodered:1880`) to match your Docker Compose service name and the port Node-RED listens on internally. If Node-RED listens on port 3000, change `1880` to `3000`.

If using Let's Encrypt, change the certificate paths:
```nginx
ssl_certificate     /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;
```

---

## 6. Update `docker-compose.yml` for the Proxy

Add a `proxy` service and adjust the existing services so **no service exposes HTTP ports directly to the host**. All traffic must go through the HTTPS proxy.

### 6.1 Add the Proxy Service

```yaml
proxy:
  image: nginx:alpine
  container_name: weighsoftv1-proxy
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./proxy.conf:/etc/nginx/conf.d/default.conf:ro
    - ./certs:/etc/nginx/certs:ro
  depends_on:
    - ui
    - app
    - nodered
```

### 6.2 Adjust the `app` (Backend / Laravel) Service

Remove the host port mapping and only expose internally. The proxy will forward `/api/` requests to this container:

```yaml
app:
  # ... existing config ...
  expose:
    - "80"
  # REMOVE or comment out: ports: - "5000:80"
  # The backend is only reachable via the HTTPS proxy now
```

**Do NOT keep `ports: - "5000:80"` in production.** Leaving port 5000 open allows direct HTTP access that bypasses HTTPS. Remove it entirely or comment it out.

### 6.3 Adjust the `ui` (Frontend) Service

```yaml
ui:
  # ... existing config ...
  expose:
    - "80"
  # REMOVE: ports: - "80:80"
  # The frontend is only reachable via the HTTPS proxy now
```

### 6.4 Adjust the `nodered` (Node-RED / Scale Connector) Service

```yaml
nodered:
  # ... existing config ...
  expose:
    - "1880"
  # REMOVE or comment out: ports: - "3000:1880"
  # Node-RED is only reachable via the HTTPS proxy now
```

> **Note**: Adjust the internal port (`1880`) to match your Node-RED configuration. If your Node-RED listens on port 3000 internally, use `expose: - "3000"` and update the proxy.conf `proxy_pass` lines accordingly.

### 6.5 Summary: No Direct HTTP Ports

After these changes, the **only** ports exposed to the host are:
- **80** (redirects to 443)
- **443** (HTTPS -- serves everything)

All services (frontend, backend, Node-RED) are proxied through HTTPS. No service is directly accessible over HTTP.

```
Browser/Client
    |
    v
[Nginx Proxy :443 HTTPS]
    |         |         |
    v         v         v
  [ui]     [app]    [nodered]
  :80      :80       :1880
```

---

## 7. Update the Frontend `env.js`

The frontend `env.js` must be updated so that **all URLs use HTTPS through the proxy** -- no direct HTTP connections to backend ports.

Edit `env.js` on the deployment server (e.g. `~/weighsoft/env.js`):

```javascript
(function (window) {
  window.__env = window.__env || {};
  window.__env.base = window.location.protocol + "//" + window.location.hostname;
  window.__env.scale = window.location.protocol + "//" + window.location.hostname;
  window.__env.logo = "assets/images/logos/ZZesto.png";
})(this);
```

This ensures:
- **`base` (Laravel API)**: Uses `https://hostname` (port 443, proxied to the backend) -- no `:5000`
- **`scale` (Node-RED)**: Uses `https://hostname` (port 443, proxied to Node-RED) -- no `:3000`
- Both dynamically use `window.location.protocol` so they follow whatever protocol the page was loaded with

**CRITICAL -- What NOT to do:**

```javascript
// WRONG - exposes backend on HTTP port 5000 directly
window.__env.base = `http://${window.location.hostname}:5000`;

// WRONG - exposes Node-RED on HTTP port 3000 directly
window.__env.scale = `http://henzard-pi:3000`;

// WRONG - uses HTTPS but with a port number (bypasses proxy)
window.__env.base = `https://${window.location.hostname}:5000`;
```

All of the above bypass the proxy and either use plain HTTP or try to hit ports that are no longer exposed.

### 7.1 WebSocket Connections

The `$nodeRed` factory in `factory.js` uses `window.__env.scale` for WebSocket connections. With the proxy setup:

- HTTP WebSockets (`ws://`) are automatically upgraded to secure WebSockets (`wss://`) because the proxy terminates SSL
- The Nginx proxy config includes WebSocket upgrade headers for the `/ws/` path
- No code changes are needed in `factory.js` -- the WebSocket connections will work through `wss://hostname/ws/emso` via the proxy

> **Note**: If the frontend code hardcodes `ws://` for WebSocket connections (e.g. in `factory.js`), those connections will still work because the browser sends them to the proxy which handles the upgrade. However, for a fully clean setup, consider updating any hardcoded `ws://` to use `wss://` when on HTTPS by checking `window.location.protocol`.

---

## 8. Deploy and Verify

### 8.1 Build and Push Docker Images

From your development machine:

```powershell
# Backend
cd C:\Project\Weighsoft.back.v1
.\build.bat

# Frontend (only if env.js or frontend code changed)
cd C:\Project\Weighsoft.ui.v1
.\build.bat
```

### 8.2 Deploy to the Server

```powershell
# Or use deploy-all.ps1 from Weighsoft.ui.v1
cd C:\Project\Weighsoft.ui.v1
.\deploy-all.ps1
```

Or manually via SSH:

```bash
ssh pi@<SERVER_IP> "cd ~/weighsoft && sudo docker compose pull && sudo docker compose up -d"
```

### 8.3 Clear Caches After Deployment

This is essential -- stale caches can prevent the Xero routes from registering:

```bash
ssh pi@<SERVER_IP> "sudo docker exec weighsoftv1-back php artisan optimize:clear"
```

Or individually:

```bash
sudo docker exec weighsoftv1-back php artisan route:clear
sudo docker exec weighsoftv1-back php artisan config:clear
sudo docker exec weighsoftv1-back php artisan cache:clear
```

### 8.4 Verify Routes Are Registered

```bash
sudo docker exec weighsoftv1-back php artisan route:list --path=xero
```

You should see all Xero routes listed:

```
GET|HEAD  api/xero/callback
GET|HEAD  api/xero/settings/{companyId}
PUT       api/xero/settings/{companyId}
GET|HEAD  api/xero/connect/{companyId}
DELETE    api/xero/disconnect/{companyId}
POST      api/xero/sync/{companyId}
POST      api/xero/sync/{companyId}/customers
POST      api/xero/sync/{companyId}/items
GET|HEAD  api/xero/invoices/{companyId}
POST      api/xero/invoices/{queueId}/retry
GET|HEAD  api/xero/sync-log/{companyId}
```

If no routes appear, run `php artisan route:clear` again.

### 8.5 Verify HTTPS is Working

Open your browser and navigate to:

```
https://<YOUR_HOSTNAME>
```

- If using a self-signed certificate, accept the browser warning
- You should see the WeighSoft login page
- Check the browser address bar shows the padlock (HTTPS)

### 8.6 Verify the API is Reachable Through the Proxy

```bash
curl -k https://<YOUR_HOSTNAME>/api/xero/settings/1
```

You should get a JSON response (even if it's an auth error, that confirms the route is reachable).

### 8.7 Verify Node-RED is Reachable Through the Proxy

```bash
curl -k https://<YOUR_HOSTNAME>/scale
```

You should get a response from Node-RED (even if it's an error, that confirms the proxy route works).

### 8.8 Verify No Direct HTTP Ports Are Open

Confirm that ports 5000 and 3000 are NOT accessible from outside the Docker network:

```bash
# These should fail or time out (ports not exposed to host)
curl http://<YOUR_HOSTNAME>:5000/api/company
curl http://<YOUR_HOSTNAME>:3000/scale
```

If these succeed, you still have `ports:` mappings in `docker-compose.yml` that need to be removed (see Section 6).

---

## 9. Set User Permissions

### 9.1 Via Database

```sql
UPDATE usertypes SET xero = 'true' WHERE usertypes = 'Admin';
```

### 9.2 Via WeighSoft UI

1. Log in as an admin user
2. Navigate to **User Types** in the sidebar
3. Edit the desired user type (e.g. Admin)
4. Set **Xero** to **Yes**
5. Save

### 9.3 Important

Users must **log out and log back in** after permission changes for the Xero menu item to appear/disappear. User permissions are cached in `localStorage` at login time.

---

## 10. Connect WeighSoft to Xero

### 10.1 Navigate to Xero

1. Log in to WeighSoft
2. Click **Xero** in the left sidebar (under Operations)
3. Select a **Company** from the dropdown

### 10.2 Connect

1. Click **"Connect to Xero"**
2. A popup window opens with the Xero login page
3. Log in to Xero and authorize the WeighSoft app
4. Select the Xero organisation to connect
5. Click **"Allow access"**
6. The popup shows "Connected to Xero. You may close this window."
7. The popup closes automatically
8. The Xero page refreshes and should show **"Connected to: [Organisation Name]"**

### 10.3 Configure Settings

Once connected, configure:

| Setting | Options | Description |
|---------|---------|-------------|
| Enable Xero | On/Off | Master toggle for the integration |
| Sync Customers | Off / Xero → WeighSoft / **Strict** Xero → WeighSoft | **Xero → WeighSoft**: import and update contacts from Xero only (no soft-deletes from archive/orphan rules, no automatic removal of local-only partners). **Strict**: full mirror — archived or removed Xero contacts are soft-deleted in WeighSoft; un-archived contacts can be restored; local-only partners with no Xero link are removed when safe (not referenced by weighings, contracts, or hauliers). |
| Sync Products | Off / Xero → WeighSoft / **Strict** Xero → WeighSoft | **Xero → WeighSoft**: import and update items from Xero only (no soft-deletes for inactive/orphan items, no local-only product prune). **Strict**: full mirror — items inactive in Xero (not sold and not purchased) or missing from the tenant are soft-deleted; packaging/shipping mappings on `xero_settings` are cleared if those products are removed; local-only products are removed when safe (not referenced by weighings, contracts, or line-item settings). |
| Auto Create Invoices | On/Off | Automatically create Xero invoices when tickets are completed |
| Invoice Action | Draft / Approved / Approved and Emailed | Controls the status of invoices created in Xero |
| Sync Frequency | 15min to 24h | How often to run automatic syncs |

WeighSoft **does not** push new customers or products to Xero from the sync job. Manage the catalogue in Xero, then run sync (or wait for the scheduled run).

Click **"Save Settings"** after making changes.

### 10.4 Initial Sync

Click **"Sync All"** to pull customers and products **from Xero into WeighSoft** for the first time (and on each run). With **Strict** mode, archived or deleted Xero records no longer appear as active choices in WeighSoft (they are soft-deleted); with standard **Xero → WeighSoft**, those cleanup rules do not run and existing WeighSoft rows stay unless you change them manually.

### 10.5 Packaging and shipping lines

If you use contract packaging or shipping per ton, complete **Section 3.6** (script 18 and `packaging_product_id` / `shipping_product_id` on `xero_settings`). Otherwise Xero may reject invoice creation when those rates are present on a ticket.

---

## 11. Troubleshooting

### Status shows "Not Connected" after OAuth flow completes

**Cause**: The `offline_access` scope was not requested, so Xero did not return a refresh token.

**Fix**: Ensure `config/xero.php` includes `'offline_access'` in the scopes array. Rebuild and redeploy the backend. Then disconnect and reconnect.

**Verify**: Check the database:
```sql
SELECT id, company_id, xero_tenant_id, organization_name,
       LENGTH(access_token) as at_len, LENGTH(refresh_token) as rt_len
FROM xero_settings WHERE company_id = <YOUR_COMPANY_ID>;
```
Both `at_len` and `rt_len` must be non-null. If `rt_len` is NULL, the `offline_access` scope is missing.

### ERR_SSL_PROTOCOL_ERROR on callback

**Cause**: The `XERO_REDIRECT_URI` in `.env` includes a port number (e.g. `:5000`) that points to the backend's HTTP port instead of the HTTPS proxy.

**Fix**:
1. Edit `.env` on the server:
   ```bash
   # Change from:
   XERO_REDIRECT_URI=https://hostname:5000/api/xero/callback
   # To:
   XERO_REDIRECT_URI=https://hostname/api/xero/callback
   ```
2. Restart the backend:
   ```bash
   sudo docker compose restart app
   sudo docker exec weighsoftv1-back php artisan config:clear
   ```
3. Update the matching Redirect URI in the Xero Developer Console at https://developer.xero.com/app/manage

### Xero “Strict” sync: blank dropdowns and counts never shrink

**Cause**: `sync_customers` / `sync_products` columns are too short (`VARCHAR(20)`), so `strict_xero_to_weighsoft` was truncated on save. Strict mirror never activates.

**Fix**: **Section 3.7** — run script `19-widenXeroSyncDirectionColumns.sql` (or the Laravel widen migration), re-save strict mode, then sync again.

**Note**: Even with strict mode working, WeighSoft only **soft-deletes** partners/products that are safe to remove: **local-only** rows (no Xero ID) with no weighings/contracts/haulier links, and **orphan** linked rows whose Xero ID is not in the current tenant. Historical data keeps extra rows until those rules allow pruning.

### Xero invoice failed: packaging_product_id / shipping_product_id / not synced to Xero

**Cause**: A closed ticket has contract packaging or shipping per ton on the weighing header, but `xero_settings` does not reference valid WeighSoft products with `xero_item_id`, or the referenced products belong to another company.

**Fix**: Follow **Section 3.6** — run script `18-xeroSettingsPackagingShippingProducts.sql`, create and sync the two ancillary products, and `UPDATE xero_settings` with the correct `packaging_product_id` and `shipping_product_id` for that company.

### Mixed content errors in browser console

**Cause**: The frontend `env.js` still uses `http://` URLs for `base` or `scale`, causing the browser to block insecure requests from an HTTPS page.

**Fix**: Update `env.js` on the deployment server so both `base` and `scale` use `window.location.protocol` (see Section 7). Do NOT hardcode `http://` in any URL when the site is served over HTTPS.

### WebSocket connection to Node-RED fails

**Cause**: The Nginx proxy is not configured to upgrade WebSocket connections, or the `/ws/` location block is missing.

**Fix**:
1. Ensure `proxy.conf` has the `/ws/` location block with WebSocket upgrade headers (see Section 5.3)
2. Restart the proxy:
   ```bash
   sudo docker compose restart proxy
   ```
3. Check that `env.js` sets `window.__env.scale` to `https://hostname` (no port) so WebSocket connections go through the proxy as `wss://`

### 404 on `/api/xero/connect/{companyId}`

**Cause**: Laravel route cache is stale and doesn't include the Xero routes.

**Automated fix** (from Windows, runs on deployment server via SSH):
```powershell
cd Weighsoft.back.v1\scripts
.\Run-XeroTroubleshoot.ps1
```

**Manual fix** (on deployment server):
```bash
sudo docker exec weighsoftv1-back php artisan route:clear
# Or full clear:
sudo docker exec weighsoftv1-back php artisan optimize:clear
```

Verify with:
```bash
sudo docker exec weighsoftv1-back php artisan route:list --path=xero
```

Or run the full troubleshooting script on the server: `scripts/xero-connect-troubleshoot.sh`

### Xero menu item not showing in sidebar

**Causes & Fixes**:
1. **Permission not granted**: Update `usertypes` table (see Step 9)
2. **Stale login cache**: Log out and log back in
3. **Backend not deployed**: Rebuild and redeploy the backend Docker image
4. **Frontend not deployed**: Rebuild and redeploy the frontend Docker image

### OAuth popup shows error

Check the backend logs:
```bash
sudo docker logs weighsoftv1-back --tail=50
```

Look for lines starting with `Xero callback failed:`. Common causes:
- Client ID/Secret mismatch between `.env` and Xero Developer Console
- Redirect URI mismatch (must be character-for-character identical)
- Expired authorization code (user waited too long on the Xero auth page)

### Redirect URI mismatch error from Xero

The `XERO_REDIRECT_URI` in your `.env` file must **exactly match** the OAuth 2.0 Redirect URI configured in the Xero Developer Console. Common mismatches:
- `http` vs `https`
- Including vs excluding a port number
- Trailing slash differences
- Hostname differences (e.g. `thelab` vs `thelab.taile6b86.ts.net`)

---

## 12. Rollback

If you need to completely remove the Xero integration from the database:

### 12.1 Rollback Script Location

```
Weighsoft.back.v1/database_scripts/12-rollbackXeroIntegration.sql
```

### 12.2 Run the Rollback

```bash
mysql -u root -p weighsoft < database_scripts/12-rollbackXeroIntegration.sql
```

Or via Docker:

```bash
sudo docker exec -i weighsoftv1-db mysql -u root weighsoft < 12-rollbackXeroIntegration.sql
```

This removes:
- All Xero tables (`xero_settings`, `xero_sync_log`, `xero_invoice_queue`)
- All Xero columns from existing tables (`xero_contact_id`, `xero_item_id`, `xero_invoice_id`, etc.)
- The `xero` permission column from `usertypes`
- Does NOT remove `jobs` / `failed_jobs` tables (may be used by other features)

The rollback is also idempotent -- safe to run multiple times.

---

## Quick Reference: File Locations

| File | Purpose |
|------|---------|
| `Weighsoft.back.v1/config/xero.php` | Xero OAuth scopes and config |
| `Weighsoft.back.v1/.env` (on server) | Xero Client ID, Secret, Redirect URI |
| `Weighsoft.back.v1/database_scripts/12-addXeroIntegration.sql` | Database migration |
| `Weighsoft.back.v1/database_scripts/12-rollbackXeroIntegration.sql` | Database rollback |
| `Weighsoft.back.v1/app/Services/XeroAuthService.php` | OAuth flow and token management |
| `Weighsoft.back.v1/app/Services/XeroInvoiceService.php` | Invoice creation and PDF attachment |
| `Weighsoft.back.v1/app/Http/Controllers/XeroController.php` | API endpoints |
| `Weighsoft.back.v1/app/Http/Controllers/XeroCallbackController.php` | OAuth callback handler |
| `Weighsoft.back.v1/app/Models/XeroSettings.php` | Settings model with `connected` accessor |
| `Weighsoft.ui.v1/app/js/controllers/xero.js` | Frontend Xero controller |
| `Weighsoft.ui.v1/app/tpls/xero/list.html` | Frontend Xero settings template |
| `~/weighsoft/proxy.conf` (on server) | Nginx HTTPS reverse proxy config |
| `~/weighsoft/certs/` (on server) | SSL certificate and key |
| `~/weighsoft/docker-compose.yml` (on server) | Docker service definitions |
| `~/weighsoft/env.js` (on server) | Frontend environment config (base + scale URLs) |

---

## Checklist for New Deployments

### HTTPS Proxy Setup
- [ ] SSL certificate generated and placed in `~/weighsoft/certs/`
- [ ] `proxy.conf` created with `/api/`, `/scale`, `/ws/`, and `/` location blocks
- [ ] `proxy.conf` has WebSocket upgrade headers for `/ws/` location
- [ ] `docker-compose.yml` has `proxy` service with ports 80 and 443
- [ ] `docker-compose.yml` backend (`app`) uses `expose: - "80"` NOT `ports: - "5000:80"`
- [ ] `docker-compose.yml` frontend (`ui`) uses `expose: - "80"` NOT `ports: - "80:80"`
- [ ] `docker-compose.yml` Node-RED (`nodered`) uses `expose` NOT `ports: - "3000:..."`
- [ ] `env.js` uses `window.location.protocol + "//" + window.location.hostname` for BOTH `base` and `scale`
- [ ] `env.js` does NOT hardcode `http://`, `:5000`, or `:3000`
- [ ] Port 5000 is NOT accessible from outside Docker (`curl http://host:5000` should fail)
- [ ] Port 3000 is NOT accessible from outside Docker (`curl http://host:3000` should fail)
- [ ] HTTPS loads the WeighSoft login page in the browser
- [ ] API calls work through the proxy (`curl -k https://host/api/company`)
- [ ] Node-RED scale endpoint works through the proxy (`curl -k https://host/scale`)

### Xero Integration
- [ ] Xero app registered at https://developer.xero.com/app/manage
- [ ] Client ID and Client Secret noted
- [ ] OAuth 2.0 Redirect URI set to `https://<HOSTNAME>/api/xero/callback`
- [ ] Database migration `12-addXeroIntegration.sql` executed successfully
- [ ] All verification checks show checkmark
- [ ] Admin user type has `xero = 'true'` in `usertypes` table
- [ ] `.env` on server has `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REDIRECT_URI`
- [ ] `XERO_REDIRECT_URI` uses `https://` and has NO port number
- [ ] `XERO_REDIRECT_URI` exactly matches the Xero Developer Console Redirect URI
- [ ] Backend and frontend Docker images built and pushed
- [ ] `docker compose pull && docker compose up -d` run on server
- [ ] `php artisan optimize:clear` run inside the backend container
- [ ] `php artisan route:list --path=xero` shows all Xero routes
- [ ] Xero menu item visible in sidebar after login
- [ ] "Connect to Xero" flow completes and status shows "Connected"
