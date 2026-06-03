# Tasks 14 & 15: React Native Form with Validation

**Task 14:** Implement a React Native form using React Hook Form and Zod  
**Task 15:** Add validation messages for required fields and invalid ranges  
**Screen:** New Certificate — Step 1 (Details)  
**AI usage:** AI used to generate first-pass form code and list validation cases; all field rules manually verified against the Zod schema from Task 9 and the wireframe from Task 13.

---

## File

`Weighsoft.mobile.v1/src/NewCertificateForm.tsx`

---

## Dependencies to add

```bash
cd Weighsoft.mobile.v1
npm install react-hook-form zod @hookform/resolvers
```

---

## How it works

### React Hook Form + Zod (Task 14)

The form uses `useForm()` with `zodResolver()` as the validation resolver. This means:

- The Zod schema (`NewCertificateStep1Schema`) is the single source of truth for both TypeScript types and runtime validation.
- No manual `register()` calls needed — every field is wrapped in `<Controller>` which handles `value`, `onChange`, and `onBlur` automatically.
- The `handleSubmit()` wrapper only calls `onNext()` if all Zod rules pass.

```tsx
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(NewCertificateStep1Schema),
  mode: 'onTouched',  // validate as soon as the user leaves a field
});
```

---

## Validation Rules (Task 15)

### Required fields

| Field | Error message |
|-------|--------------|
| Effective Date | "Effective date is required" |
| Product | "Please select a product" |
| Haulier | "Please select a haulier" |
| Template | "Please select a certificate template" |

### Format rules

| Field | Rule | Error message |
|-------|------|--------------|
| Effective Date | Must match `YYYY-MM-DD` | "Date must be in YYYY-MM-DD format (e.g. 2024-06-01)" |

### Length / range rules

| Field | Max | Error message |
|-------|-----|--------------|
| Ticket No. | 50 chars | "Ticket number cannot exceed 50 characters" |
| Vehicle Reg. | 20 chars | "Vehicle registration cannot exceed 20 characters" |
| Certificate Title | 100 chars | "Title cannot exceed 100 characters" |
| Notes | 1000 chars | "Notes cannot exceed 1000 characters" |

### When errors appear

Errors are shown using `mode: 'onTouched'` — a field is validated as soon as the user leaves it (not only on submit). This gives immediate feedback without annoying the user before they've had a chance to type.

If the user taps "Next: Readings →" without filling required fields, a **summary banner** appears at the top of the form:

> *"3 fields need attention before you can continue."*

Each field also shows its own inline error message with a `⚠` icon directly below the input.

---

## Component Structure

```
NewCertificateForm
├── error summary banner (top — only visible after failed submit)
├── SectionHeader — "Weighing Information"
│   ├── Ticket No. (read-only)
│   ├── Effective Date (text input + validation)
│   ├── Product (SelectField dropdown)
│   ├── Haulier (SelectField dropdown)
│   ├── Vehicle Reg. (text input)
│   └── Contract (optional SelectField)
├── SectionHeader — "Certificate Details"
│   ├── Template (SelectField dropdown)
│   ├── Certificate Title (text input)
│   └── Notes (multiline input + char count)
└── action bar
    ├── Save Draft button (calls onSaveDraft with current values, no validation)
    └── Next: Readings → button (calls handleSubmit → onNext on success)
```

---

## Accessibility

- Every `TextInput` has `accessibilityLabel` and where relevant `accessibilityHint`
- `TouchableOpacity` buttons have `accessibilityRole="button"` and `accessibilityLabel`
- Error messages are placed directly below their field so screen readers read them in context
- `KeyboardAvoidingView` prevents the keyboard covering the active input on iOS

---

## What connects next

- **Task 17** — replace `PRODUCT_OPTIONS` / `HAULIER_OPTIONS` with real data from TanStack Query hooks
- **Task 19** — wire up the `onNext` prop to navigate to Step 2 using React Navigation
- **Task 29** — add auto-save so draft data is not lost if the app is closed mid-form
