/**
 * HauliersScreen.tsx
 *
 * A working list screen that pulls real haulier data from the Laravel backend.
 * Demonstrates the full data flow: API → TanStack Query → FlatList with states.
 *
 * Uses the existing /api/haulier endpoint since the certificate endpoint
 * doesn't exist in the backend yet.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from './apiClient';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Haulier {
  id: number;
  code: string;
  name: string;
  company_id: number;
  site_id: number;
  company?: string;
  displayName?: string;
}

// ─── Data hook ────────────────────────────────────────────────────────────────

function useHauliers(companyId: number | null) {
  return useQuery({
    queryKey: ['hauliers', companyId],
    queryFn: () => {
      const params = companyId ? `?company_id=${companyId}` : '';
      return api.get<Haulier[]>(`/haulier${params}`);
    },
    staleTime: 30_000,
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function HauliersScreen() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useHauliers(
    user?.company_id ?? null,
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#1F3864" />
        <Text style={styles.loadingText}>Loading hauliers…</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centred}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Could not load hauliers</Text>
        <Text style={styles.errorMessage}>
          {(error as any)?.message ?? 'Unknown error'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hauliers = data ?? [];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hauliers</Text>
          <Text style={styles.headerSub}>
            {user?.firstname} {user?.lastname}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={hauliers}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1F3864" />
        }
        ListEmptyComponent={
          <View style={styles.centred}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No hauliers found</Text>
            <Text style={styles.emptyMessage}>
              There are no hauliers for your company yet.
            </Text>
          </View>
        }
        contentContainerStyle={hauliers.length === 0 ? styles.emptyContent : undefined}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>{item.code?.charAt(0) ?? 'H'}</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowCode}>{item.code}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const BLUE = '#1F3864';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#AABFDE', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#AABFDE',
    borderRadius: 6,
  },
  logoutText: { fontSize: 13, color: '#FFFFFF' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowIconText: { fontSize: 16, fontWeight: '700', color: BLUE },
  rowContent: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowCode: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F0F0F0' },

  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 6 },
  errorMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: BLUE },

  emptyContent: { flexGrow: 1 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 6 },
  emptyMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
