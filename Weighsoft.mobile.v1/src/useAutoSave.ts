/**
 * Task 29 — Auto-save for a draft form
 *
 * Provides:
 *  - useAutoSave()  hook — debounced save to AsyncStorage with status indicator
 *  - useDraftRestore() hook — restores a saved draft on form mount
 *
 * AI usage: AI used to reason about debounce timing and data-loss scenarios.
 * See Task29_AutoSave.md for the full reasoning log.
 *
 * Data-loss scenarios identified and handled:
 *  1. User types quickly      → debounce prevents saving on every keystroke
 *  2. App crashes mid-save    → AsyncStorage write is atomic; partial writes don't corrupt
 *  3. User force-closes app   → debounce flushes immediately on app background (AppState)
 *  4. User navigates away     → useEffect cleanup flushes pending debounce
 *  5. Save fails (storage full) → error state shown, user warned
 *  6. Stale draft restored    → draft timestamp shown so user can decide to discard
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import type { NewCertificateStep1Values } from './NewCertificateSchema';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveOptions {
  /** Milliseconds to wait after the last change before saving. Default: 1500 */
  debounceMs?: number;
  /** Storage key prefix. Default: 'draft:new_certificate' */
  storageKey?: string;
}

export interface DraftData {
  values: Partial<NewCertificateStep1Values>;
  savedAt: string;
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const DEFAULT_KEY = 'draft:new_certificate:step1';

// ─── useAutoSave ─────────────────────────────────────────────────────────────

/**
 * useAutoSave
 *
 * Watches form values and saves them to AsyncStorage after a debounce period.
 * Also flushes immediately when the app goes to the background.
 *
 * Usage:
 *   const { status, lastSavedAt, clearDraft } = useAutoSave(watchedValues);
 */
export function useAutoSave(
  values: Partial<NewCertificateStep1Values>,
  options: AutoSaveOptions = {},
) {
  const debounceMs = options.debounceMs ?? 1500;
  const storageKey = options.storageKey ?? DEFAULT_KEY;

  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Keep a ref to the latest values so the AppState handler can flush them
  // without needing values in its dependency array
  const latestValuesRef = useRef<Partial<NewCertificateStep1Values>>(values);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingRef = useRef(false);

  // Update the ref whenever values change
  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  // ── Core save function ──────────────────────────────────────────────────────

  const saveNow = useCallback(async (valuesToSave: Partial<NewCertificateStep1Values>) => {
    // Don't save if there are no meaningful values yet
    const hasContent = Object.values(valuesToSave).some(
      (v) => v !== null && v !== undefined && v !== '',
    );
    if (!hasContent) return;

    setStatus('saving');
    try {
      const draft: DraftData = {
        values: valuesToSave,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(draft));
      setStatus('saved');
      setLastSavedAt(new Date());
      hasPendingRef.current = false;
    } catch (err) {
      // Scenario 5: storage full or unavailable
      setStatus('error');
      console.warn('[useAutoSave] Failed to save draft:', err);
    }
  }, [storageKey]);

  // ── Debounced save triggered by value changes ───────────────────────────────

  useEffect(() => {
    // Mark that we have a pending save
    hasPendingRef.current = true;
    setStatus('idle');

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    // Scenario 1: user typing quickly — only saves after they pause for debounceMs
    debounceTimerRef.current = setTimeout(() => {
      saveNow(latestValuesRef.current);
    }, debounceMs);

    // Scenario 4: component unmounts (user navigates away) — flush immediately
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (hasPendingRef.current) {
        saveNow(latestValuesRef.current);
      }
    };
  }, [values, debounceMs, saveNow]);

  // ── AppState handler — flush when app goes to background ───────────────────

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      // Scenario 3: user presses home or switches apps — flush immediately
      if (nextState === 'background' || nextState === 'inactive') {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        if (hasPendingRef.current) {
          saveNow(latestValuesRef.current);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [saveNow]);

  // ── Clear draft ─────────────────────────────────────────────────────────────

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      setStatus('idle');
      setLastSavedAt(null);
    } catch (err) {
      console.warn('[useAutoSave] Failed to clear draft:', err);
    }
  }, [storageKey]);

  return { status, lastSavedAt, clearDraft };
}

// ─── useDraftRestore ──────────────────────────────────────────────────────────

/**
 * useDraftRestore
 *
 * Checks AsyncStorage for a saved draft when the form mounts.
 * Returns the draft data and a function to discard it.
 *
 * Usage:
 *   const { draft, discardDraft, isChecking } = useDraftRestore();
 *   if (draft) {
 *     // Show "Restore draft from 3 mins ago?" prompt
 *   }
 */
export function useDraftRestore(storageKey: string = DEFAULT_KEY) {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkForDraft() {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!cancelled && raw) {
          const parsed: DraftData = JSON.parse(raw);

          // Scenario 6: only restore drafts from the last 24 hours
          // A week-old draft is more confusing than helpful
          const savedAt = new Date(parsed.savedAt);
          const ageMs = Date.now() - savedAt.getTime();
          const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

          if (ageMs < maxAgeMs) {
            setDraft(parsed);
          } else {
            // Silently discard stale drafts
            await AsyncStorage.removeItem(storageKey);
          }
        }
      } catch (err) {
        console.warn('[useDraftRestore] Failed to read draft:', err);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    checkForDraft();
    return () => { cancelled = true; };
  }, [storageKey]);

  const discardDraft = useCallback(async () => {
    setDraft(null);
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('[useDraftRestore] Failed to discard draft:', err);
    }
  }, [storageKey]);

  return { draft, discardDraft, isChecking };
}

// ─── AutoSaveIndicator ────────────────────────────────────────────────────────

import { View, Text, StyleSheet } from 'react-native';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
}

/**
 * AutoSaveIndicator
 *
 * Small status bar shown at the top of the form.
 * Shows "Saving…", "Saved just now", "Saved 2 mins ago", or an error message.
 *
 * Usage:
 *   <AutoSaveIndicator status={status} lastSavedAt={lastSavedAt} />
 */
export function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  function getLabel() {
    if (status === 'saving') return '💾  Saving draft…';
    if (status === 'error') return '⚠️  Draft could not be saved';
    if (status === 'saved' && lastSavedAt) {
      const secondsAgo = Math.round((Date.now() - lastSavedAt.getTime()) / 1000);
      if (secondsAgo < 10) return '✓  Draft saved';
      if (secondsAgo < 60) return `✓  Saved ${secondsAgo}s ago`;
      const minsAgo = Math.round(secondsAgo / 60);
      return `✓  Saved ${minsAgo} min${minsAgo === 1 ? '' : 's'} ago`;
    }
    return '✓  Draft saved';
  }

  const isError = status === 'error';

  return (
    <View style={[styles.indicator, isError && styles.indicatorError]}>
      <Text style={[styles.indicatorText, isError && styles.indicatorTextError]}>
        {getLabel()}
      </Text>
    </View>
  );
}

// ─── DraftRestorePrompt ───────────────────────────────────────────────────────

import { TouchableOpacity } from 'react-native';

interface DraftRestorePromptProps {
  draft: DraftData;
  onRestore: () => void;
  onDiscard: () => void;
}

/**
 * DraftRestorePrompt
 *
 * Banner shown when a saved draft is found.
 * Lets the user restore or discard it.
 *
 * Usage:
 *   {draft && (
 *     <DraftRestorePrompt
 *       draft={draft}
 *       onRestore={() => reset(draft.values)}
 *       onDiscard={discardDraft}
 *     />
 *   )}
 */
export function DraftRestorePrompt({ draft, onRestore, onDiscard }: DraftRestorePromptProps) {
  const savedAt = new Date(draft.savedAt);
  const minsAgo = Math.round((Date.now() - savedAt.getTime()) / 1000 / 60);
  const timeLabel = minsAgo < 1 ? 'just now' : `${minsAgo} minute${minsAgo === 1 ? '' : 's'} ago`;

  return (
    <View style={styles.restorePrompt}>
      <Text style={styles.restoreText}>
        You have an unsaved draft from {timeLabel}. Restore it?
      </Text>
      <View style={styles.restoreActions}>
        <TouchableOpacity style={styles.discardBtn} onPress={onDiscard}>
          <Text style={styles.discardBtnText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.restoreBtn} onPress={onRestore}>
          <Text style={styles.restoreBtnText}>Restore Draft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  indicatorError: {
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#FCA5A5',
  },
  indicatorText: {
    fontSize: 12,
    color: '#15803D',
  },
  indicatorTextError: {
    color: '#B91C1C',
  },
  restorePrompt: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    margin: 16,
    padding: 14,
  },
  restoreText: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 12,
  },
  restoreActions: {
    flexDirection: 'row',
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardBtnText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  restoreBtn: {
    flex: 2,
    height: 36,
    borderRadius: 6,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
