# Task 31: Build a Simple Uncertainty Calculation Helper

**File:** `Weighsoft.mobile.v1/src/uncertainty.ts`  
**AI usage:** AI used to explain the calculations and suggest tests.

---

## What I asked AI to help with

I asked AI to explain the measurement uncertainty formulas used in weighbridge calibration and suggest what test cases would be meaningful.

## What AI explained

AI explained that weighbridge uncertainty calculations follow standard metrology practice based on OIML R 76 (the international standard for non-automatic weighing instruments). The two main uncertainty components are:

**Repeatability uncertainty** — how much the readings vary when you weigh the same load multiple times. Calculated as the standard deviation of the readings divided by the square root of n (the number of readings). This is a Type A uncertainty — estimated from observed data.

**Resolution uncertainty** — the uncertainty introduced by the scale's digital rounding. A scale with a 2kg division can only display weights in 2kg steps, so any reading could be up to 1kg off. This is modelled as a rectangular distribution, giving `u = d / (2√3)`. This is a Type B uncertainty — estimated from the instrument specification.

These two components are combined using root-sum-of-squares (RSS): `u_combined = √(u_repeatability² + u_resolution²)`

The final **expanded uncertainty** is `U = k × u_combined` where k=2 gives a 95% confidence interval (two standard deviations for a normal distribution).

## Functions implemented

| Function | Purpose |
|---|---|
| `calcMean(values)` | Average of readings |
| `calcStandardDeviation(values)` | Sample std dev (n-1 denominator) |
| `calcRepeatabilityUncertainty(s, n)` | s / √n |
| `calcResolutionUncertainty(d)` | d / (2√3) |
| `calcCombinedUncertainty(components)` | √(u1² + u2² + ...) |
| `calcWeighingUncertainty(input)` | Full uncertainty budget |
| `formatUncertaintyResult(result)` | Human-readable output string |

## Example output

```
5000.0 ± 2.582 kg (k=2, 95% confidence)
```

---

## AI usage reflection

AI's explanation of the rectangular distribution model for resolution uncertainty was the most useful — I wouldn't have known to use `d/(2√3)` without it. I verified all the formulas against the OIML R 76 standard description before implementing them. The test cases AI suggested were mostly happy-path; I added the edge cases (empty array, single reading, identical readings) myself.
