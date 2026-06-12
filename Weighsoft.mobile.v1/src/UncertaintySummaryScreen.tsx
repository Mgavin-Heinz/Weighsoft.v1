/**
 * Task 33 — Results summary screen for calculated outputs
 *
 * Shows the uncertainty calculation results from Task 31
 * in a clear, operator-friendly layout.
 *
 * AI usage: AI drafted labels, helper text, and error wording.
 * All copy reviewed and adjusted for the weighbridge operator context.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { UncertaintyResult } from './uncertainty';
import { formatUncertaintyResult } from './uncertainty';

// ─── Result row ───────────────────────────────────────────────────────────────

interface ResultRowProps {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
}

function ResultRow({ label, value, helper, highlight }: ResultRowProps) {
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {helper && <Text style={styles.rowHelper}>{helper}</Text>}
      </View>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Tolerance badge ──────────────────────────────────────────────────────────

function ToleranceBadge({ withinTolerance }: { withinTolerance: boolean }) {
  return (
    <View style={[styles.badge, withinTolerance ? styles.badgePass : styles.badgeFail]}>
      <Text style={[styles.badgeText, withinTolerance ? styles.badgeTextPass : styles.badgeTextFail]}>
        {withinTolerance ? '✓  Within tolerance' : '✗  Exceeds tolerance'}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

interface UncertaintySummaryScreenProps {
  result: UncertaintyResult;
  unit?: string;
  onAccept: () => void;
  onRecalculate: () => void;
}

/**
 * UncertaintySummaryScreen
 *
 * Displays the full uncertainty budget in a readable summary.
 * Used in Step 3 of the New Certificate wizard.
 *
 * AI copy decisions documented:
 *  - "Expanded Uncertainty" labelled as "Measurement Uncertainty (U)" for operators
 *  - Helper text explains k=2 as "95% confidence" not "two sigma"
 *  - Error wording says "exceeds tolerance" not "out of spec" (less alarming)
 */
export function UncertaintySummaryScreen({
  result,
  unit = 'kg',
  onAccept,
  onRecalculate,
}: UncertaintySummaryScreenProps) {
  const formattedResult = formatUncertaintyResult(result, unit);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* Header result */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Mean Weight</Text>
        <Text style={styles.headerValue}>
          {result.mean.toLocaleString('en-ZA')} {unit}
        </Text>
        <Text style={styles.headerSub}>{formattedResult}</Text>
        <ToleranceBadge withinTolerance={result.withinTolerance} />
      </View>

      {/* Tolerance warning */}
      {!result.withinTolerance && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>⚠  Uncertainty exceeds tolerance</Text>
          <Text style={styles.warningBody}>
            The expanded uncertainty ({result.expandedUncertainty} {unit}) is greater than
            the scale division ({result.toleranceLimit} {unit}). Consider taking additional
            readings or checking the scale calibration before finalising this certificate.
          </Text>
        </View>
      )}

      {/* Uncertainty budget breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UNCERTAINTY BUDGET</Text>

        <ResultRow
          label="Number of readings"
          value={String(result.n)}
        />
        <ResultRow
          label="Mean weight"
          value={`${result.mean} ${unit}`}
          highlight
        />
        <ResultRow
          label="Standard deviation"
          value={`${result.standardDeviation} ${unit}`}
          helper="Spread between repeated readings"
        />
        <ResultRow
          label="Repeatability uncertainty"
          value={`${result.standardUncertainty} ${unit}`}
          helper="Standard deviation ÷ √n"
        />
        <ResultRow
          label="Resolution uncertainty"
          value={`${result.resolutionUncertainty} ${unit}`}
          helper="Scale division ÷ (2√3)"
        />
        <ResultRow
          label="Combined uncertainty"
          value={`${result.combinedUncertainty} ${unit}`}
          helper="Root-sum-of-squares of all components"
        />
        <ResultRow
          label="Coverage factor (k)"
          value={String(result.coverageFactor)}
          helper="k=2 gives 95% confidence interval"
        />
        <ResultRow
          label="Measurement uncertainty (U)"
          value={`± ${result.expandedUncertainty} ${unit}`}
          helper={`k × combined uncertainty (95% confidence)`}
          highlight
        />
        <ResultRow
          label="Tolerance limit"
          value={`${result.toleranceLimit} ${unit}`}
          helper="One scale division"
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.recalcBtn}
          onPress={onRecalculate}
          accessibilityRole="button"
          accessibilityLabel="Go back and recalculate"
        >
          <Text style={styles.recalcBtnText}>← Recalculate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, !result.withinTolerance && styles.acceptBtnWarn]}
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel={
            result.withinTolerance
              ? 'Accept result and continue'
              : 'Accept result despite tolerance warning'
          }
        >
          <Text style={styles.acceptBtnText}>
            {result.withinTolerance ? 'Accept →' : 'Accept Anyway →'}
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';
const GREEN = '#065F46';
const RED = '#991B1B';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 32 },

  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerLabel: { fontSize: 13, color: '#6B7280' },
  headerValue: { fontSize: 32, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

  badge: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginTop: 4,
  },
  badgePass: { backgroundColor: '#D1FAE5' },
  badgeFail: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 14, fontWeight: '700' },
  badgeTextPass: { color: GREEN },
  badgeTextFail: { color: RED },

  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1, borderColor: '#FCD34D',
    margin: 16, borderRadius: 8, padding: 14,
  },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  warningBody: { fontSize: 13, color: '#78350F', lineHeight: 19 },

  section: { backgroundColor: '#FFFFFF', marginTop: 12 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: BLUE,
    letterSpacing: 0.5, backgroundColor: '#E8EDF5',
    paddingHorizontal: 16, paddingVertical: 7,
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6',
  },
  rowHighlight: { backgroundColor: '#F0F4FB' },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 14, color: '#374151' },
  rowHelper: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  rowValueHighlight: { color: BLUE, fontWeight: '700' },

  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingVertical: 16, marginTop: 8,
  },
  recalcBtn: {
    flex: 1, height: 44, borderRadius: 8,
    borderWidth: 1.5, borderColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  recalcBtnText: { fontSize: 14, fontWeight: '600', color: BLUE },
  acceptBtn: {
    flex: 2, height: 44, borderRadius: 8,
    backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center',
  },
  acceptBtnWarn: { backgroundColor: '#B45309' },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
