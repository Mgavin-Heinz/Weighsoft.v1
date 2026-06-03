# Domain Entity Validation Blueprint (Zod Schema)

This document specifies the client-side runtime validation layer using Zod. It ensures data type safety, strict structure enforcement, and edge-case validation for the `Certificate` domain entity before local writes or remote replication cycles occur.

---

## 1. Architectural Strategy
By utilizing a TypeScript-first schema declaration engine (Zod), we can achieve **dual-compile-time and runtime type safety**. This schema acts as an explicit gatekeeper on mobile clients, checking raw JSON data streams from PouchDB or form inputs before passing them to state handlers or backend sync pipelines.

---

## 2. Certificate Domain Zod Schema Implementation

```typescript
import { z } from 'zod';

// --- Helper Regular Expressions ---
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// --- Sub-schemas for Nested Composition ---

const TenantContextSchema = z.object({
  companyId: z.string().regex(UUID_REGEX, { message: "Invalid Company UUID format" }),
  siteId: z.string().regex(UUID_REGEX, { message: "Invalid Site UUID format" }),
  workstationId: z.string().regex(UUID_REGEX, { message: "Invalid Workstation UUID format" }),
  scaleId: z.string().regex(UUID_REGEX, { message: "Invalid Scale UUID format" }),
});

const SourceLinksSchema = z.object({
  weighingHeaderId: z.string().regex(UUID_REGEX, { message: "Invalid Weighing Header UUID format" }),
  contractId: z.string().regex(UUID_REGEX).nullable(),
  ticketNo: z.string().min(1).max(50).nullable(),
});

const OperatorSnapshotSchema = z.object({
  createdByUserId: z.string().regex(UUID_REGEX),
  createdByNameSnapshot: z.string().min(1).max(100),
  roleSnapshot: z.string().min(1).max(50),
});

const CertificateMetaSchema = z.object({
  issuedAt: z.string().datetime().nullable(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Must be YYYY-MM-DD" }),
  templateId: z.string().min(1),
  title: z.string().max(100),
  notes: z.string().max(1000).default(""),
});

const ReadingObservationSchema = z.object({
  readingId: z.string().regex(new RegExp(`^read:${ULID_REGEX.source}$`), { message: "Invalid reading ULID format" }),
  sequenceTag: z.enum(["REFERENCE", "TARE", "GROSS"]),
  numericValue: z.number().finite(),
  unit: z.string().default("kg"),
  capturedAt: z.string().datetime(),
  capturedByUserId: z.string().regex(UUID_REGEX),
  source: z.enum(["manual", "scale"]),
});

const ComputedMetricsSchema = z.object({
  varianceValue: z.number(),
  variancePercent: z.number().min(0),
  tolerancePercent: z.number().positive(),
  withinTolerance: z.boolean(),
});

const WorkflowStateSchema = z.object({
  submittedForReviewAt: z.string().datetime().nullable(),
  submittedByUserId: z.string().regex(UUID_REGEX).nullable(),
  finalizedAt: z.string().datetime().nullable(),
  finalizedByUserId: z.string().regex(UUID_REGEX).nullable(),
  cancelledAt: z.string().datetime().nullable(),
  cancelledByUserId: z.string().regex(UUID_REGEX).nullable(),
  cancelReason: z.string().max(255).nullable(),
});

const SyncMetricsSchema = z.object({
  dirty: z.boolean().default(true),
  lastSyncedAt: z.string().datetime().nullable(),
  origin: z.string(),
  deviceId: z.string(),
});

const AuditTrailSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// --- Master Domain Entity Schema ---

export const CertificateSchema = z.object({
  _id: z.string().regex(new RegExp(`^cert:${ULID_REGEX.source}$`), { message: "Document ID must be type-prefixed ULID (cert:<ULID>)" }),
  _rev: z.string().optional(), // Managed natively by PouchDB
  type: z.literal("certificate"),
  schemaVersion: z.number().int().positive(),
  certificateNo: z.string().min(1).max(50).nullable(),
  status: z.enum(["DRAFT", "UNDER_REVIEW", "FINALIZED", "CANCELLED"]),
  tenant: TenantContextSchema,
  sourceLinks: SourceLinksSchema,
  operator: OperatorSnapshotSchema,
  certificateMeta: CertificateMetaSchema,
  readings: z.array(ReadingObservationSchema).max(200, { message: "Readings array exceeds maximum bounded performance size (200 rows)" }),
  computed: { ...ComputedMetricsSchema.shape },
  workflow: WorkflowStateSchema,
  sync: SyncMetricsSchema,
  audit: AuditTrailSchema,
}).strict(); // Enforce strict mode to strip/reject unauthorized object properties

// Extract TypeScript type inference from Zod definition
export type CertificateEntity = z.infer<typeof CertificateSchema>;