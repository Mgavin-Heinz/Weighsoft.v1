# Task 8: Local Storage Schema & Validation Risk Assessment

This document specifies the local-first document storage schema and structural constraints using PouchDB for managing offline certificate composition and synchronization routines.

---

## 1. Architectural Strategy & Document Modeling

For local document operations, a single-document aggregation design is used. Each certificate instance represents an isolated, atomic boundary. Subordinate records, such as physical scale measurements, are embedded directly as elements inside an internal array payload. This pattern minimizes index lookups and eliminates multi-document transaction constraints during offline workflows.

### 1.1 Document Types & Discriminators
To ensure high-performance querying inside a single PouchDB partition instance, two distinct document categories are established via a `type` discriminator attribute:
* `certificate`: Standard operational document processing transactional metadata, weight observations, and verification variables.
* `certificate_event` (Optional): Append-only lifecycle tracking tokens used to build immutable internal auditing histories when tracing offline data entry.

---

## 2. Core Certificate Schema Definition (JSON)

Below is the structured data definition for a standard `certificate` document archetype:

```json
{
  "_id": "cert:01JX9V9W9WJ8G9Q9X6Q7D9A1B2",
  "type": "certificate",
  "schemaVersion": 1,
  "certificateNo": null,
  "status": "DRAFT",
  "tenant": {
    "companyId": "3b2da874-bc54-4f4c-833d-cd36c4af773a",
    "siteId": "8db014f4-835d-4fc1-a262-10338216c60b",
    "workstationId": "0a8c7a74-8770-4d19-95db-377016817519",
    "scaleId": "fa9d4c8a-8c33-4fca-a262-cd36c4af773a"
  },
  "sourceLinks": {
    "weighingHeaderId": "7217b82a-fa9d-4c8a-8c33-dcd36c4af773",
    "contractId": null,
    "ticketNo": null
  },
  "operator": {
    "createdByUserId": "835d1e20-4057-4fc1-a262-10338216c60b",
    "createdByNameSnapshot": "Jane Doe",
    "roleSnapshot": "Platform Operator"
  },
  "certificateMeta": {
    "issuedAt": null,
    "effectiveDate": "2026-06-02",
    "templateId": "default-v1",
    "title": "Scale Verification Certificate",
    "notes": ""
  },
  "readings": [
    {
      "readingId": "read:01JX9VA000M8G9Q9X6Q7D9A1B1",
      "sequenceTag": "REFERENCE",
      "numericValue": 10000.0,
      "unit": "kg",
      "capturedAt": "2026-06-02T12:00:00.000Z",
      "capturedByUserId": "835d1e20-4057-4fc1-a262-10338216c60b",
      "source": "manual"
    },
    {
      "readingId": "read:01JX9VB000M8G9Q9X6Q7D9A1B2",
      "sequenceTag": "GROSS",
      "numericValue": 10005.0,
      "unit": "kg",
      "capturedAt": "2026-06-02T12:00:05.000Z",
      "capturedByUserId": "835d1e20-4057-4fc1-a262-10338216c60b",
      "source": "scale"
    }
  ],
  "computed": {
    "varianceValue": 5.0,
    "variancePercent": 0.05,
    "tolerancePercent": 0.1,
    "withinTolerance": true
  },
  "workflow": {
    "submittedForReviewAt": null,
    "submittedByUserId": null,
    "finalizedAt": null,
    "finalizedByUserId": null,
    "cancelledAt": null,
    "cancelledByUserId": null,
    "cancelReason": null
  },
  "sync": {
    "dirty": true,
    "lastSyncedAt": null,
    "origin": "mobile-app",
    "deviceId": "device-123"
  },
  "audit": {
    "createdAt": "2026-06-02T11:58:00.000Z",
    "updatedAt": "2026-06-02T12:00:05.000Z"
  }
}