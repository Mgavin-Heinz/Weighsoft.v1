import { z } from 'zod';

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/;
// Inner pattern without anchors, for embedding inside larger regex patterns
const ULID_INNER = '[0-9A-HJKMNP-TV-Z]{26}';
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const TenantContextSchema = z.object({
  companyId: z.string().regex(UUID_REGEX),
  siteId: z.string().regex(UUID_REGEX),
  workstationId: z.string().regex(UUID_REGEX),
  scaleId: z.string().regex(UUID_REGEX),
});

const SourceLinksSchema = z.object({
  weighingHeaderId: z.string().regex(UUID_REGEX),
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
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: z.string().min(1),
  title: z.string().max(100),
  notes: z.string().max(1000).default(''),
});

const ReadingObservationSchema = z.object({
  readingId: z.string().regex(new RegExp(`^read:${ULID_INNER}$`)),
  sequenceTag: z.enum(['REFERENCE', 'TARE', 'GROSS']),
  numericValue: z.number().finite(),
  unit: z.string().default('kg'),
  capturedAt: z.string().datetime(),
  capturedByUserId: z.string().regex(UUID_REGEX),
  source: z.enum(['manual', 'scale']),
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

export const CertificateSchema = z.object({
  _id: z.string().regex(new RegExp(`^cert:${ULID_INNER}$`)),
  _rev: z.string().optional(),
  type: z.literal('certificate'),
  schemaVersion: z.number().int().positive(),
  certificateNo: z.string().min(1).max(50).nullable(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'FINALIZED', 'CANCELLED']),
  tenant: TenantContextSchema,
  sourceLinks: SourceLinksSchema,
  operator: OperatorSnapshotSchema,
  certificateMeta: CertificateMetaSchema,
  readings: z.array(ReadingObservationSchema).max(200),
  computed: ComputedMetricsSchema,
  workflow: WorkflowStateSchema,
  sync: SyncMetricsSchema,
  audit: AuditTrailSchema,
}).strict();

export type CertificateEntity = z.infer<typeof CertificateSchema>;
