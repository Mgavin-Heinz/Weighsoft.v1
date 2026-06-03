import PouchDB from 'pouchdb';
import { z } from 'zod';
import { CertificateSchema, type CertificateEntity } from './CertificateSchema';

// ─── Types ────────────────────────────────────────────────────────────────────

type CertificateStatus = CertificateEntity['status'];

const CERTIFICATE_TYPE = 'certificate' as const;

/** Which status transitions are permitted */
const ALLOWED_TRANSITIONS: Record<CertificateStatus, CertificateStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['DRAFT', 'FINALIZED', 'CANCELLED'],
  FINALIZED: [],
  CANCELLED: [],
};

// ─── Custom Errors ────────────────────────────────────────────────────────────

export class CertificateNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Certificate not found: ${id}`);
    this.name = 'CertificateNotFoundError';
  }
}

export class CertificateConflictError extends Error {
  constructor(public readonly id: string, message = 'Conflict updating certificate') {
    super(message);
    this.name = 'CertificateConflictError';
  }
}

export class CertificateValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super('Certificate validation failed: ' + issues.map((i) => i.message).join(', '));
    this.name = 'CertificateValidationError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly from: CertificateStatus,
    public readonly to: CertificateStatus,
  ) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

// ─── Filter / Result interfaces ───────────────────────────────────────────────

export interface ListCertificatesFilter {
  companyId?: string;
  siteId?: string;
  status?: CertificateStatus;
  dirty?: boolean;
  limit?: number;
  skip?: number;
}

export interface ListCertificatesResult {
  rows: CertificateEntity[];
  total: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * CertificateRepository
 *
 * Wraps PouchDB with:
 *  - Zod validation on every read and write
 *  - Status-transition enforcement
 *  - Automatic audit timestamps (createdAt / updatedAt)
 *  - Conflict-retry loop for concurrent offline updates
 *  - Soft-delete via CANCELLED status (hard delete only for tests)
 */
export class CertificateRepository {
  private readonly db: PouchDB.Database<CertificateEntity>;
  private readonly maxConflictRetries: number;

  constructor(
    pouchDbInstance: PouchDB.Database<CertificateEntity>,
    options?: { maxConflictRetries?: number },
  ) {
    this.db = pouchDbInstance;
    this.maxConflictRetries = options?.maxConflictRetries ?? 3;
  }

  // ── CREATE ──────────────────────────────────────────────────────────────────

  /**
   * Persist a new certificate document.
   * Stamps type, dirty flag, and audit timestamps automatically.
   * Throws CertificateConflictError if a doc with the same _id already exists.
   * Throws CertificateValidationError if the input fails the Zod schema.
   */
  async create(input: CertificateEntity): Promise<PouchDB.Core.Response> {
    const now = new Date().toISOString();
    const validated = this.parseOrThrow({
      ...input,
      type: CERTIFICATE_TYPE,
      sync: { ...input.sync, dirty: true },
      audit: {
        createdAt: input.audit?.createdAt ?? now,
        updatedAt: now,
      },
    });

    try {
      return await this.db.put(validated);
    } catch (err: any) {
      if (err?.status === 409) {
        throw new CertificateConflictError(validated._id, 'Certificate already exists');
      }
      throw err;
    }
  }

  // ── READ ────────────────────────────────────────────────────────────────────

  /**
   * Fetch and validate a single certificate by its _id.
   * Throws CertificateNotFoundError if missing.
   */
  async findById(id: string): Promise<CertificateEntity> {
    const doc = await this.getRawById(id);
    return this.parseOrThrow(doc);
  }

  /**
   * Returns true if a certificate with this id exists (not deleted/missing).
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.db.get(id);
      return true;
    } catch (err: any) {
      if (err?.status === 404) return false;
      throw err;
    }
  }

  /**
   * List certificates with optional filters.
   * Results are sorted newest-updated-first.
   */
  async list(filter: ListCertificatesFilter = {}): Promise<ListCertificatesResult> {
    const selector: Record<string, any> = { type: CERTIFICATE_TYPE };

    if (filter.companyId) selector['tenant.companyId'] = filter.companyId;
    if (filter.siteId) selector['tenant.siteId'] = filter.siteId;
    if (filter.status) selector['status'] = filter.status;
    if (typeof filter.dirty === 'boolean') selector['sync.dirty'] = filter.dirty;

    const result = await (this.db as any).find({
      selector,
      limit: filter.limit ?? 50,
      skip: filter.skip ?? 0,
    });

    const rows = (result.docs as CertificateEntity[]).map((d) => this.parseOrThrow(d));
    return { rows, total: rows.length };
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────

  /**
   * Merge a partial patch into an existing certificate.
   * Retries automatically on PouchDB 409 conflicts (offline sync race).
   */
  async update(
    id: string,
    patch: Partial<CertificateEntity>,
  ): Promise<PouchDB.Core.Response> {
    return this.withConflictRetry(id, async (current) => {
      const merged = this.mergeForUpdate(current, patch);
      const validated = this.parseOrThrow(merged);
      return this.db.put(validated);
    });
  }

  /**
   * Advance a certificate through its workflow state machine.
   * Automatically records who made the transition and when.
   * Throws InvalidStatusTransitionError for disallowed moves.
   */
  async transitionStatus(
    id: string,
    nextStatus: CertificateStatus,
    actorUserId: string,
    reason?: string,
  ): Promise<PouchDB.Core.Response> {
    return this.withConflictRetry(id, async (current) => {
      this.assertTransitionAllowed(current.status, nextStatus);
      const now = new Date().toISOString();
      const workflowPatch: Partial<CertificateEntity['workflow']> = {};

      if (nextStatus === 'UNDER_REVIEW') {
        workflowPatch.submittedForReviewAt = now;
        workflowPatch.submittedByUserId = actorUserId;
      } else if (nextStatus === 'FINALIZED') {
        workflowPatch.finalizedAt = now;
        workflowPatch.finalizedByUserId = actorUserId;
      } else if (nextStatus === 'CANCELLED') {
        workflowPatch.cancelledAt = now;
        workflowPatch.cancelledByUserId = actorUserId;
        workflowPatch.cancelReason = reason ?? null;
      }

      const merged = this.mergeForUpdate(current, {
        status: nextStatus,
        workflow: { ...current.workflow, ...workflowPatch },
      });

      return this.db.put(this.parseOrThrow(merged));
    });
  }

  /**
   * Mark a certificate's sync.dirty flag as false once it has been
   * successfully uploaded to the server.
   */
  async markSynced(
    id: string,
    syncedAtIso = new Date().toISOString(),
  ): Promise<PouchDB.Core.Response> {
    return this.update(id, {
      sync: {
        dirty: false,
        lastSyncedAt: syncedAtIso,
      } as CertificateEntity['sync'],
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────

  /**
   * Soft-delete: transitions the certificate to CANCELLED status.
   * The document remains in PouchDB so offline sync still propagates the deletion.
   */
  async softDelete(
    id: string,
    actorUserId: string,
    reason?: string,
  ): Promise<PouchDB.Core.Response> {
    return this.transitionStatus(id, 'CANCELLED', actorUserId, reason);
  }

  /**
   * Hard-delete: physically removes the document from PouchDB.
   * Only for use in tests — do NOT call in production code.
   */
  async hardDeleteForTesting(id: string): Promise<PouchDB.Core.Response> {
    const doc = await this.getRawById(id);
    if (!doc._rev) throw new Error(`Cannot hard delete ${id}: missing _rev`);
    return this.db.remove(id, doc._rev);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async getRawById(id: string): Promise<CertificateEntity> {
    try {
      return await this.db.get(id);
    } catch (err: any) {
      if (err?.status === 404) throw new CertificateNotFoundError(id);
      throw err;
    }
  }

  private parseOrThrow(doc: unknown): CertificateEntity {
    const result = CertificateSchema.safeParse(doc);
    if (!result.success) throw new CertificateValidationError(result.error.issues);
    return result.data;
  }

  private mergeForUpdate(
    current: CertificateEntity,
    patch: Partial<CertificateEntity>,
  ): CertificateEntity {
    // Finalized and Cancelled certs are immutable — only sync/audit fields may change
    const isImmutable =
      current.status === 'FINALIZED' || current.status === 'CANCELLED';
    if (isImmutable && patch.status == null) {
      const allowed = new Set(['_rev', 'sync', 'audit']);
      for (const key of Object.keys(patch)) {
        if (!allowed.has(key)) {
          throw new InvalidStatusTransitionError(current.status, current.status);
        }
      }
    }

    // Validate any explicit status change before merging
    if (patch.status && patch.status !== current.status) {
      this.assertTransitionAllowed(current.status, patch.status);
    }

    return {
      ...current,
      ...patch,
      // These fields must never be overwritten by a patch
      _id: current._id,
      _rev: current._rev,
      type: CERTIFICATE_TYPE,
      // Deep-merge nested objects
      tenant: { ...current.tenant, ...(patch.tenant ?? {}) },
      sourceLinks: { ...current.sourceLinks, ...(patch.sourceLinks ?? {}) },
      operator: { ...current.operator, ...(patch.operator ?? {}) },
      certificateMeta: { ...current.certificateMeta, ...(patch.certificateMeta ?? {}) },
      computed: { ...current.computed, ...(patch.computed ?? {}) },
      workflow: { ...current.workflow, ...(patch.workflow ?? {}) },
      sync: { ...current.sync, ...(patch.sync ?? {}), dirty: patch.sync?.dirty ?? true },
      audit: {
        ...current.audit,
        ...(patch.audit ?? {}),
        updatedAt: new Date().toISOString(),
      },
      readings: patch.readings ?? current.readings,
    };
  }

  private assertTransitionAllowed(from: CertificateStatus, to: CertificateStatus) {
    if (from === to) return;
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new InvalidStatusTransitionError(from, to);
    }
  }

  private async withConflictRetry(
    id: string,
    fn: (current: CertificateEntity) => Promise<PouchDB.Core.Response>,
  ): Promise<PouchDB.Core.Response> {
    let lastErr: any;
    for (let attempt = 0; attempt <= this.maxConflictRetries; attempt++) {
      const current = await this.findById(id);
      try {
        return await fn(current);
      } catch (err: any) {
        if (err?.status === 409) {
          lastErr = err;
          continue; // re-fetch latest rev and retry
        }
        throw err;
      }
    }
    throw new CertificateConflictError(
      id,
      `Conflict unresolved after ${this.maxConflictRetries + 1} attempts: ${String(lastErr?.message ?? '')}`,
    );
  }
}
