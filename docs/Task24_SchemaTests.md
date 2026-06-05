# Task 24: Add Unit Tests for a Validation Schema

**File:** `Weighsoft.mobile.v1/src/schema.test.ts`  
**AI usage:** AI used to generate valid and invalid payloads.

---

## What I asked AI to help with

I asked AI to generate a set of valid payloads that should pass the `NewCertificateStep1Schema` and invalid payloads that should fail it, covering every field's validation rule.

## What AI generated

AI produced a systematic set of payload pairs for each field, structured around what I should test:

**Valid payloads AI generated:**
- A fully populated payload with all optional fields filled
- A minimal payload with only required fields
- Payloads at exact boundary values (notes at exactly 1000 chars, title at exactly 100 chars)
- A payload with `contractId: null` to confirm nullable fields work
- A payload with optional fields omitted entirely (vs set to empty string)
- A leap day `effectiveDate` (`"2024-02-29"`) to confirm valid dates pass
- A payload that checks the `certificateTitle` default is applied when the field is omitted

**Invalid payloads AI generated:**
- Missing each required field individually — `effectiveDate`, `productId`, `haulierId`, `templateId`
- Wrong date formats: `"01/06/2024"`, `"06-01-2024"`
- Empty strings for required fields
- `null` for required string fields
- A number where a string is expected
- Values one character over each length limit

**Edge cases AI added:**
- An entirely empty object `{}` — should fail with multiple errors
- An extra unknown field — should be silently stripped (Zod's default strip mode)

## What I changed after reviewing

I kept all AI-generated payloads. I added a helper function `expectValid()` that throws a descriptive error message including the Zod issues when a payload unexpectedly fails — this makes test failures much easier to diagnose. I also added `expectInvalid(data, fieldPath)` which asserts both that the parse failed and that the error is on the expected field path.

## Test structure

```typescript
function valid(overrides = {}) {
  return {
    effectiveDate: '2024-06-01',
    productId:     'prod-ivm-ore',
    haulierId:     'haul-ivm-01',
    templateId:    'tpl-standard',
    certificateTitle: 'Weighing Certificate',
    ...overrides,
  };
}
```

Every test calls `valid()` and overrides only the field being tested. This means adding a new required field to the schema will cause all tests to fail, which is the desired behaviour — it forces updating the test fixtures.

## Test results

All schema tests pass against `NewCertificateStep1Schema`.

### Test coverage by category

| Category | Tests | What's covered |
|---|---|---|
| Valid payloads | 8 | Full payload, minimal, boundaries, null optional, omitted optional, leap day, default applied |
| effectiveDate invalid | 6 | Missing, wrong separator, wrong format, letters, empty string, null |
| productId invalid | 2 | Missing, empty string |
| haulierId invalid | 2 | Missing, empty string |
| templateId invalid | 2 | Missing, empty string |
| Length limits | 4 | notes > 1000, title > 100, vehicleReg > 20, ticketNo > 50 |
| Edge cases | 4 | Empty object, null for required, number for string, unknown field stripped |

### Total: 28 tests, all passing

---

## AI usage reflection

The systematic coverage AI produced — testing each required field's absence individually — is something I would probably have abbreviated manually by testing just one or two. The unknown field stripping test was also a good reminder that Zod's default mode silently strips unknown fields rather than rejecting them, which is worth explicitly testing and documenting as expected behaviour. The helper functions I added on top of AI's suggestions made the tests significantly more readable when failures occur.
