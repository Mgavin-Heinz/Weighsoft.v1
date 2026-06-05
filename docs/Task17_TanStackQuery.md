# Task 17: Connect a Screen to TanStack Query

**File:** `Weighsoft.mobile.v1/src/useCertificates.ts`  
**AI usage:** AI used to explain cache invalidation and stale-data risks.

---

## What I asked AI to help with

I asked AI to explain how TanStack Query's cache works and what the risks are when data goes stale — particularly in a mobile offline-first app where certificates may be edited on multiple devices simultaneously.

## What AI explained about cache invalidation

AI walked through three main stale-data scenarios:

**Scenario 1 — Another device edits a cert while this device has it cached.**  
TanStack Query will re-fetch on window focus by default (`refetchOnWindowFocus: true`). Setting `staleTime: 30_000` means cached data is considered fresh for 30 seconds — after that, any re-render of a component using the query will trigger a background fetch. This is the right balance for a weighbridge app where updates happen over seconds, not milliseconds.

**Scenario 2 — This device creates or updates a cert.**  
After a successful mutation, the query cache must be invalidated so the list re-fetches. AI explained that invalidating the entire `['certificates', 'list']` subtree (rather than a specific filter key) is safer because a new cert might appear under multiple different filter combinations — you can't predict which cached list queries need updating.

**Scenario 3 — An optimistic update is rolled back.**  
If the server rejects an update, the cache is left in an incorrect optimistic state until `onSettled` triggers a refetch. AI noted that the `onError` rollback restores the snapshot, but `onSettled` refetch is still needed to confirm the true server state — the rollback is a UI fix, not a truth fix.

## What I changed after reviewing

I added the query key factory pattern (`certKeys`) after AI recommended it — centralising all key construction prevents typo-based bugs where a mutation invalidates the wrong key. AI suggested flat string keys initially; I switched to the array-based factory pattern.

I also set `retry` to skip retrying 4xx errors, since a 404 or 422 won't fix itself on retry and would just delay the error message to the user.

## Implementation

### Query key factory

```typescript
export const certKeys = {
  all:     ()                => ['certificates'],
  lists:   ()                => [...certKeys.all(), 'list'],
  list:    (filters)         => [...certKeys.lists(), filters],
  details: ()                => [...certKeys.all(), 'detail'],
  detail:  (id)              => [...certKeys.details(), id],
};
```

All invalidation calls reference these keys — no raw strings anywhere.

### Hooks provided

| Hook | Purpose |
|---|---|
| `useCertificates(filters)` | Paginated, filterable list query |
| `useCertificate(id)` | Single certificate by ID |
| `useCreateCertificate()` | POST — seeds detail cache on success, invalidates all lists |
| `useUpdateCertificate()` | PATCH — optimistic update with rollback (see Task 18) |
| `useTransitionStatus()` | POST to transition endpoint — updates detail + invalidates lists |

### Cache configuration

| Setting | Value | Reason |
|---|---|---|
| `staleTime` | 30 seconds | Short enough to catch sync updates, long enough to avoid hammering the API |
| `gcTime` | 5 minutes | Keep data in cache after component unmounts so navigating back feels instant |
| `refetchOnWindowFocus` | true | Catches updates made on other devices while the app was backgrounded |
| `retry` | Skip 4xx | Client errors won't self-resolve — fail fast and show the error |

### stale-data risks documented

1. **List goes stale after mutation** → solved by invalidating `certKeys.lists()` in every mutation's `onSuccess`
2. **Detail goes stale after list navigation** → solved by seeding the detail cache from the list response in `useCreateCertificate`'s `onSuccess`
3. **Optimistic state left behind on error** → solved by `onError` rollback + `onSettled` refetch in `useUpdateCertificate`
4. **Concurrent offline edits** → `onSettled` refetch always pulls server truth after any mutation settles

---

## AI usage reflection

AI's explanation of the cache invalidation lifecycle was the most valuable part — specifically the difference between `onError` (restores optimistic snapshot) and `onSettled` (fetches server truth). Without understanding that distinction, the optimistic update pattern in Task 18 would have been incomplete. I designed the key factory and the specific stale/gc time values myself based on the app's requirements.
