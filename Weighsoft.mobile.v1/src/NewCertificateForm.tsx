/**
 * Task 14 — React Native form using React Hook Form + Zod
 * Task 15 — Validation messages for required fields and invalid ranges
 *
 * Screen: NewCertificateForm (Step 1 — Details)
 * Matches the wireframe from Task 13.
 *
*/

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { NewCertificateStep1Schema, type NewCertificateStep1Values } from './NewCertificateSchema';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

/** Wraps a label, input, and error message together */
function FormField({ label, required, error, children }: FieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {/* Task 15: inline error message beneath each field */}
      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Section header — visually groups related fields */
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title.toUpperCase()}</Text>
    </View>
  );
}

/** Simulated dropdown — in production replace with a BottomSheet picker */
interface SelectFieldProps {
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  hasError?: boolean;
}

function SelectField({ value, placeholder, options, onChange, hasError }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[styles.input, hasError && styles.inputError, styles.selectTrigger]}
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={selected?.label ?? placeholder}
      >
        <Text style={selected ? styles.inputText : styles.placeholderText}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dropdownItem, opt.value === value && styles.dropdownItemSelected]}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  opt.value === value && styles.dropdownItemTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Demo option lists (replace with real API data via TanStack Query in Task 17) ─

const PRODUCT_OPTIONS = [
  { label: 'Iron Ore', value: 'prod-ivm-ore' },
  { label: 'Slag', value: 'prod-ivm-slg' },
  { label: '19mm Crusher Stone', value: 'prod-cag-g19' },
  { label: 'Maize (White)', value: 'prod-hgc-maz' },
];

const HAULIER_OPTIONS = [
  { label: 'Limpopo Heavy Haulage', value: 'haul-ivm-01' },
  { label: 'Joburg Freight Solutions', value: 'haul-ivm-02' },
  { label: 'Durban Bulk Transport', value: 'haul-cag-01' },
];

const TEMPLATE_OPTIONS = [
  { label: 'Standard', value: 'tpl-standard' },
  { label: 'Custom Header', value: 'tpl-custom' },
];

// ─── Main Form Screen ─────────────────────────────────────────────────────────

interface NewCertificateFormProps {
  /** Called when the user taps "Next: Readings →" with valid data */
  onNext: (values: NewCertificateStep1Values) => void;
  /** Called when the user taps "Save Draft" */
  onSaveDraft: (values: Partial<NewCertificateStep1Values>) => void;
}

export function NewCertificateForm({ onNext, onSaveDraft }: NewCertificateFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NewCertificateStep1Values>({
    resolver: zodResolver(NewCertificateStep1Schema),
    defaultValues: {
      ticketNo: null,
      effectiveDate: today,
      productId: '',
      haulierId: '',
      vehicleReg: '',
      contractId: null,
      templateId: '',
      certificateTitle: 'Weighing Certificate',
      notes: '',
    },
    // Task 15: show errors as soon as the field is touched, not just on submit
    mode: 'onTouched',
  });

  // Task 15: count total errors to show a summary banner
  const errorCount = Object.keys(errors).length;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* Task 15: top-level error summary — appears on failed submit attempt */}
        {errorCount > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {errorCount === 1
                ? '1 field needs attention before you can continue.'
                : `${errorCount} fields need attention before you can continue.`}
            </Text>
          </View>
        )}

        {/* ── Section 1: Weighing Information ── */}
        <SectionHeader title="Weighing Information" />

        <View style={styles.row}>
          {/* Ticket No — read-only */}
          <View style={styles.halfField}>
            <FormField label="Ticket No.">
              <View style={[styles.input, styles.inputReadOnly]}>
                <Text style={styles.placeholderText}>Auto-generated</Text>
              </View>
            </FormField>
          </View>

          {/* Effective Date */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="effectiveDate"
              render={({ field }) => (
                <FormField label="Effective Date" required error={errors.effectiveDate?.message}>
                  <TextInput
                    style={[styles.input, errors.effectiveDate && styles.inputError]}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999999"
                    keyboardType="numbers-and-punctuation"
                    accessibilityLabel="Effective date"
                    accessibilityHint="Enter date in YYYY-MM-DD format"
                  />
                </FormField>
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          {/* Product */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <FormField label="Product" required error={errors.productId?.message}>
                  <SelectField
                    value={field.value}
                    placeholder="Select product…"
                    options={PRODUCT_OPTIONS}
                    onChange={field.onChange}
                    hasError={!!errors.productId}
                  />
                </FormField>
              )}
            />
          </View>

          {/* Haulier */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="haulierId"
              render={({ field }) => (
                <FormField label="Haulier" required error={errors.haulierId?.message}>
                  <SelectField
                    value={field.value}
                    placeholder="Select haulier…"
                    options={HAULIER_OPTIONS}
                    onChange={field.onChange}
                    hasError={!!errors.haulierId}
                  />
                </FormField>
              )}
            />
          </View>
        </View>

        <View style={styles.row}>
          {/* Vehicle Reg */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="vehicleReg"
              render={({ field }) => (
                <FormField label="Vehicle Reg." error={errors.vehicleReg?.message}>
                  <TextInput
                    style={[styles.input, errors.vehicleReg && styles.inputError]}
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. GP 123-456"
                    placeholderTextColor="#999999"
                    autoCapitalize="characters"
                    accessibilityLabel="Vehicle registration number"
                  />
                </FormField>
              )}
            />
          </View>

          {/* Contract (optional) */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="contractId"
              render={({ field }) => (
                <FormField label="Contract (optional)">
                  <SelectField
                    value={field.value ?? ''}
                    placeholder="Select contract…"
                    options={[]}
                    onChange={(val) => field.onChange(val || null)}
                  />
                </FormField>
              )}
            />
          </View>
        </View>

        {/* ── Section 2: Certificate Details ── */}
        <SectionHeader title="Certificate Details" />

        <View style={styles.row}>
          {/* Template */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <FormField label="Template" required error={errors.templateId?.message}>
                  <SelectField
                    value={field.value}
                    placeholder="Select template…"
                    options={TEMPLATE_OPTIONS}
                    onChange={field.onChange}
                    hasError={!!errors.templateId}
                  />
                </FormField>
              )}
            />
          </View>

          {/* Certificate Title */}
          <View style={styles.halfField}>
            <Controller
              control={control}
              name="certificateTitle"
              render={({ field }) => (
                <FormField label="Certificate Title" error={errors.certificateTitle?.message}>
                  <TextInput
                    style={[styles.input, errors.certificateTitle && styles.inputError]}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Weighing Certificate"
                    placeholderTextColor="#999999"
                    maxLength={100}
                    accessibilityLabel="Certificate title"
                  />
                </FormField>
              )}
            />
          </View>
        </View>

        {/* Notes — full width */}
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormField label="Notes" error={errors.notes?.message}>
              <TextInput
                style={[styles.input, styles.textArea, errors.notes && styles.inputError]}
                value={field.value ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="Optional notes for this certificate…"
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
                maxLength={1000}
                accessibilityLabel="Certificate notes"
              />
              {/* Task 15: character count hint for bounded fields */}
              <Text style={styles.charCount}>
                {(field.value ?? '').length} / 1000
              </Text>
            </FormField>
          )}
        />

      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.saveDraftBtn}
          onPress={() => onSaveDraft(getValues())}
          accessibilityRole="button"
          accessibilityLabel="Save as draft"
        >
          <Text style={styles.saveDraftText}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, isSubmitting && styles.nextBtnDisabled]}
          onPress={handleSubmit(onNext)}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Proceed to readings step"
        >
          <Text style={styles.nextBtnText}>
            {isSubmitting ? 'Validating…' : 'Next: Readings →'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';
const ERROR_RED = '#B91C1C';
const ERROR_BG = '#FEF2F2';
const ERROR_BORDER = '#FCA5A5';

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#E8EDF5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 4,
  },
  halfField: {
    flex: 1,
  },
  fieldWrapper: {
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: '#555555',
    marginBottom: 4,
    marginTop: 8,
  },
  required: {
    color: '#CC0000',
  },
  input: {
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#333333',
  },
  inputError: {
    borderColor: ERROR_BORDER,
    borderWidth: 1.5,
    backgroundColor: ERROR_BG,
  },
  inputReadOnly: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },
  inputText: {
    fontSize: 13,
    color: '#333333',
    flex: 1,
  },
  placeholderText: {
    fontSize: 13,
    color: '#999999',
    flex: 1,
  },
  textArea: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
    marginHorizontal: 16,
  },
  charCount: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'right',
    marginHorizontal: 16,
    marginTop: 2,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
    color: '#999999',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginTop: 2,
    zIndex: 100,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF4FB',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333333',
  },
  dropdownItemTextSelected: {
    color: BLUE,
    fontWeight: '600',
  },
  // Task 15 — error messages
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
    gap: 4,
  },
  errorIcon: {
    fontSize: 11,
    color: ERROR_RED,
    marginTop: 1,
  },
  errorText: {
    fontSize: 11,
    color: ERROR_RED,
    flex: 1,
    lineHeight: 15,
  },
  errorBanner: {
    backgroundColor: ERROR_BG,
    borderColor: ERROR_BORDER,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBannerText: {
    fontSize: 13,
    color: ERROR_RED,
  },
  // Bottom action bar
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#DDDDDD',
  },
  saveDraftBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraftText: {
    fontSize: 14,
    fontWeight: '600',
    color: BLUE,
  },
  nextBtn: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
