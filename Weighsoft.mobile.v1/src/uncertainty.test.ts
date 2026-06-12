/**
 * Task 32 — Test fixtures for uncertainty/calibration calculations
 *
 * AI usage: AI generated sample datasets; expected values verified manually
 * using a spreadsheet before adding them as test assertions.
 */

import {
  calcMean,
  calcStandardDeviation,
  calcRepeatabilityUncertainty,
  calcResolutionUncertainty,
  calcCombinedUncertainty,
  calcWeighingUncertainty,
  formatUncertaintyResult,
} from './uncertainty';

// ─── Test fixtures ────────────────────────────────────────────────────────────
// All expected values manually verified in a spreadsheet before use.

const FIXTURES = {
  /** Three consistent readings — tight spread, low uncertainty */
  consistent: {
    readings: [{ value: 5000 }, { value: 5002 }, { value: 4998 }],
    scaleDivision: 2,
    maxCapacity: 80000,
    expected: {
      mean: 5000,
      standardDeviation: 2,
      // s/sqrt(n) = 2/sqrt(3) = 1.1547
      standardUncertainty: 1.1547,
      // d/(2*sqrt(3)) = 2/(2*1.7321) = 0.5774
      resolutionUncertainty: 0.5774,
      // sqrt(1.1547² + 0.5774²) = sqrt(1.3333 + 0.3333) = sqrt(1.6667) = 1.2910
      combinedUncertainty: 1.291,
      // k=2: 2 * 1.291 = 2.582
      expandedUncertainty: 2.582,
    },
  },

  /** Single reading — no repeatability, only resolution uncertainty */
  singleReading: {
    readings: [{ value: 10000 }],
    scaleDivision: 5,
    maxCapacity: 80000,
    expected: {
      mean: 10000,
      standardDeviation: 0,
      standardUncertainty: 0,
      // 5/(2*sqrt(3)) = 1.4434
      resolutionUncertainty: 1.4434,
      combinedUncertainty: 1.4434,
      expandedUncertainty: 2.8868,
    },
  },

  /** Wide spread readings — high uncertainty, likely fails tolerance */
  wideSpread: {
    readings: [{ value: 4980 }, { value: 5010 }, { value: 5005 }, { value: 4995 }],
    scaleDivision: 2,
    maxCapacity: 80000,
    expected: {
      mean: 4997.5,
    },
  },

  /** All identical readings — zero standard deviation */
  identical: {
    readings: [{ value: 2500 }, { value: 2500 }, { value: 2500 }],
    scaleDivision: 1,
    maxCapacity: 10000,
    expected: {
      mean: 2500,
      standardDeviation: 0,
      standardUncertainty: 0,
    },
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calcMean()', () => {
  it('returns the average of a set of readings', () => {
    expect(calcMean([5000, 5002, 4998])).toBeCloseTo(5000, 5);
  });

  it('returns the single value for a one-element array', () => {
    expect(calcMean([10000])).toBe(10000);
  });

  it('returns 0 for an empty array', () => {
    expect(calcMean([])).toBe(0);
  });

  it('handles non-round averages correctly', () => {
    expect(calcMean([4980, 5010, 5005, 4995])).toBeCloseTo(4997.5, 5);
  });
});

describe('calcStandardDeviation()', () => {
  it('calculates sample std dev for consistent readings', () => {
    expect(calcStandardDeviation([5000, 5002, 4998])).toBeCloseTo(2, 4);
  });

  it('returns 0 for identical readings', () => {
    expect(calcStandardDeviation([2500, 2500, 2500])).toBe(0);
  });

  it('returns 0 for a single reading', () => {
    expect(calcStandardDeviation([10000])).toBe(0);
  });

  it('returns 0 for an empty array', () => {
    expect(calcStandardDeviation([])).toBe(0);
  });

  it('uses n-1 denominator (sample, not population)', () => {
    // For [2, 4]: mean=3, deviations=[-1,1], sum sq=2, variance=2/(2-1)=2, sd=sqrt(2)=1.4142
    expect(calcStandardDeviation([2, 4])).toBeCloseTo(1.4142, 4);
  });
});

describe('calcRepeatabilityUncertainty()', () => {
  it('calculates u = s / sqrt(n)', () => {
    // s=2, n=3: 2/sqrt(3) = 1.1547
    expect(calcRepeatabilityUncertainty(2, 3)).toBeCloseTo(1.1547, 4);
  });

  it('returns 0 when standard deviation is 0', () => {
    expect(calcRepeatabilityUncertainty(0, 5)).toBe(0);
  });

  it('returns 0 for n=0', () => {
    expect(calcRepeatabilityUncertainty(2, 0)).toBe(0);
  });
});

describe('calcResolutionUncertainty()', () => {
  it('calculates d / (2 * sqrt(3)) for scale division 2', () => {
    // 2 / (2 * 1.7321) = 0.5774
    expect(calcResolutionUncertainty(2)).toBeCloseTo(0.5774, 4);
  });

  it('calculates correctly for scale division 5', () => {
    // 5 / (2 * 1.7321) = 1.4434
    expect(calcResolutionUncertainty(5)).toBeCloseTo(1.4434, 4);
  });

  it('calculates correctly for scale division 1', () => {
    expect(calcResolutionUncertainty(1)).toBeCloseTo(0.2887, 4);
  });
});

describe('calcCombinedUncertainty()', () => {
  it('combines two components using root-sum-of-squares', () => {
    // sqrt(1.1547² + 0.5774²) = sqrt(1.3333 + 0.3333) = sqrt(1.6667) = 1.2910
    expect(calcCombinedUncertainty([1.1547, 0.5774])).toBeCloseTo(1.291, 3);
  });

  it('returns the single value when only one component', () => {
    expect(calcCombinedUncertainty([2.5])).toBeCloseTo(2.5, 5);
  });

  it('returns 0 for all-zero components', () => {
    expect(calcCombinedUncertainty([0, 0, 0])).toBe(0);
  });
});

describe('calcWeighingUncertainty() — consistent readings fixture', () => {
  const { readings, scaleDivision, maxCapacity, expected } = FIXTURES.consistent;

  it('calculates correct mean', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.mean).toBeCloseTo(expected.mean, 2);
  });

  it('calculates correct standard deviation', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.standardDeviation).toBeCloseTo(expected.standardDeviation, 3);
  });

  it('calculates correct resolution uncertainty', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.resolutionUncertainty).toBeCloseTo(expected.resolutionUncertainty, 3);
  });

  it('calculates correct expanded uncertainty', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.expandedUncertainty).toBeCloseTo(expected.expandedUncertainty, 2);
  });

  it('uses coverage factor k=2 by default', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.coverageFactor).toBe(2);
  });
});

describe('calcWeighingUncertainty() — single reading fixture', () => {
  const { readings, scaleDivision, maxCapacity, expected } = FIXTURES.singleReading;

  it('has zero standard deviation for single reading', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.standardDeviation).toBe(0);
    expect(result.standardUncertainty).toBe(0);
  });

  it('expanded uncertainty comes entirely from resolution', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.expandedUncertainty).toBeCloseTo(expected.expandedUncertainty, 3);
  });
});

describe('calcWeighingUncertainty() — identical readings fixture', () => {
  const { readings, scaleDivision, maxCapacity, expected } = FIXTURES.identical;

  it('returns zero standard uncertainty for identical readings', () => {
    const result = calcWeighingUncertainty({ readings, scaleDivision, maxCapacity });
    expect(result.standardUncertainty).toBe(0);
    expect(result.mean).toBe(expected.mean);
  });
});

describe('calcWeighingUncertainty() — edge cases', () => {
  it('throws for empty readings array', () => {
    expect(() =>
      calcWeighingUncertainty({ readings: [], scaleDivision: 2, maxCapacity: 80000 }),
    ).toThrow('At least one reading is required');
  });

  it('accepts a custom coverage factor', () => {
    const result = calcWeighingUncertainty({
      readings: [{ value: 5000 }, { value: 5002 }],
      scaleDivision: 2,
      maxCapacity: 80000,
      coverageFactor: 3,
    });
    expect(result.coverageFactor).toBe(3);
    expect(result.expandedUncertainty).toBeCloseTo(result.combinedUncertainty * 3, 5);
  });

  it('reports n correctly', () => {
    const result = calcWeighingUncertainty({
      readings: [{ value: 5000 }, { value: 5001 }, { value: 4999 }, { value: 5000 }],
      scaleDivision: 2,
      maxCapacity: 80000,
    });
    expect(result.n).toBe(4);
  });
});

describe('formatUncertaintyResult()', () => {
  it('formats the result as a readable string', () => {
    const result = calcWeighingUncertainty({
      readings: [{ value: 5000 }, { value: 5002 }, { value: 4998 }],
      scaleDivision: 2,
      maxCapacity: 80000,
    });
    const formatted = formatUncertaintyResult(result);
    expect(formatted).toContain('5000');
    expect(formatted).toContain('±');
    expect(formatted).toContain('kg');
    expect(formatted).toContain('k=2');
    expect(formatted).toContain('95%');
  });
});
