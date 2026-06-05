# Task 21: Implement a Reusable UI Component

**File:** `Weighsoft.mobile.v1/src/components.tsx`  
**AI usage:** AI used to suggest props and usage examples.

---

## What I asked AI to help with

I asked AI to suggest what props each component should accept and provide usage examples, so I could design a consistent API before writing the implementation.

## What AI suggested

For `FormSection`, AI suggested:

- `title: string` — the section heading
- `children: ReactNode` — the form fields inside
- A `required` indicator prop to show a `*` next to the title for sections where all fields are mandatory
- A `hint` prop for helper text below the heading

AI noted that `spaceAbove` is a common prop to add to section components in React Native because the first section on a screen should not have top margin, but subsequent sections should.

For `StatusBadge`, AI suggested:

- A `size` prop with values `'sm' | 'md' | 'lg'` — list rows need a compact badge, detail screens need a larger one
- A dot indicator inside the badge alongside the label, rather than just a background colour, for better accessibility (colour is not the only visual signal)

For `InfoRow`, AI suggested an `action` prop — an optional button on the right side of the row, useful for "Edit" or "View" links without needing a separate row.

For `EmptyCard`, AI suggested keeping it generic enough to be used anywhere in the app, not just for certificates.

## What I changed after reviewing

I kept all the suggested props. I changed `StatusBadge` to compute the dot size from the `size` prop rather than having separate style objects, which AI's version repeated. I also added `alignSelf: 'flex-start'` to the badge to prevent it stretching to fill its container when used in a flex row.

## Implementation

### FormSection

Groups form fields under a labelled section header, consistent with the wireframe from Task 13.

```tsx
<FormSection title="Weighing Information" required>
  <Controller name="productId" ... />
  <Controller name="haulierId" ... />
</FormSection>
```

Props: `title`, `hint?`, `required?`, `children`, `spaceAbove?` (default `true`)

### StatusBadge

Colour-coded pill with a status dot. Used in `CertificateListScreen` (Task 16) and anywhere a cert status needs to be displayed.

```tsx
<StatusBadge status="DRAFT" />
<StatusBadge status="FINALIZED" size="lg" />
```

| Status | Background | Text | Dot |
|---|---|---|---|
| DRAFT | Light grey | Dark grey | Grey |
| UNDER_REVIEW | Yellow | Amber | Amber |
| FINALIZED | Green | Dark green | Green |
| CANCELLED | Red | Dark red | Red |

Props: `status: CertStatus`, `size?: 'sm' | 'md' | 'lg'` (default `'md'`)

### InfoRow

Label + value display row for detail screens. Handles null/undefined values gracefully with a configurable `emptyText` placeholder.

```tsx
<InfoRow label="Product" value="Iron Ore" />
<InfoRow label="Contract" value={null} emptyText="No contract linked" />
<InfoRow label="Haulier" value="Limpopo Heavy" action={{ label: 'View', onPress: () => {} }} />
```

Props: `label`, `value?`, `emptyText?` (default `'—'`), `action?: { label, onPress }`

### EmptyCard

Standardised empty/placeholder card used across the app for sections that have no data yet.

```tsx
<EmptyCard
  icon="📋"
  title="No readings yet"
  subtitle="Capture the gross weight to get started"
  action={{ label: 'Capture Reading', onPress: handleCapture }}
/>
```

Props: `icon?`, `title`, `subtitle?`, `action?: { label, onPress }`

---

## AI usage reflection

The `size` prop suggestion for `StatusBadge` was the most useful — it's the kind of design decision that's easy to skip until you notice list badges look oversized on detail screens. The `action` prop on `InfoRow` was also worth keeping as it prevents the need for a separate component just to add a navigation link next to a label. I designed the colour system and the dot indicator approach myself to meet accessibility requirements.
