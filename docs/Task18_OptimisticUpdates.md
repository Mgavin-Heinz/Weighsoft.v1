# Task 18: Add Optimistic Updates to a Simple Edit Flow

**File:** `Weighsoft.mobile.v1/src/EditCertificateForm.tsx`  
**AI usage:** AI used to identify rollback scenarios.

---

## What I asked AI to help with

I asked AI to identify all the scenarios where an optimistic update could go wrong and need to be rolled back, since an optimistic update applies a change to the UI before the server confirms it.

## What AI identified as rollback scenarios

AI listed five distinct rollback scenarios for a certificate edit:

**Scenario 1 — Network failure.**  
The request never reaches the server. The `onError` handler in TanStack Query's `useMutation` fires, restoring the previous cache snapshot. The user sees a toast explaining the connection failed.

**Scenario 2 — Server 422 validation error.**  
The request reaches the server but is rejected as invalid (e.g. a field value that passed client-side Zod validation but failed a server-side business rule). Same rollback path — `onError` fires, snapshot is restored, error message shown to user with guidance to check their input.

**Scenario 3 — Status conflict.**  
While the user was filling out the edit form, another user or device moved the certificate to FINALIZED or CANCELLED. The server returns an error indicating the cert's status has changed. The optimistic update is rolled back and the user is told the cert has been updated by someone else.

**Scenario 4 — Concurrent edit.**  
Two users edit different fields of the same cert simultaneously. The second write wins at the server. The `onSettled` refetch after the mutation resolves brings back the server's true state, which may differ from what either user expects. This is resolved to server truth rather than doing any merge logic.

**Scenario 5 — App backgrounds mid-mutation.**  
The user sends the edit and immediately switches to another app. The mutation's `onSettled` callback still fires when the response arrives (React Native keeps the JS runtime alive). When the user returns, the UI reflects server truth because `onSettled` triggered a refetch.

## What I changed after reviewing

I kept all five scenarios in the implementation. I added an immutability guard at the top of `onSubmit` that checks the cert's current status before allowing any edit — FINALIZED and CANCELLED certs show a warning banner and block the save button entirely, preventing the optimistic update from ever firing for certs that cannot be changed.

AI did not mention this guard, but it prevents scenario 3 from being a surprise to the user if they somehow have a stale cert open that was already finalised.

## Implementation

### How the optimistic update works

```
User taps Save
    │
    ▼
handleSubmit → onMutate fires immediately
    │   - Cancel any in-flight refetches for this cert
    │   - Snapshot current cache value
    │   - Apply patch to cache immediately (UI updates now)
    │   - Return snapshot for rollback
    │
    ├─ Server responds OK → onSettled refetches to confirm
    │
    └─ Server responds error → onError restores snapshot
                              → onSettled refetches to confirm true state
```

### Rollback implementation in useUpdateCertificate

```typescript
onMutate: async ({ id, patch }) => {
  await qc.cancelQueries({ queryKey: certKeys.detail(id) });
  const previous = qc.getQueryData(certKeys.detail(id));
  if (previous) {
    qc.setQueryData(certKeys.detail(id), { ...previous, ...patch });
  }
  return { previous, id };
},

onError: (_err, _vars, context) => {
  if (context?.previous) {
    qc.setQueryData(certKeys.detail(context.id), context.previous);
  }
},

onSettled: (_data, _err, { id }) => {
  qc.invalidateQueries({ queryKey: certKeys.detail(id) });
  qc.invalidateQueries({ queryKey: certKeys.lists() });
},
```

### Rollback scenarios handled

| Scenario | Detection | Response |
|---|---|---|
| Network failure | `err` in `onError` | Restore snapshot, show "check connection" toast |
| Server 422 validation | `err.message.startsWith('API 422')` | Restore snapshot, show "check input" message |
| Status conflict | `err.message.includes('status')` | Restore snapshot, show "updated by someone else" message |
| Concurrent edit | Any error | `onSettled` refetch resolves to server truth |
| App backgrounds | N/A | `onSettled` fires on return, corrects state |

### Immutability guard

FINALIZED and CANCELLED certificates display a warning banner and disable the save button. The `onSubmit` handler also checks status and returns early with an alert if a finalised cert is somehow submitted (defensive coding).

---

## AI usage reflection

AI's rollback scenario list was the core value here — it made me think about edge cases I wouldn't have considered immediately, particularly scenario 5 (backgrounding) and scenario 3 (status conflict as a distinct case from generic validation error). I added the immutability guard and the status-specific error handling in the catch block myself.
