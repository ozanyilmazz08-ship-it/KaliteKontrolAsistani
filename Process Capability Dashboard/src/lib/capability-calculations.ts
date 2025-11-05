// Statistical calculations for Process Capability & Performance
// References: Montgomery, AIAG, ISO 22514, NIST/SEMATECH

import { CapabilityConfig, CapabilityIndices, ConfidenceInterval, TailMetrics, ProcessStatistics, ValidationError } from "./capability-types";

/**
 * Calculate basic process statistics
 */
export function calculateProcessStatistics(
  data: number[],
  subgroupSize: number,
  estimators: CapabilityConfig["estimators"]
): ProcessStatistics {
  const n = data.length;
  const mean = data.reduce((sum, x) => sum + x, 0) / n;
  const median = calculateMedian(data);
  
  // Overall standard deviation
  const sigmaOverall = Math.sqrt(
    data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1)
  );
  
  // Within-subgroup standard deviation (depends on estimator)
  const sigmaWithin = calculateSigmaWithin(data, subgroupSize, estimators.withinEstimator);
  
  // Skewness and kurtosis for normality assessment
  const skewness = calculateSkewness(data, mean, sigmaOverall);
  const kurtosis = calculateKurtosis(data, mean, sigmaOverall);
  
  const nSubgroups = Math.floor(n / subgroupSize);
  
  return {
    mean,
    median,
    stdDev: sigmaOverall,
    sigmaWithin,
    sigmaOverall,
    n,
    nSubgroups,
    skewness,
    kurtosis
  };
}

/**
 * Calculate within-subgroup standard deviation using various estimators
 * Reference: Montgomery - SQC, AIAG SPC Manual
 */
function calculateSigmaWithin(data: number[], m: number, method: string): number {
  const nSubgroups = Math.floor(data.length / m);
  
  switch (method) {
    case "rbar": {
      // R-bar / d2 method for X̄-R charts
      const ranges = [];
      for (let i = 0; i < nSubgroups; i++) {
        const subgroup = data.slice(i * m, (i + 1) * m);
        const range = Math.max(...subgroup) - Math.min(...subgroup);
        ranges.push(range);
      }
      const rBar = ranges.reduce((sum, r) => sum + r, 0) / nSubgroups;
      const d2 = getD2Constant(m);
      return rBar / d2;
    }
    
    case "sbar": {
      // S-bar / c4 method for X̄-S charts
      const stdevs = [];
      for (let i = 0; i < nSubgroups; i++) {
        const subgroup = data.slice(i * m, (i + 1) * m);
        const mean = subgroup.reduce((sum, x) => sum + x, 0) / m;
        const variance = subgroup.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (m - 1);
        stdevs.push(Math.sqrt(variance));
      }
      const sBar = stdevs.reduce((sum, s) => sum + s, 0) / nSubgroups;
      const c4 = getC4Constant(m);
      return sBar / c4;
    }
    
    case "pooled": {
      // Pooled standard deviation
      let sumSq = 0;
      for (let i = 0; i < nSubgroups; i++) {
        const subgroup = data.slice(i * m, (i + 1) * m);
        const mean = subgroup.reduce((sum, x) => sum + x, 0) / m;
        sumSq += subgroup.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0);
      }
      return Math.sqrt(sumSq / (nSubgroups * (m - 1)));
    }
    
    case "mr": {
      // Moving Range / d2 for individuals (X-mR)
      const movingRanges = [];
      for (let i = 1; i < data.length; i++) {
        movingRanges.push(Math.abs(data[i] - data[i - 1]));
      }
      const mrBar = movingRanges.reduce((sum, mr) => sum + mr, 0) / movingRanges.length;
      const d2 = 1.128; // d2 for n=2
      return mrBar / d2;
    }
    
    default:
      return calculateSigmaWithin(data, m, "rbar");
  }
}

/**
 * Calculate capability indices for both short-term and long-term
 * Reference: ISO 22514-2, Montgomery
 */
export function calculateCapabilityIndices(
  config: CapabilityConfig,
  stats: ProcessStatistics
): CapabilityIndices {
  const { lsl, usl, target } = config.specifications;
  const { mean, sigmaWithin, sigmaOverall } = stats;
  
  const indices: CapabilityIndices = {};
  
  // Short-term indices (using within-subgroup variation)
  if (lsl !== undefined && usl !== undefined) {
    // Two-sided specs
    const cp = (usl - lsl) / (6 * sigmaWithin);
    const cpu = (usl - mean) / (3 * sigmaWithin);
    const cpl = (mean - lsl) / (3 * sigmaWithin);
    const cpk = Math.min(cpu, cpl);
    
    indices.cp = { name: "Cp", value: cp, basis: "short-term" };
    indices.cpu = { name: "Cpu", value: cpu, basis: "short-term" };
    indices.cpl = { name: "Cpl", value: cpl, basis: "short-term" };
    indices.cpk = { name: "Cpk", value: cpk, basis: "short-term" };
    indices.zst = { name: "Z.ST", value: 3 * cpk, basis: "short-term" };
    
    // Cpm when target exists (Taguchi index - accounts for off-target loss)
    if (target !== undefined) {
      const tau = Math.sqrt(Math.pow(mean - target, 2) + Math.pow(sigmaWithin, 2));
      const cpm = (usl - lsl) / (6 * tau);
      indices.cpm = { name: "Cpm", value: cpm, basis: "short-term" };
    }
  } else if (lsl !== undefined) {
    // Lower spec only
    const cpl = (mean - lsl) / (3 * sigmaWithin);
    indices.cpl = { name: "Cpl", value: cpl, basis: "short-term" };
    indices.cpk = { name: "Cpk", value: cpl, basis: "short-term" };
    indices.zst = { name: "Z.ST", value: 3 * cpl, basis: "short-term" };
  } else if (usl !== undefined) {
    // Upper spec only
    const cpu = (usl - mean) / (3 * sigmaWithin);
    indices.cpu = { name: "Cpu", value: cpu, basis: "short-term" };
    indices.cpk = { name: "Cpk", value: cpu, basis: "short-term" };
    indices.zst = { name: "Z.ST", value: 3 * cpu, basis: "short-term" };
  }
  
  // Long-term indices (using overall variation)
  if (lsl !== undefined && usl !== undefined) {
    const pp = (usl - lsl) / (6 * sigmaOverall);
    const ppu = (usl - mean) / (3 * sigmaOverall);
    const ppl = (mean - lsl) / (3 * sigmaOverall);
    const ppk = Math.min(ppu, ppl);
    
    indices.pp = { name: "Pp", value: pp, basis: "long-term" };
    indices.ppu = { name: "Ppu", value: ppu, basis: "long-term" };
    indices.ppl = { name: "Ppl", value: ppl, basis: "long-term" };
    indices.ppk = { name: "Ppk", value: ppk, basis: "long-term" };
    indices.zlt = { name: "Z.LT", value: 3 * ppk, basis: "long-term" };
  } else if (lsl !== undefined) {
    const ppl = (mean - lsl) / (3 * sigmaOverall);
    indices.ppl = { name: "Ppl", value: ppl, basis: "long-term" };
    indices.ppk = { name: "Ppk", value: ppl, basis: "long-term" };
    indices.zlt = { name: "Z.LT", value: 3 * ppl, basis: "long-term" };
  } else if (usl !== undefined) {
    const ppu = (usl - mean) / (3 * sigmaOverall);
    indices.ppu = { name: "Ppu", value: ppu, basis: "long-term" };
    indices.ppk = { name: "Ppk", value: ppu, basis: "long-term" };
    indices.zlt = { name: "Z.LT", value: 3 * ppu, basis: "long-term" };
  }
  
  return indices;
}

/**
 * Calculate tail metrics (% and PPM outside specs, yield)
 * Reference: NIST/SEMATECH e-Handbook
 */
export function calculateTailMetrics(
  config: CapabilityConfig,
  stats: ProcessStatistics
): TailMetrics {
  const { lsl, usl } = config.specifications;
  const { mean, sigmaOverall } = stats;
  
  const metrics: TailMetrics = {};
  
  if (lsl !== undefined) {
    const zLower = (lsl - mean) / sigmaOverall;
    const pctBelowLSL = normalCDF(zLower) * 100;
    metrics.pctBelowLSL = pctBelowLSL;
    metrics.ppmBelowLSL = pctBelowLSL * 10_000; // Convert % to PPM (parts per million)
  }
  
  if (usl !== undefined) {
    const zUpper = (usl - mean) / sigmaOverall;
    const pctAboveUSL = (1 - normalCDF(zUpper)) * 100;
    metrics.pctAboveUSL = pctAboveUSL;
    metrics.ppmAboveUSL = pctAboveUSL * 10_000; // Convert % to PPM (parts per million)
  }
  
  if (lsl !== undefined && usl !== undefined) {
    metrics.ppmTotal = (metrics.ppmBelowLSL || 0) + (metrics.ppmAboveUSL || 0);
    metrics.yield = 100 - ((metrics.pctBelowLSL || 0) + (metrics.pctAboveUSL || 0));
  } else if (lsl !== undefined) {
    metrics.ppmTotal = metrics.ppmBelowLSL;
    metrics.yield = 100 - (metrics.pctBelowLSL || 0);
  } else if (usl !== undefined) {
    metrics.ppmTotal = metrics.ppmAboveUSL;
    metrics.yield = 100 - (metrics.pctAboveUSL || 0);
  }
  
  return metrics;
}

/**
 * Validate configuration and return validation errors
 */
export function validateConfiguration(config: CapabilityConfig, n: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const { lsl, usl, target } = config.specifications;
  
  // Spec relationship validation
  if (lsl !== undefined && usl !== undefined) {
    if (lsl >= usl) {
      errors.push({
        field: "specifications",
        message: "Lower Spec Limit must be less than Upper Spec Limit (LSL < USL)",
        severity: "error"
      });
    }
    
    if (target !== undefined) {
      if (target <= lsl || target >= usl) {
        errors.push({
          field: "specifications.target",
          message: "Target must be between LSL and USL (LSL < Target < USL)",
          severity: "error"
        });
      }
    }
  }
  
  // No specs defined
  if (lsl === undefined && usl === undefined) {
    errors.push({
      field: "specifications",
      message: "No specification limits defined. Capability indices cannot be computed. Only performance statistics will be shown.",
      severity: "warning"
    });
  }
  
  // Sample size warnings
  if (n < 25) {
    errors.push({
      field: "sampleSize",
      message: `Sample size (${n}) is small (< 25). Confidence intervals will be wide and estimates may be unreliable.`,
      severity: "warning"
    });
  }
  
  if (n < 100) {
    errors.push({
      field: "sampleSize",
      message: `For reliable capability estimates, n ≥ 100 is recommended (current: ${n}).`,
      severity: "info"
    });
  }
  
  // Subgroup size validation
  if (config.subgroupSize < 2) {
    errors.push({
      field: "subgroupSize",
      message: "Subgroup size must be at least 2 for range-based estimators. Use Individuals (X-mR) for single observations.",
      severity: "error"
    });
  }
  
  if (config.subgroupSize < 4 && config.estimators.withinEstimator === "rbar") {
    errors.push({
      field: "subgroupSize",
      message: "Subgroup size < 4 reduces efficiency of R̄/d₂ estimator. Consider using S̄/c₄ instead.",
      severity: "info"
    });
  }
  
  // Bootstrap validation
  if (config.bootstrapResamples < 1000) {
    errors.push({
      field: "bootstrapResamples",
      message: "Bootstrap resamples < 1000 may yield unstable confidence intervals. Increase to ≥ 1000.",
      severity: "warning"
    });
  }
  
  // Cpm validation
  if (target !== undefined && (lsl === undefined || usl === undefined)) {
    errors.push({
      field: "specifications.target",
      message: "Cpm requires both LSL and USL to be defined along with Target.",
      severity: "info"
    });
  }
  
  return errors;
}

// Helper functions

function calculateMedian(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateSkewness(data: number[], mean: number, stdDev: number): number {
  const n = data.length;
  const m3 = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 3), 0) / n;
  return m3;
}

function calculateKurtosis(data: number[], mean: number, stdDev: number): number {
  const n = data.length;
  const m4 = data.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 4), 0) / n;
  return m4 - 3; // Excess kurtosis
}

/**
 * Standard normal CDF using approximation
 * Reference: Abramowitz and Stegun
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Control chart constants
 * Reference: Montgomery - Appendix VI
 */
function getD2Constant(n: number): number {
  const d2Table: Record<number, number> = {
    2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326,
    6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970,
    10: 3.078, 15: 3.472, 20: 3.735, 25: 3.931
  };
  return d2Table[n] || 3 + 0.0032 * (n - 25); // Approximation for n > 25
}

function getC4Constant(n: number): number {
  // c4 = sqrt(2/(n-1)) * Γ(n/2) / Γ((n-1)/2)
  // Approximation for practical use
  if (n <= 1) return 1;
  return Math.sqrt(2 / (n - 1)) * gamma(n / 2) / gamma((n - 1) / 2);
}

function gamma(z: number): number {
  // Stirling's approximation for gamma function
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  let x = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Generate mock data for demonstration
 */
export function generateMockData(n: number, mean: number = 100, sigma: number = 2): number[] {
  const data: number[] = [];
  for (let i = 0; i < n; i++) {
    // Box-Muller transform for normal random numbers
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    data.push(mean + sigma * z);
  }
  return data;
}
