# Task 16: Implement a List Screen with FlatList and Loading/Error/Empty States

**File:** `Weighsoft.mobile.v1/src/CertificateListScreen.tsx`  
**AI usage:** AI used to generate state-handling patterns.

---

## What I asked AI to help with

I asked AI to generate the state-handling patterns for a FlatList screen, specifically how to structure the three distinct states a data-driven list can be in — loading, error, and empty — alongside the happy-path populated list.

## What AI suggested

AI suggested separating each state into its own dedicated sub-component rather than using inline conditionals scattered through the main render. The patterns it proposed:

- A **skeleton loader** using placeholder rows with grey blocks, shown while data is fetching for the first time (not during pull-to-refresh, which has its own spinner)
- An **error state** with a message and retry button, only shown when there is no cached data to fall back on
- Two **empty states** — one for a genuinely empty list, one for a filtered list that returned no results — since these require different calls to action
- A **footer spinner** using `ListFooterComponent` for background refetches when stale data is already visible

AI also noted that `isLoading && data.length === 0` is the correct guard for showing the skeleton — not just `isLoading` — because a refetch while old data is displayed should not blank the screen.

## What I changed after reviewing

I kept the skeleton and error/empty structure as suggested. I added the search bar and status filter chip row on top, which AI did not include. I also changed the empty state to split into `isFiltered` and non-filtered variants, since AI's version only had one empty message.

## Implementation

### States handled

| State | When shown | Component |
|---|---|---|
| Loading (first fetch) | `isLoading && data.length === 0` | `LoadingSkeleton` — placeholder rows |
| Error (no data) | `isError && data.length === 0` | `ErrorState` — message + retry button |
| Empty (no certs) | Fetch succeeded, 0 results, no filter | `EmptyState` — CTA to create first cert |
| Empty (filtered) | Fetch succeeded, 0 results, filter active | `EmptyState` — CTA to clear filters |
| Populated | Data available | `FlatList` with `CertRow` items |
| Background refresh | `isLoading && data.length > 0` | `ListFooterComponent` spinner |

### Key components

**`LoadingSkeleton`** — renders 5 placeholder rows using grey blocks. Shown on first load only, not during pull-to-refresh.

**`ErrorState`** — shows the error message and a "Try Again" button that calls `onRetry`. Only rendered when there is genuinely no data to show (not on background refetch failures).

**`EmptyState`** — adapts its title, subtitle and action button based on whether the empty result is caused by an active filter or a genuinely empty dataset.

**`CertRow`** — single list item showing certificate number, product, haulier, date, status badge, and a dirty dot indicator when the cert has unsynced local changes.

**`FilterBar`** — search text input plus horizontal chip row for status filtering. Both filters applied client-side; server-side filtering is connected in Task 17.

**`StatusBadge`** — colour-coded pill for DRAFT / UNDER_REVIEW / FINALIZED / CANCELLED. Reused in Task 21.

### Pull-to-refresh

Uses `RefreshControl` on the `FlatList`. The `handleRefresh` callback sets a local `refreshing` state, calls `onRefresh` (which triggers a TanStack Query refetch in Task 17), then clears the state.

### FAB

A floating action button positioned absolutely at bottom-right triggers `onNewCertificate`. Accessible via `accessibilityRole="button"` and `accessibilityLabel`.

---

## AI usage reflection

The state-handling pattern AI suggested was solid and saved significant time designing the component tree. The main value was understanding that skeleton/error/empty are three genuinely separate states that need their own components — not just conditional text inside the list. I manually added the filter bar, dirty dot indicator, and split empty state behaviour.
