/**
 * Task 24 — Unit tests for the NewCertificateStep1Schema (Zod validation)
 *
 * Tests both valid and invalid payloads for every field.
 * AI usage: AI generated valid/invalid payload pairs; all reviewed manually.
 *
 * Run with: npx jest schema.test.ts
 */

import { NewCertificateStep1Schema } from './NewCertificateForm';

// ─── Helper ───────────────────────────────────────────────────────────────────

function valid(overrides: Record<string, any> = {}) {
  return {
    effectiveDate: '2024-06-01',
    productId:     'prod-ivm-ore',
    haulierId:     'haul-ivm-01',
    templateId:    'tpl-standard',
    certificateTitle: 'Weighing Certificate',
    notes:         '',
    vehicleReg:    '',
    contractId:    null,
    ticketNo:      null,
    ...overrides,
  };
}

function expectValid(data: Record<string, any>) {
  const result = NewCertificateStep1Schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Expected valid but got errors: ${result.error.issues.map((i) => i.message).join(', ')}`,
    );
  }
  return result.data;
}

function expectInvalid(data: Record<string, any>, fieldPath?: string) {
  const result = NewCertificateStep1Schema.safeParse(data);
  expect(result.success).toBe(false);
  if (!result.success && fieldPath) {
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain(fieldPath);
  }
}

// ─── Valid payloads ───────────────────────────────────────────────────────────

describe('NewCertificateStep1Schema — valid payloads', () => {
  it('accepts a fully populated valid payload', () => {
    expectValid(valid({
      vehicleReg: 'GP 123-456',
      contractId: 'contract-uuid-001',
      notes: 'Some notes about this weighing',
    }));
  });

  it('accepts minimal required fields only', () => {
    expectValid(valid());
  });

  it('accepts null contractId', () => {
    expectValid(valid({ contractId: null }));
  });

  it('accepts undefined optional fields', () => {
    const { vehicleReg, notes, contractId, ticketNo, ...rest } = valid();
    expectValid(rest);
  });

  it('accepts notes at exactly 1000 characters', () => {
    expectValid(valid({ notes: 'a'.repeat(1000) }));
  });

  it('accepts certificateTitle at exactly 100 characters', () => {
    expectValid(valid({ certificateTitle: 'a'.repeat(100) }));
  });

  it('accepts vehicleReg at exactly 20 characters', () => {
    expectValid(valid({ vehicleReg: 'a'.repeat(20) }));
  });

  it('applies default certificateTitle when omitted', () => {
    const { certificateTitle, ...rest } = valid();
    const result = expectValid(rest);
    expect(result.certificateTitle).toBe('Weighing Certificate');
  });

  it('accepts a leap day date on a leap year', () => {
    expectValid(valid({ effectiveDate: '2024-02-29' }));
  });
});

// ─── Invalid: effectiveDate ───────────────────────────────────────────────────

describe('NewCertificateStep1Schema — effectiveDate validation', () => {
  it('rejects missing effectiveDate', () => {
    const { effectiveDate, ...rest } = valid();
    expectInvalid(rest, 'effectiveDate');
  });

  it('rejects wrong date format DD/MM/YYYY', () => {
    expectInvalid(valid({ effectiveDate: '01/06/2024' }), 'effectiveDate');
  });

  it('rejects wrong date format MM-DD-YYYY', () => {
    expectInvalid(valid({ effectiveDate: '06-01-2024' }), 'effectiveDate');
  });

  it('rejects a date with letters', () => {
    expectInvalid(valid({ effectiveDate: '2024-06-XX' }), 'effectiveDate');
  });

  it('rejects empty string', () => {
    expectInvalid(valid({ effectiveDate: '' }), 'effectiveDate');
  });

  it('rejects null', () => {
    expectInvalid(valid({ effectiveDate: null }), 'effectiveDate');
  });
});

// ─── Invalid: productId ───────────────────────────────────────────────────────

describe('NewCertificateStep1Schema — productId validation', () => {
  it('rejects missing productId', () => {
    const { productId, ...rest } = valid();
    expectInvalid(rest, 'productId');
  });

  it('rejects empty string productId', () => {
    expectInvalid(valid({ productId: '' }), 'productId');
  });
});

// ─── Invalid: haulierId ───────────────────────────────────────────────────────

describe('NewCertificateStep1Schema — haulierId validation', () => {
  it('rejects missing haulierId', () => {
    const { haulierId, ...rest } = valid();
    expectInvalid(rest, 'haulierId');
  });

  it('rejects empty string haulierId', () => {
    expectInvalid(valid({ haulierId: '' }), 'haulierId');
  });
});

// ─── Invalid: templateId ──────────────────────────────────────────────────────

describe('NewCertificateStep1Schema — templateId validation', () => {
  it('rejects missing templateId', () => {
    const { templateId, ...rest } = valid();
    expectInvalid(rest, 'templateId');
  });

  it('rejects empty string templateId', () => {
    expectInvalid(valid({ templateId: '' }), 'templateId');
  });
});

// ─── Invalid: length limits ───────────────────────────────────────────────────

describe('NewCertificateStep1Schema — length limits', () => {
  it('rejects notes over 1000 characters', () => {
    expectInvalid(valid({ notes: 'a'.repeat(1001) }), 'notes');
  });

  it('rejects certificateTitle over 100 characters', () => {
    expectInvalid(valid({ certificateTitle: 'a'.repeat(101) }), 'certificateTitle');
  });

  it('rejects vehicleReg over 20 characters', () => {
    expectInvalid(valid({ vehicleReg: 'a'.repeat(21) }), 'vehicleReg');
  });

  it('rejects ticketNo over 50 characters', () => {
    expectInvalid(valid({ ticketNo: 'a'.repeat(51) }), 'ticketNo');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('NewCertificateStep1Schema — edge cases', () => {
  it('rejects an entirely empty object', () => {
    expectInvalid({});
  });

  it('rejects null for a required string field', () => {
    expectInvalid(valid({ productId: null }), 'productId');
  });

  it('rejects a number where a string is expected', () => {
    expectInvalid(valid({ productId: 123 }), 'productId');
  });

  it('strips extra unknown fields (strict mode off)', () => {
    const result = NewCertificateStep1Schema.safeParse(
      valid({ unknownExtraField: 'should be stripped' }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).unknownExtraField).toBeUndefined();
    }
  });
});
