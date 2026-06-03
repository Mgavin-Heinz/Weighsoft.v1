/**
 * CertificateRepository.test.ts
 *
 * Full test suite for the Certificate repository class.
 * Uses pouchdb-memory-adapter so tests run entirely in-process — no disk I/O.
 *
 * Run with:  npx jest CertificateRepository.test.ts
 */

import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
import PouchDBFind from 'pouchdb-find';

import {
  CertificateRepository,
  CertificateNotFoundError,
  CertificateConflictError,
  CertificateValidationError,
  InvalidStatusTransitionError,
} from './CertificateRepository';
import type { CertificateEntity } from './CertificateSchema';

// Use in-memory PouchDB for tests (no files written to disk)
PouchDB.plugin(PouchDBMemoryAdapter);
PouchDB.plugin(PouchDBFind);

// ─── Test Fixtures ─────────────────────────────────────────────────────────────

const COMPANY_ID = 'a1b2c3d4-0000-0000-0000-000000000001';
const SITE_ID    = 'a1b2c3d4-0000-0000-0000-000000000002';
const WS_ID      = 'a1b2c3d4-0000-0000-0000-000000000003';
const SCALE_ID   = 'a1b2c3d4-0000-0000-0000-000000000004';
const WH_ID      = 'a1b2c3d4-0000-0000-0000-000000000005';
const USER_ID    = 'a1b2c3d4-0000-0000-0000-000000000006';

/** Returns a fresh, valid certificate payload each call to avoid shared state */
function makeCert(overrides: Partial<CertificateEntity> = {}): CertificateEntity {
  return {
    _id: 'cert:01HZQR7NTMVW3KXY2PABCDEFGH',
    type: 'certificate',
    schemaVersion: 1,
    certificateNo: 'CERT-2024-001',
    status: 'DRAFT',
    tenant: {
      companyId: COMPANY_ID,
      siteId: SITE_ID,
      workstationId: WS_ID,
      scaleId: SCALE_ID,
    },
    sourceLinks: {
      weighingHeaderId: WH_ID,
      contractId: null,
      ticketNo: 'TKT-001',
    },
    operator: {
      createdByUserId: USER_ID,
      createdByNameSnapshot: 'Test Operator',
      roleSnapshot: 'operator',
    },
    certificateMeta: {
      issuedAt: null,
      effectiveDate: '2024-06-01',
      templateId: 'tpl-standard',
      title: 'Weighing Certificate',
      notes: '',
    },
    readings: [
      {
        readingId: 'read:01HZQR7NTMVW3KXY2PABCDE001',
        sequenceTag: 'GROSS',
        numericValue: 5000,
        unit: 'kg',
        capturedAt: '2024-06-01T08:00:00.000Z',
        capturedByUserId: USER_ID,
        source: 'scale',
      },
    ],
    computed: {
      varianceValue: 0,
      variancePercent: 0,
      tolerancePercent: 5,
      withinTolerance: true,
    },
    workflow: {
      submittedForReviewAt: null,
      submittedByUserId: null,
      finalizedAt: null,
      finalizedByUserId: null,
      cancelledAt: null,
      cancelledByUserId: null,
      cancelReason: null,
    },
    sync: {
      dirty: true,
      lastSyncedAt: null,
      origin: 'mobile',
      deviceId: 'device-test-001',
    },
    audit: {
      createdAt: '2024-06-01T08:00:00.000Z',
      updatedAt: '2024-06-01T08:00:00.000Z',
    },
    ...overrides,
  } as CertificateEntity;
}

// ─── Suite setup ───────────────────────────────────────────────────────────────

let db: PouchDB.Database<CertificateEntity>;
let repo: CertificateRepository;

beforeEach(() => {
  // Fresh in-memory DB for every test — no state leaks between tests
  db = new PouchDB<CertificateEntity>('test-certs', { adapter: 'memory' });
  repo = new CertificateRepository(db);
});

afterEach(async () => {
  await db.destroy();
});

// ─── CREATE ────────────────────────────────────────────────────────────────────

describe('create()', () => {
  it('saves a valid certificate and returns an ok response', async () => {
    const cert = makeCert();
    const result = await repo.create(cert);

    expect(result.ok).toBe(true);
    expect(result.id).toBe(cert._id);
  });

  it('stamps the type field as "certificate"', async () => {
    const cert = makeCert();
    await repo.create(cert);
    const saved = await repo.findById(cert._id);
    expect(saved.type).toBe('certificate');
  });

  it('sets sync.dirty to true on creation', async () => {
    const cert = makeCert({ sync: { ...makeCert().sync, dirty: false } });
    await repo.create(cert);
    const saved = await repo.findById(cert._id);
    expect(saved.sync.dirty).toBe(true);
  });

  it('sets audit.updatedAt to approximately now', async () => {
    const before = Date.now();
    const cert = makeCert();
    await repo.create(cert);
    const saved = await repo.findById(cert._id);
    const updatedAt = new Date(saved.audit.updatedAt).getTime();
    expect(updatedAt).toBeGreaterThanOrEqual(before);
    expect(updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it('throws CertificateConflictError if the same _id is created twice', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await expect(repo.create(cert)).rejects.toThrow(CertificateConflictError);
  });

  it('throws CertificateValidationError for an invalid payload', async () => {
    const bad = { ...makeCert(), status: 'INVALID_STATUS' } as any;
    await expect(repo.create(bad)).rejects.toThrow(CertificateValidationError);
  });

  it('throws CertificateValidationError for a bad _id format', async () => {
    const bad = { ...makeCert(), _id: 'not-a-valid-id' } as any;
    await expect(repo.create(bad)).rejects.toThrow(CertificateValidationError);
  });
});

// ─── READ ──────────────────────────────────────────────────────────────────────

describe('findById()', () => {
  it('returns the certificate after it has been created', async () => {
    const cert = makeCert();
    await repo.create(cert);
    const found = await repo.findById(cert._id);
    expect(found._id).toBe(cert._id);
    expect(found.certificateNo).toBe('CERT-2024-001');
  });

  it('throws CertificateNotFoundError for a missing id', async () => {
    await expect(repo.findById('cert:01HZQR7NTMVW3KXY2PNOTEXIST')).rejects.toThrow(
      CertificateNotFoundError,
    );
  });
});

describe('exists()', () => {
  it('returns true for an existing certificate', async () => {
    const cert = makeCert();
    await repo.create(cert);
    expect(await repo.exists(cert._id)).toBe(true);
  });

  it('returns false for a missing certificate', async () => {
    expect(await repo.exists('cert:01HZQR7NTMVW3KXY2PNOTEXIST')).toBe(false);
  });
});

// ─── UPDATE ────────────────────────────────────────────────────────────────────

describe('update()', () => {
  it('applies a partial patch and updates audit.updatedAt', async () => {
    const cert = makeCert();
    await repo.create(cert);

    const patchedAt = Date.now();
    await repo.update(cert._id, { certificateNo: 'CERT-2024-999' });
    const updated = await repo.findById(cert._id);

    expect(updated.certificateNo).toBe('CERT-2024-999');
    expect(new Date(updated.audit.updatedAt).getTime()).toBeGreaterThanOrEqual(patchedAt);
  });

  it('marks sync.dirty = true after update', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.markSynced(cert._id); // force dirty = false
    await repo.update(cert._id, { certificateNo: 'CERT-X' });
    const updated = await repo.findById(cert._id);
    expect(updated.sync.dirty).toBe(true);
  });

  it('deep-merges nested certificateMeta without losing other fields', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.update(cert._id, {
      certificateMeta: { ...cert.certificateMeta, title: 'Updated Title' },
    });
    const updated = await repo.findById(cert._id);
    expect(updated.certificateMeta.title).toBe('Updated Title');
    expect(updated.certificateMeta.templateId).toBe('tpl-standard'); // untouched
  });

  it('throws CertificateNotFoundError if the id does not exist', async () => {
    await expect(
      repo.update('cert:01HZQR7NTMVW3KXY2PNOTEXIST', { certificateNo: 'X' }),
    ).rejects.toThrow(CertificateNotFoundError);
  });

  it('throws InvalidStatusTransitionError when patching a FINALIZED cert body', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'UNDER_REVIEW', USER_ID);
    await repo.transitionStatus(cert._id, 'FINALIZED', USER_ID);

    await expect(
      repo.update(cert._id, { certificateNo: 'CANNOT-CHANGE' }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });
});

// ─── STATUS TRANSITIONS ────────────────────────────────────────────────────────

describe('transitionStatus()', () => {
  it('DRAFT → UNDER_REVIEW records submittedForReviewAt and submittedByUserId', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'UNDER_REVIEW', USER_ID);
    const updated = await repo.findById(cert._id);

    expect(updated.status).toBe('UNDER_REVIEW');
    expect(updated.workflow.submittedByUserId).toBe(USER_ID);
    expect(updated.workflow.submittedForReviewAt).not.toBeNull();
  });

  it('UNDER_REVIEW → FINALIZED records finalizedAt and finalizedByUserId', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'UNDER_REVIEW', USER_ID);
    await repo.transitionStatus(cert._id, 'FINALIZED', USER_ID);
    const updated = await repo.findById(cert._id);

    expect(updated.status).toBe('FINALIZED');
    expect(updated.workflow.finalizedByUserId).toBe(USER_ID);
    expect(updated.workflow.finalizedAt).not.toBeNull();
  });

  it('UNDER_REVIEW → DRAFT is permitted (send back for corrections)', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'UNDER_REVIEW', USER_ID);
    await repo.transitionStatus(cert._id, 'DRAFT', USER_ID);
    const updated = await repo.findById(cert._id);
    expect(updated.status).toBe('DRAFT');
  });

  it('DRAFT → CANCELLED records cancelledAt and cancelReason', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'CANCELLED', USER_ID, 'Data entry error');
    const updated = await repo.findById(cert._id);

    expect(updated.status).toBe('CANCELLED');
    expect(updated.workflow.cancelReason).toBe('Data entry error');
    expect(updated.workflow.cancelledByUserId).toBe(USER_ID);
  });

  it('DRAFT → FINALIZED is not allowed (must go through review first)', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await expect(
      repo.transitionStatus(cert._id, 'FINALIZED', USER_ID),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('FINALIZED → any status is blocked', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'UNDER_REVIEW', USER_ID);
    await repo.transitionStatus(cert._id, 'FINALIZED', USER_ID);

    await expect(
      repo.transitionStatus(cert._id, 'DRAFT', USER_ID),
    ).rejects.toThrow(InvalidStatusTransitionError);

    await expect(
      repo.transitionStatus(cert._id, 'CANCELLED', USER_ID),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('CANCELLED → any status is blocked', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.transitionStatus(cert._id, 'CANCELLED', USER_ID);

    await expect(
      repo.transitionStatus(cert._id, 'DRAFT', USER_ID),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });
});

// ─── SOFT DELETE ───────────────────────────────────────────────────────────────

describe('softDelete()', () => {
  it('moves the cert to CANCELLED — document still exists in DB', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.softDelete(cert._id, USER_ID, 'Testing soft delete');
    const found = await repo.findById(cert._id);

    expect(found.status).toBe('CANCELLED');
    expect(found.workflow.cancelReason).toBe('Testing soft delete');
  });
});

// ─── HARD DELETE ───────────────────────────────────────────────────────────────

describe('hardDeleteForTesting()', () => {
  it('removes the document so findById throws CertificateNotFoundError', async () => {
    const cert = makeCert();
    await repo.create(cert);
    await repo.hardDeleteForTesting(cert._id);
    await expect(repo.findById(cert._id)).rejects.toThrow(CertificateNotFoundError);
  });
});

// ─── MARK SYNCED ──────────────────────────────────────────────────────────────

describe('markSynced()', () => {
  it('sets dirty = false and records lastSyncedAt', async () => {
    const cert = makeCert();
    await repo.create(cert);
    const syncTime = '2024-06-01T10:00:00.000Z';
    await repo.markSynced(cert._id, syncTime);
    const updated = await repo.findById(cert._id);

    expect(updated.sync.dirty).toBe(false);
    expect(updated.sync.lastSyncedAt).toBe(syncTime);
  });
});

// ─── LIST ──────────────────────────────────────────────────────────────────────

describe('list()', () => {
  it('returns all certificates when no filter is provided', async () => {
    await repo.create(makeCert());
    await repo.create(makeCert({ _id: 'cert:01HZQR7NTMVW3KXY2PABCDE002' }));
    const result = await repo.list();
    expect(result.rows.length).toBe(2);
    expect(result.total).toBe(2);
  });

  it('filters by status', async () => {
    await repo.create(makeCert());
    const cert2 = makeCert({ _id: 'cert:01HZQR7NTMVW3KXY2PABCDE002' });
    await repo.create(cert2);
    await repo.transitionStatus(cert2._id, 'UNDER_REVIEW', USER_ID);

    const drafts = await repo.list({ status: 'DRAFT' });
    const reviews = await repo.list({ status: 'UNDER_REVIEW' });

    expect(drafts.rows.every((r) => r.status === 'DRAFT')).toBe(true);
    expect(reviews.rows.every((r) => r.status === 'UNDER_REVIEW')).toBe(true);
  });

  it('filters by dirty flag', async () => {
    await repo.create(makeCert());
    const cert2 = makeCert({ _id: 'cert:01HZQR7NTMVW3KXY2PABCDE002' });
    await repo.create(cert2);
    await repo.markSynced(cert2._id); // dirty = false

    const dirty = await repo.list({ dirty: true });
    const synced = await repo.list({ dirty: false });

    expect(dirty.rows.every((r) => r.sync.dirty === true)).toBe(true);
    expect(synced.rows.every((r) => r.sync.dirty === false)).toBe(true);
  });

  it('respects limit and skip for pagination', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create(
        makeCert({ _id: `cert:01HZQR7NTMVW3KXY2PABCDE00${i}` }),
      );
    }
    const page1 = await repo.list({ limit: 2, skip: 0 });
    const page2 = await repo.list({ limit: 2, skip: 2 });

    expect(page1.rows.length).toBe(2);
    expect(page2.rows.length).toBe(2);
    // Pages should not overlap
    const ids1 = page1.rows.map((r) => r._id);
    const ids2 = page2.rows.map((r) => r._id);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
  });

  it('returns empty result when no certs match filter', async () => {
    await repo.create(makeCert());
    const result = await repo.list({ status: 'FINALIZED' });
    expect(result.rows.length).toBe(0);
    expect(result.total).toBe(0);
  });
});
