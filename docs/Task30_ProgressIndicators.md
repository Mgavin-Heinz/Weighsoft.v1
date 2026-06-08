# Task 30: Add Progress Indicators to a Multi-Step Wizard

**File:** `Weighsoft.mobile.v1/src/WizardProgress.tsx`  
**AI usage:** Used AI to propose UX states and copy for each step.

---

## What I asked AI to help with

I asked AI to propose the UX states each step could be in, the right labels and button copy for each step, and what visual feedback the user should get as they move through the wizard.

## What AI proposed

### UX states per step

AI identified three states a step indicator can be in:

- **Completed** — the user has been through this step and it passed validation. Should look clearly done — AI suggested a checkmark rather than the step number, in a green filled circle.
- **Current** — the step the user is on right now. Should stand out — AI suggested a filled blue circle with the step number.
- **Upcoming** — not reached yet. Should look inactive — AI suggested an empty/outlined circle with a grey step number.

AI also suggested that completed steps should be tappable so the user can go back and edit earlier steps without losing their progress. I agreed and implemented this.

### Button copy

AI drafted the button labels for each step. I changed one:

| Step | AI suggested | What I used | Why I changed it |
|---|---|---|---|
| 1 | "Continue to Readings" | "Next: Readings →" | Shorter, consistent with mobile conventions |
| 2 | "Continue to Summary" | "Next: Summary →" | Same reason |
| 3 | "Continue to Review" | "Next: Review →" | Same reason |
| 4 | "Confirm and Submit" | "Submit for Review" | The cert goes to UNDER_REVIEW, not finalised — "Confirm and Submit" implied it was done |

### Connector lines

AI suggested the connector line between steps should change colour when the step to the left is completed — green line between two completed steps, grey line between completed and upcoming. I implemented this.

## Implementation

### Components

**`WizardProgress`** — the horizontal step bar at the top. Each step shows a circle, label, and connector. Completed steps have a green checkmark circle, current step has a blue number circle, upcoming steps have a grey outlined circle. Completed steps are tappable.

**`WizardNavBar`** — the bottom action bar with Back, Save Draft, and Next buttons. Back is hidden on step 1. The Next button text changes per step. On step 4 the button turns green and reads "Submit for Review".

**`CertificateWizard`** — the container that manages which step is current, which are completed, and renders the right content. Each step's content is a placeholder ready to be replaced with the real screen components.

### Step definitions

All step labels, sublabels, button copy and header titles are defined in one `WIZARD_STEPS` array. Changing a label in one place updates everywhere it's used.

### Visual states

| State | Circle | Circle content | Label colour | Connector |
|---|---|---|---|---|
| Completed | Filled green | ✓ | Green | Green |
| Current | Filled blue | Step number | Blue bold | Grey |
| Upcoming | Outlined grey | Step number grey | Grey | Grey |

### Accessibility

- Each step circle has `accessibilityLabel` describing the step name and state (completed/current/not yet reached)
- `accessibilityState={{ selected: isCurrent, disabled: !isCompleted }}` so screen readers announce the current step correctly
- Back, Save Draft and Next buttons all have descriptive `accessibilityLabel` props

### How to connect the real step screens

Replace the `StepContent` placeholder function with the real screens:

```tsx
function StepContent({ step }: { step: WizardStep }) {
  switch (step) {
    case 1: return <NewCertificateForm ... />;   // Task 14
    case 2: return <ReadingsScreen ... />;
    case 3: return <SummaryScreen ... />;         // Task 33
    case 4: return <ReviewScreen ... />;
  }
}
```

---

## AI usage reflection

The three-state model (completed/current/upcoming) and the connector colour change were both AI suggestions that I kept as-is — they're standard wizard UI patterns and AI described them well. The button copy change on step 4 was the most important manual edit, because AI's suggestion ("Confirm and Submit") didn't accurately reflect the workflow — submitting puts the cert in UNDER_REVIEW for an admin to approve, it doesn't finalise it. Getting that copy right matters because operators read it and it sets their expectations for what happens next.
