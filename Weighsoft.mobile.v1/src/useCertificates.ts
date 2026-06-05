/**
 * Task 17 — Connect screens to TanStack Query
 *
 * Provides:
 *  - useCertificates()    list with filter support
 *  - useCertificate()     single cert by id
 *  - useCreateCertificate()
 *  - useUpdateCertificate()
 *  - useTransitionStatus()
 *
 * AI usage note: AI explained cache invalidation and stale-data risks.
 * Key decisions documented below.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import type { CertificateEntity } from './CertificateSchema';

// ─── API client (replace with real fetch in production) ───────────────────────

const API_BASE = 'http://127.0.0.1:8000/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Query key factory ────────────────────────────────────────────────────────
// Centralised key factory so invalidation is always consistent.
// AI note: ad-hoc string keys are a common source of stale-data bugs —
// a factory ensures every query that touches 'certificates' gets invalidated.

export const certKeys = {
  all:      ()                                   => ['certificates'] as const,
  lists:    ()                                   => [...certKeys.all(), 'list'] as const,
  list:     (filters: CertListFilters)           => [...certKeys.lists(), filters] as const,
  details:  ()                                   => [...certKeys.all(), 'detail'] as const,
  detail:   (id: string)                         => [...certKeys.details(), id] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CertListFilters {
  companyId?: string;
  siteId?: string;
  status?: CertificateEntity['status'] | 'ALL';
  dirty?: boolean;
  page?: number;
  limit?: number;
}

export interface CertListResponse {
  rows: CertificateEntity[];
  total: number;
}

// ─── Query: list ──────────────────────────────────────────────────────────────

/**
 * useCertificates
 *
 * Stale-data risk (AI note): the list can go stale when:
 *  1. Another device creates/updates a cert (handled by refetchOnWindowFocus)
 *  2. The user creates a cert on this device (handled by cache invalidation in useCreateCertificate)
 *  3. Optimistic updates revert (handled in useUpdateCertificate rollback)
 *
 * staleTime: 30s — short enough to catch sync updates without hammering the API.
 */
export function useCertificates(filters: CertListFilters = {}) {
  return useQuery({
    queryKey: certKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.companyId) params.set('company_id', filters.companyId);
      if (filters.siteId) params.set('site_id', filters.siteId);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (typeof filters.dirty === 'boolean') params.set('dirty', String(filters.dirty));
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      return apiFetch<CertListResponse>(`/certificates?${params.toString()}`);
    },
    staleTime: 30_000,        // 30 seconds
    gcTime: 5 * 60_000,       // keep in cache 5 minutes after unmount
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

// ─── Query: single ────────────────────────────────────────────────────────────

export function useCertificate(id: string | null) {
  return useQuery({
    queryKey: certKeys.detail(id ?? ''),
    queryFn: () => apiFetch<CertificateEntity>(`/certificates/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ─── Mutation: create ─────────────────────────────────────────────────────────

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CertificateEntity, '_rev'>) =>
      apiFetch<CertificateEntity>('/certificates', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (created) => {
      // Seed the detail cache immediately so navigating to the new cert
      // doesn't trigger a redundant network request.
      qc.setQueryData(certKeys.detail(created._id), created);

      // Invalidate all list queries — the new cert must appear in every filter.
      // AI note: invalidating the whole list subtree rather than a specific
      // filter key ensures we don't miss filters that would include this cert.
      qc.invalidateQueries({ queryKey: certKeys.lists() });
    },
  });
}

// ─── Mutation: update ─────────────────────────────────────────────────────────

/**
 * useUpdateCertificate — includes optimistic update (see Task 18 for full detail)
 *
 * Rollback scenarios (AI note):
 *  1. Network failure     → onError restores previous cache value
 *  2. Server validation   → onError restores + shows error to user
 *  3. Concurrent edit     → onSettled refetches to get server truth
 */
export function useUpdateCertificate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CertificateEntity> }) =>
      apiFetch<CertificateEntity>(`/certificates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),

    onMutate: async ({ id, patch }) => {
      // Cancel any in-flight refetches so they don't clobber our optimistic update
      await qc.cancelQueries({ queryKey: certKeys.detail(id) });

      // Snapshot current value for rollback
      const previous = qc.getQueryData<CertificateEntity>(certKeys.detail(id));

      // Apply optimistic update immediately
      if (previous) {
        qc.setQueryData(certKeys.detail(id), { ...previous, ...patch });
      }

      return { previous, id };
    },

    onError: (_err, _vars, context) => {
      // Rollback on any error
      if (context?.previous) {
        qc.setQueryData(certKeys.detail(context.id), context.previous);
      }
    },

    onSettled: (_data, _err, { id }) => {
      // Always refetch after mutation to ensure server truth
      qc.invalidateQueries({ queryKey: certKeys.detail(id) });
      qc.invalidateQueries({ queryKey: certKeys.lists() });
    },
  });
}

// ─── Mutation: status transition ──────────────────────────────────────────────

export function useTransitionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      nextStatus,
      actorUserId,
      reason,
    }: {
      id: string;
      nextStatus: CertificateEntity['status'];
      actorUserId: string;
      reason?: string;
    }) =>
      apiFetch<CertificateEntity>(`/certificates/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus, actorUserId, reason }),
      }),

    onSuccess: (updated) => {
      qc.setQueryData(certKeys.detail(updated._id), updated);
      qc.invalidateQueries({ queryKey: certKeys.lists() });
    },
  });
}

// ─── QueryClient configuration ────────────────────────────────────────────────
// Export a pre-configured client to use in your app root.

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error: any) => {
          // Don't retry 4xx errors — they won't fix themselves
          if (error?.message?.startsWith('API 4')) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
