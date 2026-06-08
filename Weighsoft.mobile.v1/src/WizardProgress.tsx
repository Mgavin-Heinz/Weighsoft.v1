/**
 * Task 30 — Progress indicators for the New Certificate multi-step wizard
 *
 * Provides:
 *  - <WizardProgress>        step indicator bar at the top of the wizard
 *  - <CertificateWizard>     container that manages step state and renders the right screen
 *
 * AI usage: AI proposed the UX states and copy for each step.
 * See Task30_ProgressIndicators.md for the full reasoning.
 *
 * Steps:
 *  1 — Details    (product, haulier, date, template)
 *  2 — Readings   (gross, tare, reference weights)
 *  3 — Summary    (calculated net, variance, tolerance check)
 *  4 — Review     (final preview before submit or save draft)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { NewCertificateStep1Values } from './NewCertificateSchema';

// ─── Step definitions ─────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4;

interface StepDefinition {
  step: WizardStep;
  label: string;
  /** Short description shown below the step number */
  sublabel: string;
  /** Copy shown in the "Next" button when leaving this step */
  nextLabel: string;
  /** Copy shown in the header title when on this step */
  headerTitle: string;
}

// AI usage: AI proposed these labels and button copy.
// I adjusted "Confirm" → "Submit for Review" on step 4 to match the actual
// workflow — submitting a cert puts it in UNDER_REVIEW, not finalised.
export const WIZARD_STEPS: StepDefinition[] = [
  {
    step: 1,
    label: 'Details',
    sublabel: 'Job info',
    nextLabel: 'Next: Readings →',
    headerTitle: 'New Certificate — Details',
  },
  {
    step: 2,
    label: 'Readings',
    sublabel: 'Weights',
    nextLabel: 'Next: Summary →',
    headerTitle: 'New Certificate — Readings',
  },
  {
    step: 3,
    label: 'Summary',
    sublabel: 'Check',
    nextLabel: 'Next: Review →',
    headerTitle: 'New Certificate — Summary',
  },
  {
    step: 4,
    label: 'Review',
    sublabel: 'Submit',
    nextLabel: 'Submit for Review',
    headerTitle: 'New Certificate — Review',
  },
];

// ─── WizardProgress ───────────────────────────────────────────────────────────

interface WizardProgressProps {
  currentStep: WizardStep;
  /** Steps that have been completed and validated */
  completedSteps: WizardStep[];
  onStepPress?: (step: WizardStep) => void;
}

/**
 * WizardProgress
 *
 * Horizontal step indicator with three visual states per step:
 *  - Completed  — filled blue circle with ✓, label in blue
 *  - Current    — filled blue circle with step number, label bold
 *  - Upcoming   — empty circle with step number, label grey
 *
 * Tapping a completed step navigates back to it.
 *
 * Usage:
 *   <WizardProgress
 *     currentStep={2}
 *     completedSteps={[1]}
 *     onStepPress={(step) => setCurrentStep(step)}
 *   />
 */
export function WizardProgress({
  currentStep,
  completedSteps,
  onStepPress,
}: WizardProgressProps) {
  return (
    <View style={styles.progressContainer}>
      {WIZARD_STEPS.map((def, index) => {
        const isCompleted = completedSteps.includes(def.step);
        const isCurrent = currentStep === def.step;
        const isUpcoming = !isCompleted && !isCurrent;
        const isLast = index === WIZARD_STEPS.length - 1;

        return (
          <View key={def.step} style={styles.stepWrapper}>
            {/* Step circle + label */}
            <TouchableOpacity
              style={styles.stepTouchable}
              onPress={() => isCompleted && onStepPress?.(def.step)}
              disabled={!isCompleted}
              accessibilityRole="button"
              accessibilityLabel={`Step ${def.step}: ${def.label}${isCompleted ? ', completed' : isCurrent ? ', current' : ', not yet reached'}`}
              accessibilityState={{ selected: isCurrent, disabled: !isCompleted }}
            >
              {/* Circle */}
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                  isUpcoming && styles.circleUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.circleCheckmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.circleNumber,
                      isCurrent && styles.circleNumberCurrent,
                      isUpcoming && styles.circleNumberUpcoming,
                    ]}
                  >
                    {def.step}
                  </Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isCurrent && styles.stepLabelCurrent,
                  isUpcoming && styles.stepLabelUpcoming,
                ]}
                numberOfLines={1}
              >
                {def.label}
              </Text>
            </TouchableOpacity>

            {/* Connector line between steps */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── WizardNavBar ─────────────────────────────────────────────────────────────

interface WizardNavBarProps {
  currentStep: WizardStep;
  canGoNext: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

/**
 * WizardNavBar
 *
 * Bottom action bar with Back, Save Draft, and Next buttons.
 * Back is hidden on step 1.
 * Next becomes "Submit for Review" on step 4.
 */
export function WizardNavBar({
  currentStep,
  canGoNext,
  isLastStep,
  onBack,
  onNext,
  onSaveDraft,
  isSubmitting = false,
}: WizardNavBarProps) {
  const currentDef = WIZARD_STEPS.find((s) => s.step === currentStep)!;

  return (
    <View style={styles.navBar}>
      {/* Back button — hidden on step 1 */}
      {currentStep > 1 ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous step"
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtnPlaceholder} />
      )}

      {/* Save Draft — always available */}
      <TouchableOpacity
        style={styles.saveDraftBtn}
        onPress={onSaveDraft}
        accessibilityRole="button"
        accessibilityLabel="Save as draft"
      >
        <Text style={styles.saveDraftBtnText}>Save Draft</Text>
      </TouchableOpacity>

      {/* Next / Submit */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          isLastStep && styles.nextBtnSubmit,
          (!canGoNext || isSubmitting) && styles.nextBtnDisabled,
        ]}
        onPress={onNext}
        disabled={!canGoNext || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={currentDef.nextLabel}
      >
        <Text style={styles.nextBtnText}>
          {isSubmitting ? 'Submitting…' : currentDef.nextLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── CertificateWizard ────────────────────────────────────────────────────────

interface CertificateWizardProps {
  initialStep?: WizardStep;
  onComplete: (values: NewCertificateStep1Values) => void;
  onDismiss: () => void;
}

/**
 * CertificateWizard
 *
 * Container component that manages wizard state:
 *  - Which step is current
 *  - Which steps are completed
 *  - Accumulated form data across steps
 *  - Navigation between steps
 *
 * Each step's content is a placeholder — replace with real step screens.
 */
export function CertificateWizard({
  initialStep = 1,
  onComplete,
  onDismiss,
}: CertificateWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDef = WIZARD_STEPS.find((s) => s.step === currentStep)!;
  const isLastStep = currentStep === 4;

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      // In production: submit the accumulated form data
      // onComplete(accumulatedValues);
      setIsSubmitting(false);
      return;
    }

    // Mark current step as completed and advance
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );
    setCurrentStep((prev) => (prev + 1) as WizardStep);
  }, [currentStep, isLastStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(() => {
    // Auto-save hook handles persistence — this just dismisses
    onDismiss();
  }, [onDismiss]);

  return (
    <View style={styles.wizardContainer}>
      {/* Progress indicator */}
      <WizardProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepPress={goToStep}
      />

      {/* Step content area */}
      <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
        <StepContent step={currentStep} />
      </ScrollView>

      {/* Navigation bar */}
      <WizardNavBar
        currentStep={currentStep}
        canGoNext={true}
        isLastStep={isLastStep}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

// ─── Step content placeholders ────────────────────────────────────────────────

function StepContent({ step }: { step: WizardStep }) {
  const labels: Record<WizardStep, string> = {
    1: 'Step 1: Details\n\nReplace with <NewCertificateForm /> from Task 14.',
    2: 'Step 2: Readings\n\nCapture GROSS, TARE, and REFERENCE weight readings.',
    3: 'Step 3: Summary\n\nShow calculated NET weight, variance, and tolerance check.',
    4: 'Step 4: Review\n\nFinal preview of all details before submitting for review.',
  };

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{labels[step]}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1F3864';
const BLUE_LIGHT = '#D9E2F3';
const GREEN = '#065F46';

const styles = StyleSheet.create({
  // Progress bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F4',
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTouchable: {
    alignItems: 'center',
    gap: 4,
  },

  // Circles
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  circleCompleted: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  circleCurrent: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  circleUpcoming: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
  },
  circleCheckmark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  circleNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  circleNumberCurrent: {
    color: '#FFFFFF',
  },
  circleNumberUpcoming: {
    color: '#AAAAAA',
  },

  // Labels
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: GREEN,
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: BLUE,
    fontWeight: '700',
  },
  stepLabelUpcoming: {
    color: '#999999',
  },

  // Connector line
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  connectorCompleted: {
    backgroundColor: GREEN,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#DDDDDD',
  },
  backBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 60,
  },
  backBtnText: {
    fontSize: 13,
    color: '#555555',
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
  saveDraftBtnText: {
    fontSize: 13,
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
  nextBtnSubmit: {
    backgroundColor: GREEN,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Wizard container
  wizardContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  stepContent: {
    flex: 1,
  },

  // Placeholder
  placeholder: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
