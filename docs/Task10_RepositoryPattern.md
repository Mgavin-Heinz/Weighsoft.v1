# Task 10: Local Storage Repository Pattern & Test Suite

This document specifies the structural repository implementation for the `Certificate` entity using PouchDB, along with a comprehensive automated test framework verifying offline CRUD execution.

---

## 1. Architectural Strategy
The Repository pattern isolates data access logic from the upper presentation and business layers. This prevents PouchDB API leaking into UI modules and encapsulates:
1. **Runtime Type Verification:** Automatically passing records through the Zod schema before executing local disk operations.
2. **Offline Revision Lifecycle Stamping:** Enforcing that mutation updates securely manage PouchDB revision (`_rev`) strings to protect the sync layer.
3. **Automated State Machines:** Guaranteeing status constraints cannot drift out of valid workflow lanes during offline connection interruptions.

---

## 2. Certificate Repository Implementation (`CertificateRepository.ts`)

```typescript
// CertificateRepository.ts
import PouchDB from "pouchdb";
import {
  CertificateSchema,
  type CertificateEntity,
} from "./Task9_ZodSchemaValidation";
import { z } from "zod";

type CertificateStatus = CertificateEntity["status"];
const CERTIFICATE_TYPE = "certificate" as const;

const ALLOWED_TRANSITIONS: Record<CertificateStatus, CertificateStatus[]> = {
  DRAFT: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["DRAFT", "FINALIZED", "CANCELLED"],
  FINALIZED: [],
  CANCELLED: [],
};

export class CertificateNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Certificate ${id} not found`);
    this.name = "CertificateNotFoundError";
  }
}

export class CertificateConflictError extends Error {
  constructor(public readonly id: string, message = "Conflict updating certificate") {
    super(message);
    this.name = "CertificateConflictError";
  }
}

export class CertificateValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Certificate validation failed");
    this.name = "CertificateValidationError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly from: CertificateStatus,
    public readonly to: CertificateStatus
  ) {
    super(`Invalid status transition: ${from} -> ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export interface ListCertificatesFilter {
  companyId?: string;
  siteId?: string;
  workstationId?: string;
  status?: CertificateStatus;
  dirty?: boolean;
  updatedAfter?: string; // ISO datetime
  limit?: number;
  skip?: number;
}

export interface ListCertificatesResult {
  rows: CertificateEntity[];
  total: number;
}

export class CertificateRepository {
  private readonly db: PouchDB.Database<CertificateEntity>;
  private readonly maxConflictRetries: number;

  constructor(
    pouchDbInstance: PouchDB.Database<CertificateEntity>,
    options?: { maxConflictRetries?: number }
  ) {
    this.db = pouchDbInstance;
    this.maxConflictRetries = options?.maxConflictRetries ?? 3;
  }

  // ---------- Public API ----------
  async create(input: CertificateEntity): Promise<PouchDB.Core.Response> {
    const validated = this.parseOrThrow({
      ...input,
      type: CERTIFICATE_TYPE,
      sync: { ...input.sync, dirty: true },
      audit: {
        ...input.audit,
        createdAt: input.audit.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      return await this.db.put(validated);
    } catch (err: any) {
      if (err?.status === 409) {
        throw new CertificateConflictError(validated._id, "Certificate already exists");
      }
      throw err;
    }
  }

  async findById(id: string): Promise<CertificateEntity> {
    const doc = await this.getRawById(id);
    return this.parseOrThrow(doc);
  }

  async exists(id: string): Promise<boolean> {
    try {
      await this.db.get(id);
      return true;
    } catch (err: any) {
      if (err?.status === 404) return false;
      throw err;
    }
  }

  async update(
    id: string,
    patch: Partial<CertificateEntity>
  ): Promise<PouchDB.Core.Response> {
    return this.withConflictRetry(id, async (current) => {
      const merged = this.mergeForUpdate(current, patch);
      const validated = this.parseOrThrow(merged);
      return this.db.put(validated);
    });
  }

  async transitionStatus(
    id: string,
    nextStatus: CertificateStatus,
    actorUserId: string,
    reason?: string
  ): Promise<PouchDB.Core.Response> {
    return this.withConflictRetry(id, async (current) => {
      this.assertTransitionAllowed(current.status, nextStatus);
      const now = new Date().toISOString();
      const workflowPatch: Partial<CertificateEntity["workflow"]> = {};

      if (nextStatus === "UNDER_REVIEW") {
        workflowPatch.submittedForReviewAt = now;
        workflowPatch.submittedByUserId = actorUserId;
      } else if (nextStatus === "FINALIZED") {
        workflowPatch.finalizedAt = now;
        workflowPatch.finalizedByUserId = actorUserId;
      } else if (nextStatus === "CANCELLED") {
        workflowPatch.cancelledAt = now;
        workflowPatch.cancelledByUserId = actorUserId;
        workflowPatch.cancelReason = reason ?? null;
      }

      const merged = this.mergeForUpdate(current, {
        status: nextStatus,
        workflow: {
          ...current.workflow,
          ...workflowPatch,
        },
      });

      const validated = this.parseOrThrow(merged);
      return this.db.put(validated);
    });
  }

  async softDelete(
    id: string,
    actorUserId: string,
    reason?: string
  ): Promise<PouchDB.Core.Response> {
    return this.transitionStatus(id, "CANCELLED", actorUserId, reason);
  }

  async hardDeleteForTesting(id: string): Promise<PouchDB.Core.Response> {
    const existing = await this.getRawById(id);
    if (!existing._rev) throw new Error(`Cannot hard delete ${id} without _rev`);
    return this.db.remove(id, existing._rev);
  }

  async list(filter: ListCertificatesFilter = {}): Promise<ListCertificatesResult> {
    const selector: Record<string, any> = {
      type: CERTIFICATE_TYPE,
    };

    if (filter.companyId) selector["tenant.companyId"] = filter.companyId;
    if (filter.siteId) selector["tenant.siteId"] = filter.siteId;
    if (filter.workstationId) selector["tenant.workstationId"] = filter.workstationId;
    if (filter.status) selector["status"] = filter.status;
    if (typeof filter.dirty === "boolean") selector["sync.dirty"] = filter.dirty;
    if (filter.updatedAfter) selector["audit.updatedAt"] = { $gte: filter.updatedAfter };

    const result = await this.db.find({
      selector,
      sort: [{ "audit.updatedAt": "desc" }] as any,
      limit: filter.limit ?? 50,
      skip: filter.skip ?? 0,
    } as any);

    const rows = result.docs.map((d) => this.parseOrThrow(d as CertificateEntity));
    return {
      rows,
      total: rows.length,
    };
  }

  async markSynced(id: string, syncedAtIso = new Date().toISOString()) {
    return this.update(id, {
      sync: {
        dirty: false,
        lastSyncedAt: syncedAtIso,
      } as CertificateEntity["sync"],
    });
  }

  // ---------- Internal ----------
  private async getRawById(id: string): Promise<CertificateEntity> {
    try {
      return await this.db.get(id);
    } catch (err: any) {
      if (err?.status === 404) throw new CertificateNotFoundError(id);
      throw err;
    }
  }

  private parseOrThrow(doc: unknown): CertificateEntity {
    const parsed = CertificateSchema.safeParse(doc);
    if (!parsed.success) {
      throw new CertificateValidationError(parsed.error.issues);
    }
    return parsed.data;
  }

  private mergeForUpdate(
    current: CertificateEntity,
    patch: Partial<CertificateEntity>
  ): CertificateEntity {
    const immutableStatus = current.status === "FINALIZED" || current.status === "CANCELLED";
    if (immutableStatus && patch.status == null) {
      const allowedKeys = new Set(["_rev", "sync", "audit"]);
      for (const key of Object.keys(patch)) {
        if (!allowedKeys.has(key)) {
          throw new InvalidStatusTransitionError(current.status, current.status);
        }
      }
    }

    const merged: CertificateEntity = {
      ...current,
      ...patch,
      _id: current._id,
      _rev: patch._rev ?? current._rev,
      type: CERTIFICATE_TYPE,
      tenant: { ...current.tenant, ...(patch.tenant ?? {}) },
      sourceLinks: { ...current.sourceLinks, ...(patch.sourceLinks ?? {}) },
      operator: { ...current.operator, ...(patch.operator ?? {}) },
      certificateMeta: { ...current.certificateMeta, ...(patch.certificateMeta ?? {}) },
      computed: { ...current.computed, ...(patch.computed ?? {}) },
      workflow: { ...current.workflow, ...(patch.workflow ?? {}) },
      sync: {
        ...current.sync,
        ...(patch.sync ?? {}),
        dirty: true,
      },
      audit: {
        ...current.audit,
        ...(patch.audit ?? {}),
        updatedAt: new Date().toISOString(),
      },
      readings: patch.readings ?? current.readings,
    };

    if (patch.status && patch.status !== current.status) {
      this.assertTransitionAllowed(current.status, patch.status);
    }
    return merged;
  }

  private assertTransitionAllowed(from: CertificateStatus, to: CertificateStatus) {
    if (from === to) return;
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new InvalidStatusTransitionError(from, to);
    }
  }

  private async withConflictRetry(
    id: string,
    fn: (current: CertificateEntity) => Promise<PouchDB.Core.Response>
  ): Promise<PouchDB.Core.Response> {
    let lastError: any;
    for (let attempt = 0; attempt <= this.maxConflictRetries; attempt++) {
      const current = await this.findById(id);
      try {
        return await fn(current);
      } catch (err: any) {
        if (err?.status === 409) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }
    throw new CertificateConflictError(id, `Conflict unresolved after ${this.maxConflictRetries + 1} attempts: ${String(lastError?.message ?? "")}`);
  }
}