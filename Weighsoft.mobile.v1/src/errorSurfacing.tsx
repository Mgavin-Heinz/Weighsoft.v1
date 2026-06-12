/**
 * Task 34 — Error surfacing for failed database operations
 *
 * Provides a consistent way to catch, classify, and display
 * database errors to the user across the mobile app.
 *
 * AI usage: AI listed likely failure modes for PouchDB operations.
 * All error types verified against PouchDB documentation.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  CertificateNotFoundError,
  CertificateConflictError,
  CertificateValidationError,
  InvalidStatusTransitionError,
} from './CertificateRepository';

// ─── Error classification ─────────────────────────────────────────────────────

export type DbErrorType =
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'status_transition'
  | 'storage_full'
  | 'network'
  | 'unknown';

export interface ClassifiedError {
  type: DbErrorType;
  title: string;
  message: string;
  /** Whether the user can retry this action */
  retryable: boolean;
  /** Whether the error should block the user from continuing */
  blocking: boolean;
}

/**
 * Classifies any error thrown by the repository layer into a
 * user-friendly error object.
 *
 * AI identified failure modes:
 *  1. Document not found (deleted on another device)
 *  2. Write conflict (concurrent offline edit)
 *  3. Validation failure (schema mismatch)
 *  4. Invalid status transition (cert already finalised)
 *  5. Storage quota exceeded (device full)
 *  6. Network error during sync
 */
export function classifyDbError(error: unknown): ClassifiedError {
  if (error instanceof CertificateNotFoundError) {
    return {
      type: 'not_found',
      title: 'Certificate not found',
      message: 'This certificate may have been deleted on another device. Pull down to refresh.',
      retryable: false,
      blocking: true,
    };
  }

  if (error instanceof CertificateConflictError) {
    return {
      type: 'conflict',
      title: 'Update conflict',
      message: 'This certificate was changed on another device while you were editing. Your changes were not saved. Please refresh and try again.',
      retryable: true,
      blocking: false,
    };
  }

  if (error instanceof CertificateValidationError) {
    const fields = error.issues.map((i) => i.path.join('.')).join(', ');
    return {
      type: 'validation',
      title: 'Invalid data',
      message: `Some fields contain invalid data and could not be saved: ${fields}. Please check your entries.`,
      retryable: false,
      blocking: false,
    };
  }

  if (error instanceof InvalidStatusTransitionError) {
    return {
      type: 'status_transition',
      title: 'Cannot change status',
      message: `This certificate cannot be moved from ${error.from} to ${error.to}. It may have already been finalised or cancelled.`,
      retryable: false,
      blocking: false,
    };
  }

  // PouchDB quota exceeded
  if (
    error instanceof Error &&
    (error.message.includes('QuotaExceededError') ||
      error.message.includes('storage') ||
      error.message.includes('quota'))
  ) {
    return {
      type: 'storage_full',
      title: 'Device storage full',
      message: 'Your device does not have enough storage to save this certificate. Please free up some space and try again.',
      retryable: true,
      blocking: true,
    };
  }

  // Network errors during sync
  if (
    error instanceof Error &&
    (error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED'))
  ) {
    return {
      type: 'network',
      title: 'No connection',
      message: 'Could not reach the server. Your changes have been saved locally and will sync when you reconnect.',
      retryable: true,
      blocking: false,
    };
  }

  return {
    type: 'unknown',
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again. If the problem continues, contact your supervisor.',
    retryable: true,
    blocking: false,
  };
}

// ─── DbErrorBanner component ──────────────────────────────────────────────────

interface DbErrorBannerProps {
  error: ClassifiedError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * DbErrorBanner
 *
 * Inline error banner shown when a database operation fails.
 * Shows title, message, and optional retry button.
 *
 * Usage:
 *   const [dbError, setDbError] = useState<ClassifiedError | null>(null);
 *
 *   try {
 *     await repo.update(id, patch);
 *   } catch (err) {
 *     setDbError(classifyDbError(err));
 *   }
 *
 *   return <DbErrorBanner error={dbError} onRetry={handleRetry} onDismiss={() => setDbError(null)} />;
 */
export function DbErrorBanner({ error, onRetry, onDismiss }: DbErrorBannerProps) {
  if (!error) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{error.title}</Text>
        <Text style={styles.bannerMessage}>{error.message}</Text>
      </View>
      <View style={styles.bannerActions}>
        {error.retryable && onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FCA5A5',
    borderRadius: 8, margin: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'flex-start', gap: 12,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  bannerMessage: { fontSize: 13, color: '#7F1D1D', lineHeight: 18 },
  bannerActions: { flexDirection: 'column', gap: 8, alignItems: 'flex-end' },
  retryBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 6, backgroundColor: '#991B1B',
  },
  retryBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  dismissBtn: { padding: 4 },
  dismissBtnText: { fontSize: 16, color: '#9CA3AF' },
});
