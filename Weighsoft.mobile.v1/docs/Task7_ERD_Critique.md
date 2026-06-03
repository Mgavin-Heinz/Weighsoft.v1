# Task 7: Database Schema & Structural Architecture Critique

This document provides the formal structural specifications and an architectural critique of the relational database model managing multi-tenant operations, user authentication, and compliance readings.

---

## 1. Entity Dictionary & Schema Blueprint

To remain fully compatible with the high-performance constraints of the `Weighsoft.back.v1` Laravel API backend, all primary and foreign key relational identifiers are designed to utilize a `BINARY(16)` structural format (processed via `UUID_TO_BIN` and `BIN_TO_UUID`) rather than standard variable text strings.

### 1.1 Table: `companies`
Represents the core tenant accounts within the ecosystem.
* **`id`** (`BINARY(16)`, Primary Key): Unique cryptographic token identifying the corporate entity.
* **`name`** (`VARCHAR(150)`): The official commercial name of the client enterprise.
* **`created_at`** (`TIMESTAMP`): High-precision audit creation marker.

### 1.2 Table: `users`
System accounts authorized to authenticate against backend API endpoints.
* **`id`** (`BINARY(16)`, Primary Key): Unique cryptographic identifier.
* **`name`** (`VARCHAR(100)`): Display or legal name of the user.
* **`email`** (`VARCHAR(255)`, Unique): The unique email address used for login authentication.
* **`password_hash`** (`VARCHAR(255)`): Securely hashed password string enforcing access control.

### 1.3 Table: `memberships`
A bridge table resolving the many-to-many relationship between users and companies, enabling an operator to hold explicit permission profiles across separate business tenants.
* **`id`** (`BINARY(16)`, Primary Key): Bridge row identifier.
* **`user_id`** (`BINARY(16)`, Foreign Key): References `users.id`.
* **`company_id`** (`BINARY(16)`, Foreign Key): References `companies.id`.
* **`role`** (`VARCHAR(50)`): The functional access authorization tier (e.g., `Platform Operator`, `Company Admin`).

### 1.4 Table: `certificates`
Compliance assertions generated during weighbridge verification operations.
* **`id`** (`BINARY(16)`, Primary Key): Document identifier.
* **`certificate_no`** (`VARCHAR(50)`, Nullable): Legal tracking number stamped only upon finalization.
* **`status`** (`VARCHAR(30)`): Document state lifecycle step (e.g., `DRAFT`, `UNDER_REVIEW`, `FINALIZED`).
* **`company_id`** (`BINARY(16)`, Foreign Key): References `companies.id`.
* **`created_by`** (`BINARY(16)`, Foreign Key): References `users.id` to track the document author.

### 1.5 Table: `readings`
Individual data rows containing raw weight values captured during scale verification loops.
* **`id`** (`BINARY(16)`, Primary Key): Reading entry key.
* **`certificate_id`** (`BINARY(16)`, Foreign Key): References `certificates.id`.
* **`numeric_value`** (`DECIMAL(10,2)`): Precision structural column storing physical weights.
* **`sequence_tag`** (`VARCHAR(20)`): Context marker identifying the type of reading (e.g., `TARE`, `GROSS`, `REFERENCE`).

---

## 2. Architectural Critique & Structural Optimizations (AI Evaluation)

An architectural review of this relational data layout highlights three hidden structural vulnerabilities that could compromise data integrity or tracking performance if deployed unchanged:

### 2.1 Lack of Physical Hardware Asset Context
* **The Vulnerability:** While `readings` roll up to a parent `certificate` record owned by a specific `company`, the schema does not track the actual physical scale asset, platform, or workstation node where the values were captured. In multi-bridge yards, this leaves a significant blind spot.
* **The Remediation:** Introduce a standalone `weighbridge_scales` table. Inject an indexed `scale_id` foreign key column directly into the `readings` table (and optionally the `certificates` table) to guarantee physical device traceability.

### 2.2 Relational Decay via User Membership Purges
* **The Vulnerability:** If an operator leaves a company, administrators routinely truncate or delete their row from the `memberships` table. Because `certificates` maps its author tracking data directly to `users.id` via `created_by`, hard-deleting users or modifying profiles can drop constraint links, resulting in orphan document records or broken compliance histories.
* **The Remediation:** Enforce a strict soft-delete policy (`deleted_at` timestamps) across the `users` and `memberships` tables. Alternatively, clone the inspector’s full name as an immutable plain-text snapshot string inside the `certificates` row at the moment of finalization.

### 2.3 Isolation From Core Commercial Transactions
* **The Vulnerability:** The schema isolates compliance verification certificates from daily commercial weighbridge tickets. Without an explicit link, it is highly challenging to cross-reference which real-world logistics or trade transaction necessitated a specific calibration verification document.
* **The Remediation:** Add a nullable `weighing_header_id` binary field to the `certificates` table. This maps the administrative compliance data directly onto the core transactional tables of the existing `Weighsoft` backend framework.