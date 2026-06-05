/**
 * Task 22 — Refactor duplicated code into shared utilities
 *
 * AI usage: AI identified duplication across controllers and proposed refactor steps.
 *
 * Duplication found:
 *  1. Date formatting — "YYYY-MM-DD" parsing and display repeated in 4 places
 *  2. Certificate display name — built inline in list, detail, and PDF export
 *  3. Company lookup pattern — for-loop dict building repeated in 3 controllers (Task 11)
 *  4. Sync dirty stamping — repeated in every repository write
 *
 * This file consolidates all into typed, tested utilities.
 * Tests are in Task 23.
 */

// ─── Date utilities ───────────────────────────────────────────────────────────

/**
 * Formats an ISO date string ("2024-06-01T08:00:00.000Z") to a human display
 * string ("01 Jun 2024"). Returns "—" for null/undefined.
 */
export function formatDisplayDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Formats an ISO datetime to a short time string ("08:00").
 * Returns "—" for null/undefined.
 */
export function formatDisplayTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Formats an ISO datetime to a full display string ("01 Jun 2024  08:00").
 */
export function formatDisplayDateTime(iso: string | null | undefined): string {
  const date = formatDisplayDate(iso);
  const time = formatDisplayTime(iso);
  if (date === '—') return '—';
  return `${date}  ${time}`;
}

/**
 * Returns true if a YYYY-MM-DD string represents a valid calendar date.
 */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
export function todayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Certificate display utilities ───────────────────────────────────────────

interface CertDisplayInput {
  certificateNo: string | null;
  status: string;
  effectiveDate: string;
}

/**
 * Returns a human-readable title for a certificate.
 * Used in list rows, detail headers, and PDF exports.
 */
export function certDisplayTitle(cert: CertDisplayInput): string {
  if (cert.certificateNo) return cert.certificateNo;
  return `Draft — ${formatDisplayDate(cert.effectiveDate)}`;
}

/**
 * Returns a short status label for display.
 */
export function certStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT:        'Draft',
    UNDER_REVIEW: 'In Review',
    FINALIZED:    'Finalised',
    CANCELLED:    'Cancelled',
  };
  return map[status] ?? status;
}

// ─── Number / weight utilities ────────────────────────────────────────────────

/**
 * Formats a weight value with unit for display ("5 000 kg").
 * Uses South African thousand-separator style.
 */
export function formatWeight(value: number, unit: string = 'kg'): string {
  const formatted = new Intl.NumberFormat('en-ZA', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value);
  return `${formatted} ${unit}`;
}

/**
 * Calculates net weight from gross and tare.
 * Returns null if either input is null/undefined.
 */
export function calcNetWeight(
  gross: number | null | undefined,
  tare: number | null | undefined,
): number | null {
  if (gross == null || tare == null) return null;
  return gross - tare;
}

/**
 * Calculates variance percentage between two readings.
 * Returns 0 if reference is 0 to avoid divide-by-zero.
 */
export function calcVariancePercent(value: number, reference: number): number {
  if (reference === 0) return 0;
  return Math.abs((value - reference) / reference) * 100;
}

// ─── Company lookup utility ───────────────────────────────────────────────────
// Extracted from the repeated pattern in HaulierController, GradeController,
// and ProductController (Task 11) — builds a lookup dict from an array.

/**
 * Builds a lookup dictionary from an array of objects keyed by a given field.
 *
 * Example:
 *   const dict = buildLookup(companies, 'id');
 *   const company = dict[haulier.company_id];
 */
export function buildLookup<T extends Record<string, any>>(
  items: T[],
  keyField: keyof T,
): Record<string, T> {
  return Object.fromEntries(items.map((item) => [String(item[keyField]), item]));
}

// ─── Sync utility ─────────────────────────────────────────────────────────────

/**
 * Stamps a document as dirty with the current timestamp.
 * Extracted from the repeated pattern in CertificateRepository.
 */
export function stampDirty<T extends { sync: { dirty: boolean; lastSyncedAt: string | null } }>(
  doc: T,
): T {
  return {
    ...doc,
    sync: { ...doc.sync, dirty: true, lastSyncedAt: doc.sync.lastSyncedAt },
  };
}

/**
 * Stamps audit timestamps on create.
 */
export function stampAuditCreate<T extends { audit: { createdAt: string; updatedAt: string } }>(
  doc: T,
  now: string = new Date().toISOString(),
): T {
  return { ...doc, audit: { createdAt: now, updatedAt: now } };
}

/**
 * Stamps audit.updatedAt on every write.
 */
export function stampAuditUpdate<T extends { audit: { createdAt: string; updatedAt: string } }>(
  doc: T,
  now: string = new Date().toISOString(),
): T {
  return { ...doc, audit: { ...doc.audit, updatedAt: now } };
}
