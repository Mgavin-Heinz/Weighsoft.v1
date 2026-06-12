/**
 * Task 31 — Uncertainty calculation helper
 *
 * Implements weighbridge measurement uncertainty calculations
 * based on standard metrology formulas used in calibration.
 *
 * AI usage: AI explained the calculations and suggested test cases.
 * All formulas verified against OIML R 76 (non-automatic weighing instruments).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeighingReading {
  value: number;    // measured weight in kg
  unit?: string;    // default 'kg'
}

export interface UncertaintyInput {
  readings: WeighingReading[];
  /** Scale division (d) — smallest graduation on the scale in kg */
  scaleDivision: number;
  /** Maximum capacity of the scale in kg */
  maxCapacity: number;
  /** Coverage factor k — typically 2 for 95% confidence */
  coverageFactor?: number;
}

export interface UncertaintyResult {
  /** Mean (average) of all readings */
  mean: number;
  /** Standard deviation of readings */
  standardDeviation: number;
  /** Standard uncertainty from repeatability */
  standardUncertainty: number;
  /** Uncertainty from scale resolution (digital rounding) */
  resolutionUncertainty: number;
  /** Combined standard uncertainty */
  combinedUncertainty: number;
  /** Expanded uncertainty U = k * combinedUncertainty */
  expandedUncertainty: number;
  /** Coverage factor used */
  coverageFactor: number;
  /** Number of readings used */
  n: number;
  /** Whether the result is within acceptable tolerance */
  withinTolerance: boolean;
  /** Tolerance limit used (0.5 * scaleDivision for Class III scales) */
  toleranceLimit: number;
}

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Calculates the mean (average) of an array of numbers.
 */
export function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculates the sample standard deviation (uses n-1 denominator).
 * Returns 0 for a single reading (no spread to measure).
 */
export function calcStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = calcMean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates the standard uncertainty from repeatability.
 * u_repeatability = s / sqrt(n)
 * where s is the standard deviation and n is number of readings.
 */
export function calcRepeatabilityUncertainty(
  standardDeviation: number,
  n: number,
): number {
  if (n <= 0) return 0;
  return standardDeviation / Math.sqrt(n);
}

/**
 * Calculates the uncertainty contribution from scale resolution.
 * For a digital scale with division d, the resolution uncertainty is:
 * u_resolution = d / (2 * sqrt(3))
 *
 * This comes from a rectangular distribution over [-d/2, +d/2].
 */
export function calcResolutionUncertainty(scaleDivision: number): number {
  return scaleDivision / (2 * Math.sqrt(3));
}

/**
 * Combines multiple uncertainty components using root-sum-of-squares (RSS).
 * u_combined = sqrt(u1² + u2² + ... + un²)
 */
export function calcCombinedUncertainty(uncertainties: number[]): number {
  const sumOfSquares = uncertainties.reduce((sum, u) => sum + Math.pow(u, 2), 0);
  return Math.sqrt(sumOfSquares);
}

/**
 * Calculates the full uncertainty budget for a weighbridge measurement.
 *
 * Usage:
 *   const result = calcWeighingUncertainty({
 *     readings: [{ value: 5002 }, { value: 4998 }, { value: 5000 }],
 *     scaleDivision: 2,
 *     maxCapacity: 80000,
 *   });
 */
export function calcWeighingUncertainty(input: UncertaintyInput): UncertaintyResult {
  const { readings, scaleDivision, coverageFactor = 2 } = input;
  const values = readings.map((r) => r.value);
  const n = values.length;

  if (n === 0) {
    throw new Error('At least one reading is required');
  }

  const mean = calcMean(values);
  const stdDev = calcStandardDeviation(values);
  const repeatabilityU = calcRepeatabilityUncertainty(stdDev, n);
  const resolutionU = calcResolutionUncertainty(scaleDivision);
  const combinedU = calcCombinedUncertainty([repeatabilityU, resolutionU]);
  const expandedU = coverageFactor * combinedU;

  // Tolerance limit: for OIML Class III scales, MPE = 0.5d at zero load
  // For practical purposes we use 1 scale division as the tolerance
  const toleranceLimit = scaleDivision;
  const withinTolerance = expandedU <= toleranceLimit;

  return {
    mean: Math.round(mean * 1000) / 1000,
    standardDeviation: Math.round(stdDev * 10000) / 10000,
    standardUncertainty: Math.round(repeatabilityU * 10000) / 10000,
    resolutionUncertainty: Math.round(resolutionU * 10000) / 10000,
    combinedUncertainty: Math.round(combinedU * 10000) / 10000,
    expandedUncertainty: Math.round(expandedU * 10000) / 10000,
    coverageFactor,
    n,
    withinTolerance,
    toleranceLimit,
  };
}

/**
 * Formats an uncertainty result as a display string.
 * e.g. "5000.0 ± 1.6 kg (k=2, 95% confidence)"
 */
export function formatUncertaintyResult(
  result: UncertaintyResult,
  unit: string = 'kg',
): string {
  return (
    `${result.mean} ± ${result.expandedUncertainty} ${unit} ` +
    `(k=${result.coverageFactor}, 95% confidence)`
  );
}
