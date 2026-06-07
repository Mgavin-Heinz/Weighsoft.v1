# Task 28: QA Checklist — New Certificate Form (Step 1)

**Feature:** New Certificate Form — Step 1 (Details)  
**File tested:** `Weighsoft.mobile.v1/src/NewCertificateForm.tsx`  
**AI usage:** Used AI to generate the initial list of happy-path and failure-path checks. Reviewed each one manually and added device-specific and edge cases AI missed.

---

## How to run these tests

These are manual tests. To test the form:

1. Make sure the Expo app is running: `npx expo start` in `Weighsoft.mobile.v1/`
2. Open on a physical device or emulator
3. Navigate to the New Certificate screen
4. Work through each checklist item below
5. Mark ✅ Pass or ❌ Fail and note any issues

---

## Happy Path — Everything works correctly

These are the scenarios that should work without any problems.

- [ ] Form loads without crashing and all fields are visible
- [ ] Effective Date field pre-fills with today's date in YYYY-MM-DD format
- [ ] Certificate Title field pre-fills with "Weighing Certificate"
- [ ] Ticket No. field shows "Auto-generated" and cannot be typed into
- [ ] Product dropdown opens when tapped and shows the list of products
- [ ] Selecting a product from the dropdown closes the dropdown and shows the selected value
- [ ] Haulier dropdown opens and shows the list of hauliers
- [ ] Selecting a haulier closes the dropdown and shows the selected value
- [ ] Template dropdown opens and shows Standard and Custom Header options
- [ ] Vehicle Reg field accepts text input and shows what is typed
- [ ] Notes field accepts multiline text
- [ ] Notes character counter updates as text is typed (shows "X / 1000")
- [ ] Filling all required fields and tapping "Next: Readings →" calls the onNext callback with the form values
- [ ] Tapping "Save Draft" at any point calls the onSaveDraft callback with whatever values are currently entered — even if required fields are empty
- [ ] Keyboard dismisses when tapping outside a text field
- [ ] On iOS the form scrolls up when the keyboard opens so the active field is visible
- [ ] On Android the form adjusts correctly for the keyboard

---

## Failure Path — Validation errors

These test that the form correctly blocks submission and shows the right error messages.

### Required field errors

- [ ] Tapping "Next" with no fields filled shows the error banner: "4 fields need attention before you can continue"
- [ ] Effective Date field shows "Effective date is required" when left empty and tapped away
- [ ] Product field shows "Please select a product" when not selected and form is submitted
- [ ] Haulier field shows "Please select a haulier" when not selected and form is submitted
- [ ] Template field shows "Please select a certificate template" when not selected and form is submitted

### Format errors

- [ ] Typing "01/06/2024" in Effective Date shows "Date must be in YYYY-MM-DD format (e.g. 2024-06-01)"
- [ ] Typing "abc" in Effective Date shows the format error message
- [ ] Typing a valid date "2024-06-01" clears the error message

### Length limit errors

- [ ] Typing more than 100 characters in Certificate Title shows "Title cannot exceed 100 characters"
- [ ] Typing more than 20 characters in Vehicle Reg shows "Vehicle registration cannot exceed 20 characters"
- [ ] Typing more than 1000 characters in Notes shows "Notes cannot exceed 1000 characters"
- [ ] Notes field hard-stops at 1000 characters — cannot type further

### Error banner behaviour

- [ ] Error banner appears at the top of the form after a failed submit attempt
- [ ] Error banner shows the correct count: "1 field needs attention" (singular) when only one field has an error
- [ ] Error banner shows "X fields need attention" (plural) when multiple fields have errors
- [ ] Error banner disappears once all errors are resolved and form is resubmitted

### Field-level error timing

- [ ] Errors appear on a field after the user taps away from it (onTouched mode) — not before they interact with it
- [ ] Errors do not all appear at once when the form first loads
- [ ] After submitting with errors, all fields with errors show their messages immediately

---

## Edge Cases

These are less obvious scenarios that could cause problems.

- [ ] Contract dropdown with no options shows the placeholder "Select contract…" and does not crash
- [ ] Tapping "Save Draft" immediately on a fresh form (all default values, no changes) does not crash
- [ ] Rotating the device does not lose form data already entered
- [ ] Navigating away from the form and back does not restore old data (form resets)
- [ ] Setting Effective Date to a past date (e.g. "2020-01-01") is accepted — the form does not require future dates
- [ ] Setting Effective Date to a future date is also accepted
- [ ] Typing "2024-02-29" (leap day on a leap year) is accepted as a valid date
- [ ] Typing "2023-02-29" (leap day on a non-leap year) shows the format error
- [ ] Clearing the Certificate Title field completely still submits successfully — the default "Weighing Certificate" is applied by the schema
- [ ] Vehicle Reg field auto-capitalises input on both iOS and Android

---

## Accessibility checks

- [ ] All form fields have readable labels when using VoiceOver (iOS) or TalkBack (Android)
- [ ] The "Next: Readings →" button announces itself correctly to screen readers
- [ ] The "Save Draft" button announces itself correctly to screen readers
- [ ] Error messages are announced by screen readers when they appear
- [ ] The form can be fully completed using only the keyboard (no touch required on tablet)

---

## Known limitations (not bugs)

These are things that don't work yet because they depend on future tasks:

- Product and Haulier dropdowns show hardcoded demo data — real API data is connected in Task 17
- Contract dropdown is always empty — contracts feature not yet implemented
- "Next: Readings →" button navigates nowhere yet — navigation wired up in Task 19
- Form does not auto-save on close — auto-save implemented in Task 29

---

## AI usage reflection

AI generated a solid first pass of happy-path checks (form loads, fields accept input, submit works) and the standard validation error cases (required fields, format errors). The cases I added myself were the edge cases section — particularly the leap year date test, the "Save Draft on fresh form" test, and the accessibility checks. AI didn't mention accessibility at all in its initial list. I also added the "Known limitations" section so a tester knows what's intentionally not working yet versus what's a real bug.
