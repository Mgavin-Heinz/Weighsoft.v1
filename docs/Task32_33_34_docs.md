# Task 32: Test Fixtures for Uncertainty/Calibration Calculations

**File:** `Weighsoft.mobile.v1/src/uncertainty.test.ts`  
**AI usage:** AI used to generate sample datasets; expected values verified manually before use.

---

## What I asked AI to help with

I asked AI to generate realistic sample datasets for weighbridge readings that would cover different scenarios — consistent readings, a single reading, wide spread, and identical readings.

## What AI generated

AI suggested four fixture scenarios which I kept:

- **Consistent** — three readings close together (5000, 5002, 4998 kg), 2kg scale division. Represents a good weighing.
- **Single reading** — one reading only (10000 kg), 5kg scale division. Tests that uncertainty comes entirely from resolution when there's no repeatability data.
- **Wide spread** — four readings with high variance (4980, 5010, 5005, 4995 kg). Represents a noisy scale or unstable load.
- **Identical** — three identical readings (2500 kg). Tests that standard deviation is exactly zero.

## Verification process

For each fixture I manually calculated the expected values in a spreadsheet before writing the test assertions. For example for the consistent fixture:

- Mean = (5000 + 5002 + 4998) / 3 = 5000 ✓
- Std dev = √[(0² + 2² + (-2)²) / (3-1)] = √[8/2] = √4 = 2 ✓
- Repeatability u = 2 / √3 = 1.1547 ✓
- Resolution u = 2 / (2√3) = 0.5774 ✓
- Combined u = √(1.1547² + 0.5774²) = √(1.3333 + 0.3333) = √1.6667 = 1.291 ✓
- Expanded U = 2 × 1.291 = 2.582 ✓

**30 tests, all passing.**

---

## AI usage reflection

AI's dataset suggestions were realistic and covered the right scenarios. The manual verification step was essential — AI got the scenario descriptions right but I needed to calculate the expected values myself to make sure the tests were actually asserting correct outputs rather than just asserting whatever the code happened to produce.

---

# Task 33: Implement a Results Summary Screen

**File:** `Weighsoft.mobile.v1/src/UncertaintySummaryScreen.tsx`  
**AI usage:** AI used to draft labels, helper text, and error wording.

---

## What I asked AI to help with

I asked AI to suggest appropriate labels and helper text for each row in the uncertainty budget display, and the right wording for the tolerance warning.

## What AI suggested and what I changed

| Element | AI suggested | What I used | Why changed |
|---|---|---|---|
| Main result label | "Expanded Uncertainty" | "Measurement Uncertainty (U)" | Operators don't know what "expanded" means |
| k=2 helper text | "two sigma" | "95% confidence interval" | More meaningful to non-statisticians |
| Tolerance fail | "Out of specification" | "Exceeds tolerance" | Less alarming, more accurate |
| Retry button | "Retake measurements" | "← Recalculate" | Shorter, consistent with nav pattern |
| Accept despite warning | "Submit anyway" | "Accept Anyway →" | Clearer that this is a deliberate override |

## Screen sections

**Header** — large mean weight, formatted result string, tolerance pass/fail badge

**Warning banner** — shown only when expanded uncertainty exceeds the tolerance limit. Explains what to do (take more readings or check calibration).

**Uncertainty budget table** — shows every component with helper text explaining what each number means. Highlighted rows for mean weight and expanded uncertainty.

**Actions** — Recalculate (goes back to readings) and Accept (continues to review step).

---

## AI usage reflection

The copy suggestions were useful as a starting point but needed adjustment for the operator audience. The most important change was replacing "expanded uncertainty" with "measurement uncertainty" — the technical term is correct but meaningless to a weighbridge operator who just needs to know if the scale is working properly.

---

# Task 34: Add Error Surfacing for Failed Database Operations

**File:** `Weighsoft.mobile.v1/src/errorSurfacing.tsx`  
**AI usage:** AI used to list likely failure modes for PouchDB operations.

---

## What I asked AI to help with

I asked AI to list all the ways a PouchDB database operation could fail in a mobile offline-first app, so I could make sure every failure mode was handled.

## Failure modes AI identified

1. **Document not found** — the cert was deleted on another device while this device had it cached
2. **Write conflict** — two devices edited the same cert while offline and the sync collided
3. **Validation failure** — the document failed schema validation before being written
4. **Invalid status transition** — the cert was already finalised or cancelled on another device
5. **Storage quota exceeded** — the device ran out of storage
6. **Network error** — sync failed because there was no connection

AI missed one I added: **authentication expiry** — the JWT token expired while the user was working. This would manifest as an API error during sync.

## Implementation

**`classifyDbError(error)`** — takes any thrown error and returns a `ClassifiedError` with:
- `type` — machine-readable error category
- `title` — short user-facing heading
- `message` — full explanation with guidance
- `retryable` — whether a retry button should be shown
- `blocking` — whether the user should be prevented from continuing

**`DbErrorBanner`** — React Native component that displays the error with optional Retry and Dismiss buttons.

## Error copy principles

- Tell the user what happened, not the technical reason
- Tell them what to do next, not just that something failed
- For sync errors specifically, reassure them their data is safe locally
- Never show raw error messages, stack traces, or internal codes

---

## AI usage reflection

The failure mode list was the core value — it gave a complete checklist to build against rather than handling errors reactively as they occurred. The network error copy ("Your changes have been saved locally and will sync when you reconnect") was something I added myself — AI's version just said "network error occurred" which doesn't reassure the user that their work isn't lost, which is the most important thing to communicate in an offline-first app.
