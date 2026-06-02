Requirements Specification: Certificate Drafts Feature
1) Purpose
Enable users to create, save, edit, preview, and finalize Certificate Drafts before issuing a formal certificate tied to a weighing transaction (or related business record).
This reduces errors, supports review/approval workflows, and provides traceability for changes made before final issuance.

2) Scope
In scope:
Draft lifecycle management (Draft -> Under Review -> Finalized / Cancelled)
Draft autosave and manual save
Version history / audit trail
Template-based certificate content
Print/PDF preview before finalization
Out of scope (for first release):
External e-signature providers
Multi-stage legal approval workflows beyond basic role checks
Bulk draft generation
3) Fit with Current Architecture
Based on your codebase:

Frontend: AngularJS state + controller pattern (Weighsoft.ui.v1)
Backend: Laravel resource/controller + service pattern (Weighsoft.back.v1)
Existing printing/ticket patterns (reprint, print templates) can be reused.
Existing auth/role model (auth:api, UserType permissions) should gate draft actions.
Suggested placement:

UI route(s) under operations/reporting area (similar to reprint/reporting pages)
Backend REST endpoints under /api/certificates/*
Service-layer handling for validation, state transitions, and audit records
4) User Roles & Permissions
Minimum permissions (new flags in role/permission model):

certificate_drafts_view
certificate_drafts_create
certificate_drafts_edit_own / certificate_drafts_edit_all
certificate_drafts_finalize
certificate_drafts_cancel
certificate_drafts_print
Rules:

Creator can edit while status is Draft.
Only authorized reviewers/finalizers can move to Finalized.
Finalized records become immutable (except admin void/correction flow).
5) Core User Stories
Create Draft
As an operator/admin, I can create a certificate draft from a transaction so I can prepare certificate details before issuing.

Save and Resume Draft
As a user, I can save a draft and continue later without losing data.

Review Draft Changes
As a reviewer, I can see who changed what and when, before finalization.

Finalize Certificate
As an authorized user, I can finalize a draft so it becomes an issued certificate with a unique certificate number.

Preview/Print Before Finalization
As a user, I can preview printable output from a draft to catch layout/content issues early.

6) Functional Requirements
FR1 Draft Creation

System allows draft creation from:
existing weighing header/transaction, or
manual entry with required references.
Draft receives unique draft_no (human-readable) and internal UUID/id.
FR2 Draft Editing

Editable fields include certificate metadata (customer, product, net/gross, date, notes, custom fields).
Validation occurs on save and finalize (stricter on finalize).
FR3 Draft Status Flow

Allowed transitions:
Draft -> Under Review
Under Review -> Draft (with reason)
Under Review -> Finalized
Draft|Under Review -> Cancelled (with reason)
Invalid transitions are rejected.
FR4 Versioning / Audit

Every save stores:
editor, timestamp, changed fields (or snapshot diff).
UI shows timeline/history.
FR5 Finalization

On finalize:
lock content
assign immutable certificate_no
generate final printable payload/PDF snapshot
retain source draft history
FR6 Search/List

List with filters:
status, date range, company/site/workstation, creator, customer, certificate no/draft no.
Pagination and sort, consistent with existing API list patterns.
FR7 Preview & Print

Draft preview uses existing print template strategy.
Printed output marks watermark DRAFT unless finalized.
FR8 Traceability Link

Draft must link to source transaction(s) where applicable (e.g., weighing header id).
7) Data Requirements (Proposed)
Primary entity: certificate_drafts

id (UUID/binary UUID, align with backend conventions)
draft_no
certificate_no (nullable until finalized)
status (DRAFT, UNDER_REVIEW, FINALIZED, CANCELLED)
company_id, site_id, workstation_id
weighing_header_id (nullable)
payload_json (certificate body fields)
created_by, updated_by, finalized_by (nullable), cancelled_by (nullable)
finalized_at, cancelled_at, cancel_reason
timestamps + soft delete (if needed)
Audit entity: certificate_draft_revisions

id, certificate_draft_id
revision_no
changed_by, changed_at
change_summary or delta_json
snapshot_json
8) API Requirements (Proposed)
GET /api/certificate-drafts (list/filter/paginate)
POST /api/certificate-drafts (create)
GET /api/certificate-drafts/{id} (detail)
PUT /api/certificate-drafts/{id} (edit while editable)
POST /api/certificate-drafts/{id}/submit-review
POST /api/certificate-drafts/{id}/return-draft
POST /api/certificate-drafts/{id}/finalize
POST /api/certificate-drafts/{id}/cancel
GET /api/certificate-drafts/{id}/revisions
GET /api/certificate-drafts/{id}/print-preview
Response conventions should match existing API style (status, message, data payloads, consistent error codes).

9) UI Requirements (AngularJS)
New state(s) in routing:
app.certificate_drafts (list)
app.certificate_drafts_create
app.certificate_drafts_edit
Reuse existing patterns:
Restangular for API
loading/error handlers ($rootScope.Start, Loaded, Error)
permission-based menu visibility ($menuItems.prepareSidebarMenu)
Key screens:
Draft list (filter + status badges)
Draft editor form
Revision history drawer/panel
Preview/print modal/view
10) Validation Rules (Minimum)
Required on create/save:
company/site context
at least one reference field (transaction id or manual reference id)
Required on finalize:
all mandatory certificate fields present
linked transaction exists and is accessible
status must be UNDER_REVIEW (or configurable)
Business constraints:
no edits after finalize
cancelled drafts cannot be finalized
11) Non-Functional Requirements
Security: enforce JWT auth and role permissions on every endpoint.
Auditability: revision and status transitions must be non-repudiable.
Performance: list endpoint target <2s for typical filtered queries.
Reliability: no data loss on partial update failures (transaction-wrapped writes).
Usability: autosave every N seconds + unsaved changes warning.
12) Acceptance Criteria (Release 1)
User can create/save draft and reopen later with all data intact.
User with finalize permission can finalize only valid draft states.
Finalized certificate gets immutable number and can be printed without draft watermark.
Draft print preview clearly marked as draft.
Revision history is visible and includes actor + timestamp.
Permission checks block unauthorized create/edit/finalize actions.
Filters return correct subsets by status/date/company/site.
13) Open / Unclear Areas To Confirm
Certificate type(s): single generic certificate vs multiple templates (quality, delivery, compliance).
Numbering scheme: per company/site/year? configurable prefix?
Approval model: is Under Review enough, or do you need multi-approver chain?
Edit policy post-finalization: fully locked vs correction amendment flow.
Source linkage: one certificate per weighing header, or can it aggregate multiple transactions?
PDF storage strategy: store rendered PDF blob vs regenerate on-demand.
Legal metadata: required signatures/stamps/disclaimers per jurisdiction.