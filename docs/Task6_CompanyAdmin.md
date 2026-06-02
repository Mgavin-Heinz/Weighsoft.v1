# Task 6: Requirements Specification – "Company Admin" Improvement

## 1) Purpose
The purpose of this improvement is to decentralize system administration within the Weighsoft ecosystem. Currently, administrative changes (such as managing users, configuring site parameters, and reviewing logs) require global super-administrator intervention. This feature introduces a secure, self-service **Company Administrator Dashboard** allowing enterprise clients to manage their own users, assign platform operators to specific yards, and adjust local weighing preferences without exposing data from other tenants.

## 2) Scope
* **In-Scope (Release 1):**
  * Self-service client user management (invite, edit status, toggle operator/admin roles).
  * Yard/Site profile configuration (assigning human-readable names and localized metadata to physical scale structures).
  * Enforcement of strict multi-tenant boundary parameters at the database, API, and UI routing layers.
  * Localized administrative action log capture (audit trail of who changed what inside the company profile).
* **Out-of-Scope:**
  * Global system configuration (modifying primary scale drivers or master integration hooks).
  * Cross-tenant data modifications or multi-company aggregations.
  * Custom white-label billing structures or localized currency modifications.

## 3) Comparison of Architectural Approaches (AI Evaluation)
To enforce multi-tenant separation safely within the current Laravel 8 backend, two architectural implementation approaches were evaluated:

| Feature/Metric | Option A: Global Query Scoping via Tenant Middleware | Option B: Controller-Level Context Extraction (Recommended) |
| :--- | :--- | :--- |
| **Description** | Intercepts every API request via a global Laravel middleware layer that automatically injects a `where('company_id', $tenantId)` clause into all Eloquent database operations. | Extracts tenant identity directly inside the `JwtAuthController` base constructor and requires domain services to pass explicit binary corporate identifier keys. |
| **Pros** | High abstraction; developers cannot easily forget to apply tenant filters on new endpoints. | Minimizes risks with raw SQL queries; integrates cleanly with current heavy service architectures (`WeighingHeaderService`) utilizing raw queries and `UUID_TO_BIN` masks. |
| **Cons** | Fails to catch or automatically patch raw, hand-written SQL queries that bypass Eloquent models entirely. | Requires explicit parameters to be mapped across controllers, demanding strict unit test verification during code additions. |

**Final Recommendation:** **Option B** is chosen. Because your backend relies heavily on custom SQL optimization strings and manual binary UUID transformations rather than standard Eloquent configurations, global Eloquent model scopes pose an operational risk of data leakage. Explicit context handling inside a centralized controller inheritance model ensures full visibility and programmatic control.

## 4) User Roles & Permissions
This modification extends the existing security framework by establishing a clear distinction between three user hierarchies:
* `Super Admin`: Full cross-tenant read/write utility across all system databases.
* `Company Admin` (New): Full read/write capability restricted exclusively to data tables matching their corporate token.
* `Platform Operator`: Standard transactional execution rights (running weighing flows, scale reading); zero dashboard entry authorization.

### New Permission Flags:
* `tenant_user_manage`: Grants authority to invite and modify roster assignments.
* `tenant_site_configure`: Authorization to rename sites and update geofence coordinates.
* `tenant_audit_view`: Access to administrative change history pipelines.

## 5) Core User Stories

### User Story 1: Self-Service Personnel Provisioning
**As a** Company Administrator  
**I want to** create new user accounts and assign them roles for my company  
**So that** I don't have to wait for global support teams to register new weighbridge operators.

### User Story 2: Platform Asset Control
**As a** Multi-Site Company Administrator  
**I want to** update operational hours and location settings for specific scale yards  
**So that** localized transport tickets print the correct site metadata automatically.

### User Story 3: Internal Accountability Inspections
**As a** Security Compliance Officer  
**I want to** view a timeline of operational role elevations and roster removals  
**So that** internal compliance investigations can verify unauthorized operational adjustments.

## 6) Functional Requirements

### FR1: Tenant Personnel Registration
* The system shall allow Company Admins to create new operator user records.
* The system must automatically append the active Admin's `company_id` to the newly generated profile payload.
* The application shall reject any attempt by an Admin to promote a user to `Super Admin` status.

### FR2: Yard & Site Metadata Management
* Company Admins shall be permitted to edit configurations for linked yard entities.
* Modifiable properties include localized phone records, operational boundaries, and human-readable yard designations.

### FR3: Administrative Log Visualization
* The dashboard must present a read-only historical feed detailing record insertions, updates, or soft deletes executed within the tenant environment.

## 7) Data Requirements (Proposed)
To maintain structural styling parity, all primary and foreign key references must align with the binary execution format strategy:

### Table Modifications: `users`
* Ensure an indexed `company_id` column exists as a `BINARY(16)` type to enforce foreign-key relationships to the master enterprise database tables.

### New Table: `tenant_audit_logs`
* `id`: `BINARY(16)` (Primary Key via `UUID_TO_BIN`)
* `company_id`: `BINARY(16)` (Indexed tenant key)
* `actor_id`: `BINARY(16)` (The user executing the configuration update)
* `action_event`: `VARCHAR(100)` (e.g., `USER_ROLE_PROMOTED`, `YARD_METADATA_UPDATED`)
* `payload_diff`: `TEXT` / `JSON` (Snapshot records tracking field changes)
* `created_at`: `TIMESTAMP` (High-precision tracking record)

## 8) API Requirements (Proposed)
All requests must pass validation checks through the extended authentication layer:
* `GET /api/company/users` - Fetches personnel matching the active token parameters.
* `POST /api/company/users` - Adds an operator to the organization profile.
* `PUT /api/company/users/{id}/role` - Modifies localized access permissions.
* `PUT /api/company/sites/{id}` - Updates yard properties (rejects execution if the binary ID string doesn't match the caller's organization path).
* `GET /api/company/audit-logs` - Pulls historical tracking events.

## 9) UI Requirements (AngularJS 1.4)
The implementation will introduce a new standalone structural path inside `routes.js`:
* State entry: `app.company_management.users` and `app.company_management.sites`.
* Navigation linking: Condition hooks inside `$menuItems.prepareSidebarMenu` must inspect token attributes to display the administration module link *only* to verified managers.
* Components: Employs standard table displays with status badges (`Active`, `Suspended`), custom edit panels, and inline permission selector systems.

## 10) Multi-Tenant Validation & Boundary Rules
* **ID Bleed Prevention:** The backend API must cross-examine target asset strings against account ownership attributes during every write operation. If a user tries to access `PUT /api/company/sites/{id}` with an asset ID belonging to another company, the API must throw a `403 Forbidden` error.
* **Scope Locking:** The payload parameter binding layer must strip incoming custom `company_id` injections on write calls. The database value must be assigned strictly by server-side session contexts derived from the JWT payload.

## 11) Non-Functional Requirements
* **Data Security & Privacy:** Access tokens must pass encryption checks over HTTPS. No corporate identifiers or cross-tenant query criteria may be exposed within plain-text client URIs.
* **Audit Compliance:** Rows written to the tracking database table (`tenant_audit_logs`) must be immutable. The API must expose zero routes for updating or removing log rows.

## 12) Acceptance Criteria
* **Verification 1:** A logged-in Company Admin can create a new Operator account, log out, and verify that the new Operator can sign in successfully using their new credentials.
* **Verification 2:** If a Company Admin manually alters an API payload to reference an explicit foreign asset key belonging to an external firm, the backend must block the write action, maintain data integrity, and record a security alert.
* **Verification 3:** Modifying user details or roles must write a corresponding entry to the tracking timeline database within `1.5 seconds` of execution.

## 13) Open / Unclear Areas To Confirm
* **User Sharing Boundaries:** Can an independent contract operator be linked to multiple separate companies simultaneously, or must a user account exist strictly within one company record?
* **Sub-Tenant Scoping:** Do large enterprise clients require layered subdivisions (e.g., Regional Admins managing multiple yards, vs Yard Admins managing a single platform)?