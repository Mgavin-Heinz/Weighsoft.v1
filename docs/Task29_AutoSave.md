# Task 29: Implement Auto-Save for a Draft Form

**File:** `Weighsoft.mobile.v1/src/useAutoSave.ts`  
**AI usage:** Used AI to reason about debounce timing and data-loss scenarios before writing any code.

---

## What I asked AI to help with

Before writing the hook I talked through the problem with AI to identify every scenario where data could be lost, and what the right debounce timing should be for a weighbridge operator context.

## What AI helped me reason through

### Debounce timing

I asked AI whether 500ms, 1000ms, or 2000ms was the right debounce for auto-save. AI's reasoning:

- **500ms** is too short — it would save on almost every keystroke, hammering AsyncStorage and causing the "Saving…" indicator to flicker constantly
- **2000ms** is too long — if the app crashes 1 second after the user finishes typing, the draft is lost
- **1500ms** is the right balance — short enough to save before most crashes, long enough to batch rapid keystrokes into a single write

AI also pointed out that debounce alone isn't enough — you need to flush immediately when the app goes to the background (user presses home button), since the OS may kill the app shortly after backgrounding.

### Data-loss scenarios

AI listed six scenarios to handle. I went through each one and decided how to address it:

| Scenario | AI identified? | How handled |
|---|---|---|
| User types quickly — too many saves | ✅ | Debounce 1500ms |
| App crashes mid-save — corrupted storage | ✅ | AsyncStorage writes are atomic — no corruption risk |
| User force-closes app | ✅ | AppState listener flushes on background/inactive |
| User navigates away before debounce fires | ✅ | useEffect cleanup flushes pending save |
| Save fails (storage full) | ✅ | try/catch sets error status, shows warning to user |
| Stale draft restored after days | ✅ | Drafts older than 24 hours are silently discarded |

One scenario AI missed that I added myself: **what if the user opens the form and a draft exists from a previous session?** I added `useDraftRestore` and `DraftRestorePrompt` to handle this — the user is shown how old the draft is and given the choice to restore or discard it.

## Implementation

### Files

**`useAutoSave.ts`** — contains four exports:
- `useAutoSave()` — the main hook
- `useDraftRestore()` — checks for a saved draft on mount
- `AutoSaveIndicator` — UI component showing save status
- `DraftRestorePrompt` — UI component for restoring a saved draft

### How to use it in NewCertificateForm

```tsx
import { useAutoSave, useDraftRestore, AutoSaveIndicator, DraftRestorePrompt } from './useAutoSave';

export function NewCertificateForm({ onNext, onSaveDraft }) {
  const { control, handleSubmit, watch, reset } = useForm({ ... });

  // Watch all form values for auto-save
  const watchedValues = watch();

  // Auto-save hook
  const { status, lastSavedAt, clearDraft } = useAutoSave(watchedValues);

  // Check for existing draft on mount
  const { draft, discardDraft, isChecking } = useDraftRestore();

  return (
    <KeyboardAvoidingView>
      {/* Status bar — shows "Saving…" / "Saved 2s ago" / error */}
      <AutoSaveIndicator status={status} lastSavedAt={lastSavedAt} />

      {/* Restore prompt — shown if a draft was found */}
      {draft && (
        <DraftRestorePrompt
          draft={draft}
          onRestore={() => {
            reset(draft.values);
            discardDraft();
          }}
          onDiscard={discardDraft}
        />
      )}

      {/* ... rest of the form */}
    </KeyboardAvoidingView>
  );
}
```

### Auto-save flow

```
User types in a field
    │
    ▼
watchedValues changes
    │
    ▼
useEffect fires → clears previous timer → starts 1500ms timer
    │
    ├─ User keeps typing → timer resets (debounce)
    │
    ├─ User pauses 1500ms → saveNow() called → AsyncStorage.setItem()
    │
    ├─ User navigates away → cleanup flushes immediately
    │
    └─ App goes to background → AppState handler flushes immediately
```

### Draft restore flow

```
Form mounts
    │
    ▼
useDraftRestore checks AsyncStorage
    │
    ├─ No draft found → isChecking = false, draft = null → normal form
    │
    ├─ Draft found but > 24 hours old → silently discarded → normal form
    │
    └─ Draft found and recent → draft = DraftData
           │
           ▼
       DraftRestorePrompt shown
           │
           ├─ User taps "Restore Draft" → reset(draft.values) → form pre-filled
           │
           └─ User taps "Discard" → draft removed from storage → normal form
```

### AutoSaveIndicator states

| Status | Display | Colour |
|---|---|---|
| `idle` | Hidden | — |
| `saving` | "💾 Saving draft…" | Neutral |
| `saved` | "✓ Saved just now" / "✓ Saved 2 mins ago" | Green |
| `error` | "⚠️ Draft could not be saved" | Red |

---

## AI usage reflection

The debounce timing discussion was the most useful part — I wouldn't have thought to flush immediately on AppState background without AI raising it. The data-loss scenario list was also a good structured approach to thinking through edge cases before writing code. The draft restore feature (what happens when you reopen the form) was something I designed entirely myself — AI only addressed what happens while the form is open, not what happens the next time the user opens it.
