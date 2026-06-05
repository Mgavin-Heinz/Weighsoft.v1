# Task 22: Refactor One Duplicated Code Area into a Shared Utility

**File:** `Weighsoft.mobile.v1/src/utils.ts`  
**AI usage:** AI used to identify duplication and propose refactor steps.

---

## What I asked AI to help with

I asked AI to scan the codebase and identify where the same logic was being written in multiple places, and propose the steps to extract it into a shared utility file.

## What AI identified as duplicated

AI found four areas of duplication across the codebase:

**1. Date formatting** — The pattern of converting ISO strings to display format (`"2024-06-01T08:00:00.000Z"` → `"01 Jun 2024"`) was written inline in the list screen, the detail screen stub, and would be needed again in PDF export. Each instance had slightly different null handling.

**2. Certificate display name** — The logic for showing a certificate number, or falling back to `"Draft — [date]"` when `certificateNo` is null, was duplicated inline in the list row, the detail header, and the PDF service stub.

**3. Company lookup dictionary** — The pattern of building a `{ [id]: record }` lookup object from an array was repeated in `HaulierController`, `GradeController`, and `ProductController` (identified in Task 11). AI noted this was also needed in the TypeScript codebase for the same reason.

**4. Sync dirty stamping** — Setting `sync.dirty = true` and updating `audit.updatedAt` was repeated in every write operation in `CertificateRepository`. AI suggested extracting these as pure functions so they can be tested independently and reused in any future repository.

## Refactor steps AI proposed

1. Create `utils.ts` in `src/`
2. Move date formatting functions first — they have no dependencies
3. Add certificate display helpers — depend on date utils
4. Add weight/number formatting — independent
5. Add `buildLookup` — generic, no dependencies
6. Add audit and sync stamp helpers — depend only on `Date`
7. Export everything from the file and update all import sites

## What I changed after reviewing

I followed the steps in order. I added `calcNetWeight` and `calcVariancePercent` as weight calculation utilities, which AI didn't suggest but are needed for the results summary screen in Task 33. I also added `isValidDateString` as a pure validator to support the Zod schema testing in Task 24.

## Implementation

### Functions extracted

**Date utilities**

| Function | Input | Output |
|---|---|---|
| `formatDisplayDate` | ISO string or null | `"01 Jun 2024"` or `"—"` |
| `formatDisplayTime` | ISO string or null | `"08:00"` or `"—"` |
| `formatDisplayDateTime` | ISO string or null | `"01 Jun 2024  08:00"` or `"—"` |
| `isValidDateString` | `string` | `boolean` — validates YYYY-MM-DD including leap years |
| `todayISODate` | — | `"2024-06-01"` (today) |

**Certificate display utilities**

| Function | Input | Output |
|---|---|---|
| `certDisplayTitle` | cert with `certificateNo`, `status`, `effectiveDate` | Certificate number or `"Draft — 01 Jun 2024"` |
| `certStatusLabel` | status string | Human label e.g. `"In Review"` |

**Weight utilities**

| Function | Input | Output |
|---|---|---|
| `formatWeight` | number, unit | `"5 000 kg"` (SA number format) |
| `calcNetWeight` | gross, tare | net number or `null` if either input is null |
| `calcVariancePercent` | value, reference | percentage difference, always positive, 0 if reference is 0 |

**Lookup utility**

| Function | Input | Output |
|---|---|---|
| `buildLookup` | array of objects, key field | `{ [keyValue]: object }` dictionary |

**Stamp utilities**

| Function | Input | Output |
|---|---|---|
| `stampDirty` | document with `sync` | Same doc with `sync.dirty = true` |
| `stampAuditCreate` | document with `audit` | Same doc with both timestamps set to now |
| `stampAuditUpdate` | document with `audit` | Same doc with `updatedAt` set to now |

### Tests

All utility functions are unit tested in `utils.test.ts` (Task 23). 49 tests covering happy paths, null inputs, edge cases, and leap year handling.

---

## AI usage reflection

AI's identification of the company lookup duplication was the most surprising — it connected the PHP controller pattern from Task 11 to the TypeScript codebase and pointed out the same pattern would be needed again. The audit stamp helpers were entirely AI's suggestion and are the kind of small extract that's easy to skip but prevents a class of bugs where you forget to update a timestamp on a write.
