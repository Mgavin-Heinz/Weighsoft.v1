/**
 * Task 21 — Reusable UI components
 *
 * Components:
 *  - <FormSection>   groups form fields under a labelled header
 *  - <StatusBadge>   coloured pill showing certificate status
 *  - <InfoRow>       label + value display row for detail screens
 *  - <EmptyCard>     standardised empty/placeholder card
 *
 * AI usage: AI suggested props and usage examples; final API designed manually.
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// ─── FormSection ─────────────────────────────────────────────────────────────

interface FormSectionProps {
  /** Section heading shown in a coloured bar */
  title: string;
  /** Optional helper text shown below the heading */
  hint?: string;
  /** Whether to show a required indicator (*) next to the title */
  required?: boolean;
  children: ReactNode;
  /** Extra top margin — use when stacking multiple sections */
  spaceAbove?: boolean;
}

/**
 * FormSection
 *
 * Usage:
 *   <FormSection title="Weighing Information" required>
 *     <Controller name="productId" ... />
 *   </FormSection>
 */
export function FormSection({
  title,
  hint,
  required,
  children,
  spaceAbove = true,
}: FormSectionProps) {
  return (
    <View style={[styles.section, spaceAbove && styles.sectionSpaceAbove]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title.toUpperCase()}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

type CertStatus = 'DRAFT' | 'UNDER_REVIEW' | 'FINALIZED' | 'CANCELLED';

interface StatusBadgeProps {
  status: CertStatus;
  /** 'sm' = compact pill (for list rows), 'md' = default, 'lg' = detail screen */
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<CertStatus, { label: string; bg: string; text: string; dot: string }> = {
  DRAFT:        { label: 'Draft',      bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  UNDER_REVIEW: { label: 'In Review',  bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  FINALIZED:    { label: 'Finalised',  bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  CANCELLED:    { label: 'Cancelled',  bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

/**
 * StatusBadge
 *
 * Usage:
 *   <StatusBadge status="DRAFT" />
 *   <StatusBadge status="FINALIZED" size="lg" />
 */
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const sizeStyle = {
    sm: { px: 8,  py: 3,  r: 10, fs: 11, dotSize: 6  },
    md: { px: 10, py: 4,  r: 12, fs: 12, dotSize: 7  },
    lg: { px: 14, py: 6,  r: 14, fs: 14, dotSize: 8  },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          paddingHorizontal: sizeStyle.px,
          paddingVertical: sizeStyle.py,
          borderRadius: sizeStyle.r,
        },
      ]}
    >
      <View
        style={[
          styles.badgeDot,
          { backgroundColor: cfg.dot, width: sizeStyle.dotSize, height: sizeStyle.dotSize, borderRadius: sizeStyle.dotSize / 2 },
        ]}
      />
      <Text style={[styles.badgeText, { color: cfg.text, fontSize: sizeStyle.fs }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  /** Shows a placeholder when value is empty */
  emptyText?: string;
  /** Optional action button on the right */
  action?: { label: string; onPress: () => void };
}

/**
 * InfoRow — label + value display, used on detail screens.
 *
 * Usage:
 *   <InfoRow label="Product" value="Iron Ore" />
 *   <InfoRow label="Contract" value={null} emptyText="No contract linked" />
 */
export function InfoRow({ label, value, emptyText = '—', action }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoRight}>
        <Text style={[styles.infoValue, !value && styles.infoValueEmpty]}>
          {value ?? emptyText}
        </Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.infoAction}>
            <Text style={styles.infoActionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── EmptyCard ────────────────────────────────────────────────────────────────

interface EmptyCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

/**
 * EmptyCard — standardised empty state card.
 *
 * Usage:
 *   <EmptyCard
 *     icon="📋"
 *     title="No readings yet"
 *     subtitle="Capture the gross weight to get started"
 *     action={{ label: 'Capture Reading', onPress: () => {} }}
 *   />
 */
export function EmptyCard({ icon, title, subtitle, action }: EmptyCardProps) {
  return (
    <View style={styles.emptyCard}>
      {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {action ? (
        <TouchableOpacity style={styles.emptyAction} onPress={action.onPress}>
          <Text style={styles.emptyActionText}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';

const styles = StyleSheet.create({
  // FormSection
  section: { },
  sectionSpaceAbove: { marginTop: 16 },
  sectionHeader: {
    backgroundColor: '#E8EDF5',
    paddingHorizontal: 16, paddingVertical: 7,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: BLUE, letterSpacing: 0.5,
  },
  requiredStar: { color: '#CC0000' },
  sectionHint: {
    fontSize: 12, color: '#6B7280',
    paddingHorizontal: 16, paddingTop: 6,
  },
  sectionBody: { paddingHorizontal: 16, paddingTop: 8 },

  // StatusBadge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  badgeDot: { },
  badgeText: { fontWeight: '600' },

  // InfoRow
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6',
  },
  infoLabel: { fontSize: 13, color: '#6B7280', flex: 1 },
  infoRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2, justifyContent: 'flex-end' },
  infoValue: { fontSize: 14, color: '#111827', textAlign: 'right', flexShrink: 1 },
  infoValueEmpty: { color: '#9CA3AF', fontStyle: 'italic' },
  infoAction: { },
  infoActionText: { fontSize: 13, color: BLUE, fontWeight: '600' },

  // EmptyCard
  emptyCard: {
    backgroundColor: '#FAFAFA', borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E7EB', padding: 24, alignItems: 'center', marginVertical: 8,
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  emptyAction: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: BLUE,
  },
  emptyActionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
