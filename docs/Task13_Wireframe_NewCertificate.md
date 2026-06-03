# Task 13: Screen Wireframe — New Certificate Mobile Workflow

**Feature:** Create New Weighing Certificate  
**Platform:** Mobile (React Native / Expo)  
**AI usage:** AI used to convert the existing web transaction controller and certificate schema into a mobile user-flow draft; layout manually refined.

---

## Workflow Overview

The new certificate screen is a 4-step wizard. The wireframe covers **Step 1: Details** in full — the other steps are shown as inactive indicators.

| Step | Name | What happens |
|------|------|-------------|
| 1 | Details | User picks product, haulier, vehicle, contract, template, and date |
| 2 | Readings | User captures or enters GROSS, TARE, and REFERENCE weights |
| 3 | Summary | Calculated NET weight, variance, and tolerance check shown |
| 4 | Review | Final preview before submitting for review or saving as draft |

---

## Step 1 — Details: Field Breakdown

### Weighing Information section

| Field | Required | Input type | Notes |
|-------|----------|------------|-------|
| Ticket No. | No | Auto-generated text | Read-only, shown greyed out |
| Effective Date | Yes | Date picker | Defaults to today |
| Product | Yes | Dropdown | Filtered by company |
| Haulier | Yes | Dropdown | Filtered by company + site |
| Vehicle Reg. | No | Text input | Free-text, e.g. "GP 123-456" |
| Contract | No | Dropdown | Optional link to existing contract |

### Certificate Details section

| Field | Required | Input type | Notes |
|-------|----------|------------|-------|
| Template | Yes | Dropdown | e.g. Standard, Custom |
| Certificate Title | No | Text input | Defaults to "Weighing Certificate" |
| Notes | No | Multiline text | Max 1000 chars |

---

## UI Decisions

- **4-step progress indicator** at the top — shows current step (filled circle) and remaining steps (empty circles with dashed connectors). Mirrors a common mobile wizard pattern.
- **Two-column layout** for short fields (date + ticket, product + haulier) to reduce scrolling.
- **Readings preview panel** at the bottom of Step 1 shows greyed-out placeholders for GROSS, TARE, NET — gives the operator a sense of what's coming next.
- **Validation error banner** appears inline below the form, not as a toast, so it stays visible while the user corrects the field.
- **Two bottom actions**: "Save Draft" (outline button, secondary) and "Next: Readings →" (filled button, primary). This matches the Task 5 Certificate Drafts requirement — operators can save work-in-progress at any step.

---

## File

`docs/Task13_Wireframe_NewCertificate.svg` — open in any browser or Figma to view.
