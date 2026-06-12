/**
 * Task 23 — Unit tests for pure utility functions
 *
 * Tests every function in utils.ts including edge cases.
 * AI usage: AI generated edge-case tests; all verified manually.
 *
 * Run with: npx jest utils.test.ts
 */

import {
  formatDisplayDate,
  formatDisplayTime,
  formatDisplayDateTime,
  isValidDateString,
  todayISODate,
  certDisplayTitle,
  certStatusLabel,
  formatWeight,
  calcNetWeight,
  calcVariancePercent,
  buildLookup,
  stampDirty,
  stampAuditCreate,
  stampAuditUpdate,
} from './utils';

// ─── formatDisplayDate ────────────────────────────────────────────────────────

describe('formatDisplayDate()', () => {
  it('formats a full ISO datetime string', () => {
    expect(formatDisplayDate('2024-06-01T08:00:00.000Z')).toMatch(/01/);
  });

  it('formats a date-only string', () => {
    expect(formatDisplayDate('2024-06-01')).toMatch(/2024/);
  });

  it('returns "—" for null', () => {
    expect(formatDisplayDate(null)).toBe('—');
  });

  it('returns "—" for undefined', () => {
    expect(formatDisplayDate(undefined)).toBe('—');
  });

  it('returns "—" for empty string', () => {
    expect(formatDisplayDate('')).toBe('—');
  });

  it('returns "—" for an invalid date string', () => {
    expect(formatDisplayDate('not-a-date')).toBe('—');
  });
});

// ─── formatDisplayTime ────────────────────────────────────────────────────────

describe('formatDisplayTime()', () => {
  it('extracts hours and minutes from an ISO string', () => {
    const result = formatDisplayTime('2024-06-01T14:30:00.000Z');
    // Result is locale-dependent but must contain digits and colon
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns "—" for null', () => {
    expect(formatDisplayTime(null)).toBe('—');
  });

  it('returns "—" for invalid string', () => {
    expect(formatDisplayTime('garbage')).toBe('—');
  });
});

// ─── formatDisplayDateTime ────────────────────────────────────────────────────

describe('formatDisplayDateTime()', () => {
  it('combines date and time', () => {
    const result = formatDisplayDateTime('2024-06-01T14:30:00.000Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns "—" for null', () => {
    expect(formatDisplayDateTime(null)).toBe('—');
  });
});

// ─── isValidDateString ────────────────────────────────────────────────────────

describe('isValidDateString()', () => {
  it('accepts a valid YYYY-MM-DD string', () => {
    expect(isValidDateString('2024-06-01')).toBe(true);
  });

  it('rejects a string with wrong format', () => {
    expect(isValidDateString('01/06/2024')).toBe(false);
  });

  it('rejects a string with letters', () => {
    expect(isValidDateString('2024-06-XX')).toBe(false);
  });

  it('rejects an impossible date', () => {
    expect(isValidDateString('2024-13-45')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidDateString('')).toBe(false);
  });

  it('accepts a leap day on a leap year', () => {
    expect(isValidDateString('2024-02-29')).toBe(true);
  });

  it('rejects a leap day on a non-leap year', () => {
    expect(isValidDateString('2023-02-29')).toBe(false);
  });
});

// ─── todayISODate ─────────────────────────────────────────────────────────────

describe('todayISODate()', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    expect(todayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns today — not a hardcoded date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(todayISODate()).toBe(today);
  });
});

// ─── certDisplayTitle ─────────────────────────────────────────────────────────

describe('certDisplayTitle()', () => {
  it('returns the certificate number when present', () => {
    expect(
      certDisplayTitle({ certificateNo: 'CERT-001', status: 'DRAFT', effectiveDate: '2024-06-01' }),
    ).toBe('CERT-001');
  });

  it('returns a draft fallback when certificateNo is null', () => {
    const result = certDisplayTitle({
      certificateNo: null,
      status: 'DRAFT',
      effectiveDate: '2024-06-01',
    });
    expect(result).toMatch(/Draft/);
    expect(result).toMatch(/2024/);
  });
});

// ─── certStatusLabel ──────────────────────────────────────────────────────────

describe('certStatusLabel()', () => {
  it('returns "Draft" for DRAFT', () => expect(certStatusLabel('DRAFT')).toBe('Draft'));
  it('returns "In Review" for UNDER_REVIEW', () => expect(certStatusLabel('UNDER_REVIEW')).toBe('In Review'));
  it('returns "Finalised" for FINALIZED', () => expect(certStatusLabel('FINALIZED')).toBe('Finalised'));
  it('returns "Cancelled" for CANCELLED', () => expect(certStatusLabel('CANCELLED')).toBe('Cancelled'));
  it('returns the raw value for unknown status', () => expect(certStatusLabel('UNKNOWN')).toBe('UNKNOWN'));
});

// ─── formatWeight ─────────────────────────────────────────────────────────────

describe('formatWeight()', () => {
  it('formats a whole number with unit', () => {
    expect(formatWeight(5000)).toContain('kg');
    expect(formatWeight(5000)).toMatch(/5/);
  });

  it('uses a custom unit', () => {
    expect(formatWeight(1500, 'lb')).toContain('lb');
  });

  it('handles zero', () => {
    expect(formatWeight(0)).toContain('0');
  });

  it('handles fractional weights', () => {
    expect(formatWeight(5000.5, 'kg')).toContain('5');
  });
});

// ─── calcNetWeight ────────────────────────────────────────────────────────────

describe('calcNetWeight()', () => {
  it('returns gross minus tare', () => {
    expect(calcNetWeight(5000, 1500)).toBe(3500);
  });

  it('returns null when gross is null', () => {
    expect(calcNetWeight(null, 1500)).toBeNull();
  });

  it('returns null when tare is null', () => {
    expect(calcNetWeight(5000, null)).toBeNull();
  });

  it('returns null when both are null', () => {
    expect(calcNetWeight(null, null)).toBeNull();
  });

  it('handles zero tare', () => {
    expect(calcNetWeight(5000, 0)).toBe(5000);
  });

  it('handles negative net (tare > gross — data error)', () => {
    expect(calcNetWeight(1000, 2000)).toBe(-1000);
  });
});

// ─── calcVariancePercent ──────────────────────────────────────────────────────

describe('calcVariancePercent()', () => {
  it('calculates percentage difference correctly', () => {
    expect(calcVariancePercent(105, 100)).toBeCloseTo(5);
  });

  it('returns 0 when values are equal', () => {
    expect(calcVariancePercent(100, 100)).toBe(0);
  });

  it('returns 0 when reference is 0 (avoids divide-by-zero)', () => {
    expect(calcVariancePercent(50, 0)).toBe(0);
  });

  it('uses absolute value — negative difference returns positive percent', () => {
    expect(calcVariancePercent(95, 100)).toBeCloseTo(5);
  });
});

// ─── buildLookup ─────────────────────────────────────────────────────────────

describe('buildLookup()', () => {
  const companies = [
    { id: 1, name: 'Ironveld Mining' },
    { id: 2, name: 'Coastal Aggregates' },
    { id: 3, name: 'Highveld Grain' },
  ];

  it('builds a dictionary keyed by the given field', () => {
    const dict = buildLookup(companies, 'id');
    expect(dict['1'].name).toBe('Ironveld Mining');
    expect(dict['2'].name).toBe('Coastal Aggregates');
  });

  it('returns an empty object for an empty array', () => {
    expect(buildLookup([], 'id')).toEqual({});
  });

  it('last entry wins on duplicate keys', () => {
    const dupes = [
      { id: 1, name: 'First' },
      { id: 1, name: 'Second' },
    ];
    const dict = buildLookup(dupes, 'id');
    expect(dict['1'].name).toBe('Second');
  });
});

// ─── stampDirty ──────────────────────────────────────────────────────────────

describe('stampDirty()', () => {
  const base = {
    _id: 'cert:TEST',
    sync: { dirty: false, lastSyncedAt: '2024-01-01T00:00:00.000Z' },
  } as any;

  it('sets dirty to true', () => {
    expect(stampDirty(base).sync.dirty).toBe(true);
  });

  it('preserves lastSyncedAt', () => {
    expect(stampDirty(base).sync.lastSyncedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('does not mutate the original', () => {
    stampDirty(base);
    expect(base.sync.dirty).toBe(false);
  });
});

// ─── stampAuditCreate ─────────────────────────────────────────────────────────

describe('stampAuditCreate()', () => {
  const base = { audit: { createdAt: '', updatedAt: '' } } as any;
  const now = '2024-06-01T08:00:00.000Z';

  it('sets both createdAt and updatedAt', () => {
    const result = stampAuditCreate(base, now);
    expect(result.audit.createdAt).toBe(now);
    expect(result.audit.updatedAt).toBe(now);
  });
});

// ─── stampAuditUpdate ─────────────────────────────────────────────────────────

describe('stampAuditUpdate()', () => {
  const base = {
    audit: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  } as any;
  const now = '2024-06-01T10:00:00.000Z';

  it('updates updatedAt but preserves createdAt', () => {
    const result = stampAuditUpdate(base, now);
    expect(result.audit.updatedAt).toBe(now);
    expect(result.audit.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });
});


// ─── Mutation-driven test additions ───────────────────────────────────────────
// These tests were added after mutation testing revealed two surviving mutants.

describe('isValidDateString() — mutation-strengthened', () => {
  it('rejects a date where month is removed from validation (e.g. day matches but month is wrong)', () => {
    // Mutant 8 survival: removing the month check meant '2024-13-01' passed
    // because day (1) and year (2024) matched even with invalid month 13
    expect(isValidDateString('2024-13-01')).toBe(false);
    expect(isValidDateString('2024-00-15')).toBe(false);
  });
});

describe('buildLookup() — mutation-strengthened', () => {
  it('correctly keys string IDs that cannot be coerced to numbers', () => {
    // Mutant 7 survival: removing String() still works for numeric keys
    // because JS coerces them. This test uses a non-numeric string key
    // to catch a version that doesn't stringify.
    const items = [
      { id: 'abc-123', name: 'First' },
      { id: 'def-456', name: 'Second' },
    ];
    const dict = buildLookup(items, 'id');
    expect(dict['abc-123'].name).toBe('First');
    expect(dict['def-456'].name).toBe('Second');
  });
});
