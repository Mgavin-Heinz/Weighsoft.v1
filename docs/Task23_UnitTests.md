# Task 23: Add Unit Tests for a Pure Utility Function

**File:** `Weighsoft.mobile.v1/src/utils.test.ts`  
**AI usage:** AI used to generate edge-case tests.

---

## What I asked AI to help with

I asked AI to generate edge-case tests for the utility functions in `utils.ts`, focusing on inputs that might be easy to miss when writing tests manually — particularly around null handling, boundary values, and date edge cases.

## What AI generated

AI produced a comprehensive set of edge cases I had not thought of:

**For `isValidDateString`:**
- Rejecting `"01/06/2024"` (wrong separator) — obvious
- Rejecting `"2024-06-XX"` (letters in date) — obvious
- Rejecting `"2024-13-45"` (impossible month/day) — good catch
- **Accepting `"2024-02-29"` (leap day on leap year)** — important positive case
- **Rejecting `"2023-02-29"` (leap day on non-leap year)** — this was the most important edge case, and it caught an actual bug in the implementation (JavaScript's `new Date('2023-02-29')` silently rolls over to March 1 instead of returning `NaN`)

**For `calcNetWeight`:**
- Returning null when gross is null — obvious
- Returning null when tare is null — obvious
- **Handling zero tare** (should return gross, not null) — easy to get wrong with `if (!tare)` checks
- **Handling negative net** (tare > gross) — AI flagged this is a data error condition that should not throw, just return a negative number

**For `calcVariancePercent`:**
- **Returning 0 when reference is 0** — divide-by-zero protection
- **Returning positive value when value < reference** — AI noted it should use `Math.abs` so variance is always a magnitude, not a signed difference

**For `buildLookup`:**
- **Last-entry-wins on duplicate keys** — AI flagged this as important to document since it's a silent behaviour

**For `stampDirty`:**
- **Not mutating the original** — immutability test, important for React state

## What I changed after reviewing

The leap year test caught a real bug. The original `isValidDateString` used `new Date(value)` which does not reject `"2023-02-29"` — it rolls it over to `"2023-03-01"`. I fixed this by parsing year/month/day separately and comparing against the Date object's actual fields. All other AI-suggested tests passed without needing implementation changes.

## Test results

**49 tests, all passing.**

### Test coverage by function

| Function | Tests | Edge cases covered |
|---|---|---|
| `formatDisplayDate` | 6 | null, undefined, empty string, invalid string, ISO datetime, date-only |
| `formatDisplayTime` | 3 | valid ISO, null, invalid string |
| `formatDisplayDateTime` | 2 | valid ISO, null |
| `isValidDateString` | 7 | valid, wrong separator, wrong format, letters, impossible date, leap day on leap year, leap day on non-leap year |
| `todayISODate` | 2 | format matches YYYY-MM-DD, equals today |
| `certDisplayTitle` | 2 | with cert number, null cert number |
| `certStatusLabel` | 5 | all four statuses + unknown value |
| `formatWeight` | 4 | whole number, custom unit, zero, fractional |
| `calcNetWeight` | 6 | normal, null gross, null tare, both null, zero tare, negative net |
| `calcVariancePercent` | 4 | normal, equal values, zero reference, negative difference |
| `buildLookup` | 3 | normal, empty array, duplicate keys |
| `stampDirty` | 3 | sets dirty, preserves lastSyncedAt, no mutation |
| `stampAuditCreate` | 1 | sets both timestamps |
| `stampAuditUpdate` | 1 | updates updatedAt, preserves createdAt |

---

## AI usage reflection

The leap year edge case was directly responsible for fixing a real bug — the test failed, I investigated why, and found the implementation was wrong. This is the clearest demonstration of how AI-generated tests add value beyond happy-path coverage. The immutability test for `stampDirty` was also a good catch — it's easy to write a stamp function that mutates its input and only notice the bug when React state stops updating.
