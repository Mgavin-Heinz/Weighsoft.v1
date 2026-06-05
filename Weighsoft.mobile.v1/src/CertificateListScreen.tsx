/**
 * Task 16 — List screen with FlatList and loading/error/empty states
 *
 * Screen: CertificateListScreen
 * Shows all certificates for the current user's company with:
 *  - Loading skeleton while fetching
 *  - Error state with retry button
 *  - Empty state with call-to-action
 *  - Populated list with status badges
 *  - Pull-to-refresh
 *  - Search/filter bar
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { CertificateEntity } from './CertificateSchema';

// ─── Types ────────────────────────────────────────────────────────────────────

type CertificateStatus = CertificateEntity['status'];

interface ListItem {
  _id: string;
  certificateNo: string | null;
  status: CertificateStatus;
  effectiveDate: string;
  productName: string;
  haulierName: string;
  sync: { dirty: boolean };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Task 16: Loading state — skeleton rows while data is fetching
 */
function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonLeft}>
            <View style={[styles.skeletonBlock, { width: 120, height: 14, marginBottom: 8 }]} />
            <View style={[styles.skeletonBlock, { width: 180, height: 12 }]} />
          </View>
          <View style={[styles.skeletonBlock, { width: 72, height: 26, borderRadius: 13 }]} />
        </View>
      ))}
    </View>
  );
}

/**
 * Task 16: Error state — shown when the fetch fails
 */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.centredState}>
      <Text style={styles.stateIcon}>⚠️</Text>
      <Text style={styles.stateTitle}>Could not load certificates</Text>
      <Text style={styles.stateSubtitle}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Task 16: Empty state — no certificates exist yet
 */
interface EmptyStateProps {
  isFiltered: boolean;
  onClear: () => void;
  onNew: () => void;
}

function EmptyState({ isFiltered, onClear, onNew }: EmptyStateProps) {
  return (
    <View style={styles.centredState}>
      <Text style={styles.stateIcon}>📋</Text>
      <Text style={styles.stateTitle}>
        {isFiltered ? 'No results found' : 'No certificates yet'}
      </Text>
      <Text style={styles.stateSubtitle}>
        {isFiltered
          ? 'Try adjusting your search or filters'
          : 'Create your first weighing certificate to get started'}
      </Text>
      {isFiltered ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onClear}>
          <Text style={styles.retryBtnText}>Clear Filters</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={onNew}>
          <Text style={styles.primaryBtnText}>+ New Certificate</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * StatusBadge — also used in Task 21 as a reusable component
 */
interface StatusBadgeProps {
  status: CertificateStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<CertificateStatus, { label: string; bg: string; text: string }> = {
    DRAFT:        { label: 'Draft',       bg: '#F3F4F6', text: '#374151' },
    UNDER_REVIEW: { label: 'In Review',   bg: '#FEF3C7', text: '#92400E' },
    FINALIZED:    { label: 'Finalised',   bg: '#D1FAE5', text: '#065F46' },
    CANCELLED:    { label: 'Cancelled',   bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

/**
 * Single certificate row
 */
interface CertRowProps {
  item: ListItem;
  onPress: (id: string) => void;
}

function CertRow({ item, onPress }: CertRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(item._id)}>
      <View style={styles.rowLeft}>
        <View style={styles.rowTitleRow}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.certificateNo ?? 'Draft — No Number'}
          </Text>
          {item.sync.dirty && <View style={styles.dirtyDot} />}
        </View>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.productName}  ·  {item.haulierName}
        </Text>
        <Text style={styles.rowDate}>{item.effectiveDate}</Text>
      </View>
      <StatusBadge status={item.status} />
    </TouchableOpacity>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: CertificateStatus | 'ALL' }[] = [
  { label: 'All',      value: 'ALL' },
  { label: 'Draft',    value: 'DRAFT' },
  { label: 'Review',   value: 'UNDER_REVIEW' },
  { label: 'Final',    value: 'FINALIZED' },
  { label: 'Cancelled',value: 'CANCELLED' },
];

interface FilterBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  activeFilter: CertificateStatus | 'ALL';
  onFilterChange: (f: CertificateStatus | 'ALL') => void;
}

function FilterBar({ search, onSearchChange, activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <View style={styles.filterContainer}>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search by ticket, product, haulier…"
        placeholderTextColor="#999"
        clearButtonMode="while-editing"
        accessibilityLabel="Search certificates"
      />
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(f) => f.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.chip, activeFilter === f.value && styles.chipActive]}
            onPress={() => onFilterChange(f.value)}
          >
            <Text style={[styles.chipText, activeFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface CertificateListScreenProps {
  /** In production this comes from TanStack Query (Task 17) */
  data: ListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRefresh: () => Promise<void>;
  onRetry: () => void;
  onPressItem: (id: string) => void;
  onNewCertificate: () => void;
}

export function CertificateListScreen({
  data,
  isLoading,
  isError,
  errorMessage,
  onRefresh,
  onRetry,
  onPressItem,
  onNewCertificate,
}: CertificateListScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<CertificateStatus | 'ALL'>('ALL');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // Client-side filtering — server filtering added in Task 17
  const filtered = data.filter((item) => {
    const matchesStatus = activeFilter === 'ALL' || item.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.certificateNo?.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.haulierName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const isFiltered = search.length > 0 || activeFilter !== 'ALL';

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading && data.length === 0) return <LoadingSkeleton />;

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError && data.length === 0) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  return (
    <View style={styles.screen}>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CertRow item={item} onPress={onPressItem} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1F3864"
          />
        }
        // Task 16: empty state
        ListEmptyComponent={
          <EmptyState
            isFiltered={isFiltered}
            onClear={() => { setSearch(''); setActiveFilter('ALL'); }}
            onNew={onNewCertificate}
          />
        }
        // Task 16: loading indicator at bottom when refreshing with existing data
        ListFooterComponent={
          isLoading && data.length > 0 ? (
            <ActivityIndicator size="small" color="#1F3864" style={styles.footerSpinner} />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContent : undefined}
      />

      {/* FAB — new certificate */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onNewCertificate}
        accessibilityRole="button"
        accessibilityLabel="Create new certificate"
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },

  // Skeleton
  skeletonRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 8,
  },
  skeletonLeft: { flex: 1, marginRight: 12 },
  skeletonBlock: { backgroundColor: '#E5E7EB', borderRadius: 4 },

  // States
  centredState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingTop: 80,
  },
  stateIcon: { fontSize: 48, marginBottom: 16 },
  stateTitle: { fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 8 },
  stateSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.5, borderColor: BLUE,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: BLUE },
  primaryBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, backgroundColor: BLUE,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  emptyContent: { flexGrow: 1 },

  // Filter bar
  filterContainer: { backgroundColor: '#FFFFFF', paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    marginHorizontal: 16, marginBottom: 8, height: 38,
    backgroundColor: '#F3F4F6', borderRadius: 8,
    paddingHorizontal: 12, fontSize: 14, color: '#111827',
  },
  filterChips: { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 16, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  rowSub: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  rowDate: { fontSize: 12, color: '#9CA3AF' },
  dirtyDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#F59E0B', marginLeft: 6,
  },
  separator: { height: 1, backgroundColor: '#F3F4F6' },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  // Footer
  footerSpinner: { paddingVertical: 16 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});
