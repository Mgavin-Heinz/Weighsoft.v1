# Technical Documentation: CertificateRepository

**Feature:** Certificate data layer  
**File:** `Weighsoft.mobile.v1/src/CertificateRepository.ts`  
**Related files:** `CertificateSchema.ts`, `CertificateRepository.test.ts`  
**Task:** 27  
**AI usage:** Used AI to help convert implementation notes into structured documentation. All technical content verified against the actual source code.

---

## Overview

`CertificateRepository` is the data access layer for weighing certificates in the Weighsoft mobile app. It wraps PouchDB — an offline-first database that stores documents locally on the device and syncs to the server when a connection is available.

The repository handles all reading and writing of certificate documents so that the rest of the app (screens, hooks, forms) never talks to PouchDB directly. This keeps data access logic in one place and makes it easy to test.

---

## Why PouchDB?

Weighbridge operators often work in environments with unreliable internet — remote mines, farms, and quarries. PouchDB solves this by:

- Storing all data locally on the device first
- Marking records as `dirty` when they have unsynced changes
- Syncing to the server (CouchDB or a compatible API) when a connection is available
- Handling conflicts when two devices edit the same record offline

The `CertificateRepository` sits on top of PouchDB and adds validation, business rules, and a clean API so the rest of the app doesn't need to think about how PouchDB works.

---

## Certificate Status Lifecycle

Every certificate moves through a fixed set of statuses. The repository enforces that only valid transitions are allowed:

```
          ┌─────────────────────────────┐
          │                             │
  ┌───────▼──────┐             ┌────────▼───────┐
  │    DRAFT     │────────────►│  UNDER_REVIEW  │
  └──────────────┘             └────────┬───────┘
          │                             │
          │                    ┌────────▼───────┐
          │                    │   FINALIZED    │
          │                    └────────────────┘
          │
  ┌───────▼──────┐
  │  CANCELLED   │◄── from DRAFT or UNDER_REVIEW
  └──────────────┘
```

| From | To | Who can do it |
|---|---|---|
| DRAFT | UNDER_REVIEW | Operator or Admin |
| DRAFT | CANCELLED | Admin only |
| UNDER_REVIEW | DRAFT | Admin (send back for corrections) |
| UNDER_REVIEW | FINALIZED | Admin only |
| UNDER_REVIEW | CANCELLED | Admin only |
| FINALIZED | (nothing) | Immutable |
| CANCELLED | (nothing) | Immutable |

Attempting any other transition throws `InvalidStatusTransitionError`.

---

## Setup

```typescript
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { CertificateRepository } from './CertificateRepository';
import type { CertificateEntity } from './CertificateSchema';

PouchDB.plugin(PouchDBFind);

const db = new PouchDB<CertificateEntity>('certificates');
const repo = new CertificateRepository(db);
```

Optional configuration:

```typescript
// Increase conflict retries for high-traffic sites
const repo = new CertificateRepository(db, { maxConflictRetries: 5 });
```

---

## API Reference

### `create(input)`

Saves a new certificate. Automatically stamps `type`, `sync.dirty = true`, and `audit.createdAt` / `audit.updatedAt`.

```typescript
const response = await repo.create({
  _id: 'cert:01HZQR7NTMVW3KXY2PABCDEFGH',
  status: 'DRAFT',
  // ... all required fields
});
// response.ok === true
```

**Throws:**
- `CertificateValidationError` — if the input fails Zod schema validation
- `CertificateConflictError` — if a document with the same `_id` already exists

---

### `findById(id)`

Fetches a single certificate by its `_id`. Validates the document against the Zod schema on the way out.

```typescript
const cert = await repo.findById('cert:01HZQR7NTMVW3KXY2PABCDEFGH');
console.log(cert.status); // 'DRAFT'
```

**Throws:**
- `CertificateNotFoundError` — if no document with that id exists

---

### `exists(id)`

Returns `true` if a certificate with that id exists, `false` if not. Does not throw.

```typescript
const exists = await repo.exists('cert:01HZQR7NTMVW3KXY2PABCDEFGH');
```

---

### `list(filter?)`

Returns a paginated list of certificates matching the optional filter.

```typescript
// All certificates for a company
const result = await repo.list({ companyId: 'uuid-here' });

// Only drafts, paginated
const result = await repo.list({
  status: 'DRAFT',
  limit: 20,
  skip: 0,
});

// Only unsynced certificates
const result = await repo.list({ dirty: true });

console.log(result.rows);  // CertificateEntity[]
console.log(result.total); // number
```

**Filter options:**

| Field | Type | Description |
|---|---|---|
| `companyId` | `string` | Filter by tenant company |
| `siteId` | `string` | Filter by site |
| `status` | `CertificateStatus` | Filter by status |
| `dirty` | `boolean` | Filter by sync state |
| `limit` | `number` | Max results (default 50) |
| `skip` | `number` | Offset for pagination (default 0) |

---

### `update(id, patch)`

Applies a partial patch to an existing certificate. Deep-merges nested objects so you only need to provide the fields you want to change. Automatically sets `sync.dirty = true` and updates `audit.updatedAt`.

Retries automatically up to `maxConflictRetries` times if another device has updated the same document simultaneously (PouchDB 409 conflict).

```typescript
// Update just the certificate title
await repo.update(certId, {
  certificateMeta: {
    ...cert.certificateMeta,
    title: 'Updated Title',
  },
});
```

**Throws:**
- `CertificateNotFoundError` — if the id doesn't exist
- `InvalidStatusTransitionError` — if trying to edit a FINALIZED or CANCELLED cert
- `CertificateConflictError` — if conflicts persist after all retries

---

### `transitionStatus(id, nextStatus, actorUserId, reason?)`

Moves a certificate to a new status. Validates the transition is allowed, records who did it and when in the `workflow` field.

```typescript
// Submit for review
await repo.transitionStatus(certId, 'UNDER_REVIEW', userId);

// Finalise
await repo.transitionStatus(certId, 'FINALIZED', adminUserId);

// Cancel with a reason
await repo.transitionStatus(certId, 'CANCELLED', adminUserId, 'Data entry error');
```

**What gets recorded per transition:**

| Transition | Fields set |
|---|---|
| → UNDER_REVIEW | `workflow.submittedForReviewAt`, `workflow.submittedByUserId` |
| → FINALIZED | `workflow.finalizedAt`, `workflow.finalizedByUserId` |
| → CANCELLED | `workflow.cancelledAt`, `workflow.cancelledByUserId`, `workflow.cancelReason` |

**Throws:**
- `InvalidStatusTransitionError` — if the transition is not allowed
- `CertificateNotFoundError` — if the id doesn't exist

---

### `softDelete(id, actorUserId, reason?)`

Marks a certificate as CANCELLED. The document is **not** removed from PouchDB — it stays so that the cancellation can sync to the server and other devices.

```typescript
await repo.softDelete(certId, adminUserId, 'Duplicate entry');
```

Use this instead of hard delete in all production code.

---

### `markSynced(id, syncedAtIso?)`

Clears the `sync.dirty` flag after a certificate has been successfully uploaded to the server.

```typescript
await repo.markSynced(certId, new Date().toISOString());
```

---

### `hardDeleteForTesting(id)`

⚠️ **Test use only.** Physically removes the document from PouchDB. Do not call this in production code.

```typescript
await repo.hardDeleteForTesting(certId);
```

---

## Error Reference

| Error class | When thrown | Has property |
|---|---|---|
| `CertificateNotFoundError` | `findById`, `update`, `transitionStatus` with unknown id | `id: string` |
| `CertificateConflictError` | `create` with duplicate id, or unresolvable update conflict | `id: string` |
| `CertificateValidationError` | Any write where the document fails Zod schema | `issues: ZodIssue[]` |
| `InvalidStatusTransitionError` | `transitionStatus` with a disallowed move, or editing immutable cert | `from`, `to: CertificateStatus` |

All errors extend `Error` and have a descriptive `.message` property.

---

## Offline Sync Behaviour

The repository uses `sync.dirty` to track which documents need to be uploaded:

- **`dirty: true`** — the document has local changes that haven't reached the server yet
- **`dirty: false`** — the document is in sync with the server

Every `create()` and `update()` call automatically sets `dirty: true`. The sync service (outside the scope of this class) is responsible for uploading dirty documents and calling `markSynced()` when successful.

---

## Tests

31 unit tests covering all methods and edge cases. Run with:

```bash
cd Weighsoft.mobile.v1
npm test
```

Key test scenarios:
- Create, read, update, delete happy paths
- Duplicate id conflict on create
- All valid and invalid status transitions
- Immutability of FINALIZED and CANCELLED certs
- Dirty flag behaviour across operations
- Pagination in `list()`
- Filter combinations in `list()`
