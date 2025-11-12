// Statistical methods for Predictive Analytics
// References: Hyndman & Athanasopoulos, Montgomery (SPC), NIST e-Handbook

/**
 * Standard normal CDF approximation (Φ function)
 * Using Abramowitz & Stegun approximation
 */
export function normalCDF(z: number): number {
  const sign = z >= 0 ? 1 : -1;
  const x = Math.abs(z) / Math.sqrt(2);
  
  // Constants for error function approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const t = 1 / (1 + p * x);
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1 + sign * erf);
}

/**
 * Calculate risk to specification limits using normal approximation
 * Returns P(<LSL), P(>USL), PPM, and Forecasted Yield
 */
export interface SpecRisk {
  probBelowLSL: number;
  probAboveUSL: number;
  totalOutProb: number;
  ppm: number;
  forecastedYield: number;
  zLSL: number;
  zUSL: number;
}

export function calculateSpecRisk(
  mu: number,
  sigma: number,
  LSL: number,
  USL: number
): SpecRisk {
  // Z-scores
  const zLSL = (mu - LSL) / sigma;
  const zUSL = (USL - mu) / sigma;
  
  // Probabilities using normal CDF
  const probBelowLSL = normalCDF(-zLSL);  // P(Y < LSL)
  const probAboveUSL = 1 - normalCDF(zUSL);  // P(Y > USL)
  
  const totalOutProb = probBelowLSL + probAboveUSL;
  const ppm = totalOutProb * 1e6;
  const forecastedYield = (1 - totalOutProb) * 100;
  
  return {
    probBelowLSL,
    probAboveUSL,
    totalOutProb,
    ppm,
    forecastedYield,
    zLSL,
    zUSL
  };
}

/**
 * Calculate projected Cpk (informational only)
 * Cpk_h = min((USL - μ̂h)/(3σ_within), (μ̂h - LSL)/(3σ_within))
 */
export function calculateProjectedCpk(
  mu: number,
  sigmaWithin: number,
  LSL: number,
  USL: number
): number {
  const cpkUpper = (USL - mu) / (3 * sigmaWithin);
  const cpkLower = (mu - LSL) / (3 * sigmaWithin);
  return Math.min(cpkUpper, cpkLower);
}

/**
 * Population Stability Index (PSI)
 * Measures distribution drift between baseline and current period
 * PSI = Σ (current_i - baseline_i) * ln(current_i / baseline_i)
 * 
 * Thresholds:
 * < 0.1: Small drift (no action)
 * 0.1 - 0.25: Moderate drift (investigate)
 * > 0.25: Large drift (retraining required)
 */
export function calculatePSI(
  baselineDistribution: number[],
  currentDistribution: number[]
): number {
  if (baselineDistribution.length !== currentDistribution.length) {
    throw new Error('Distributions must have same length');
  }
  
  let psi = 0;
  const epsilon = 1e-10; // Avoid log(0)
  
  for (let i = 0; i < baselineDistribution.length; i++) {
    const baseline = Math.max(baselineDistribution[i], epsilon);
    const current = Math.max(currentDistribution[i], epsilon);
    
    psi += (current - baseline) * Math.log(current / baseline);
  }
  
  return psi;
}

/**
 * Kolmogorov-Smirnov (KS) statistic
 * Measures maximum distance between two cumulative distributions
 */
export function calculateKS(
  sample1: number[],
  sample2: number[]
): number {
  const sorted1 = [...sample1].sort((a, b) => a - b);
  const sorted2 = [...sample2].sort((a, b) => a - b);
  
  const allValues = [...sorted1, ...sorted2].sort((a, b) => a - b);
  const uniqueValues = Array.from(new Set(allValues));
  
  let maxDiff = 0;
  
  for (const val of uniqueValues) {
    const cdf1 = sorted1.filter(x => x <= val).length / sorted1.length;
    const cdf2 = sorted2.filter(x => x <= val).length / sorted2.length;
    const diff = Math.abs(cdf1 - cdf2);
    maxDiff = Math.max(maxDiff, diff);
  }
  
  return maxDiff;
}

/**
 * EWMA (Exponentially Weighted Moving Average) control chart
 * z_t = λ * x_t + (1-λ) * z_{t-1}
 * 
 * Typically λ ∈ [0.1, 0.3]
 * Control limits: μ ± L*σ*sqrt(λ/(2-λ))
 */
export function calculateEWMA(
  data: number[],
  lambda: number = 0.2,
  L: number = 3
): { ewma: number[]; ucl: number; lcl: number; centerLine: number } {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (data.length - 1);
  const sigma = Math.sqrt(variance);
  
  const ewma: number[] = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    ewma[i] = lambda * data[i] + (1 - lambda) * ewma[i - 1];
  }
  
  const controlWidth = L * sigma * Math.sqrt(lambda / (2 - lambda));
  
  return {
    ewma,
    ucl: mean + controlWidth,
    lcl: mean - controlWidth,
    centerLine: mean
  };
}

/**
 * CUSUM (Cumulative Sum) control chart
 * Detects small sustained shifts in process mean
 * 
 * C+ = max(0, x_i - (μ + k) + C+_{i-1})
 * C- = max(0, (μ - k) - x_i + C-_{i-1})
 * 
 * Signal when C+ > H or C- > H
 */
export function calculateCUSUM(
  data: number[],
  k: number = 0.5,
  H: number = 5
): { 
  cusumPos: number[]; 
  cusumNeg: number[]; 
  signalPoints: number[];
  threshold: number;
} {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (data.length - 1);
  const sigma = Math.sqrt(variance);
  
  const kValue = k * sigma;
  const hValue = H * sigma;
  
  const cusumPos: number[] = [0];
  const cusumNeg: number[] = [0];
  const signalPoints: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const cPos = Math.max(0, data[i] - (mean + kValue) + (cusumPos[i] || 0));
    const cNeg = Math.max(0, (mean - kValue) - data[i] + (cusumNeg[i] || 0));
    
    cusumPos.push(cPos);
    cusumNeg.push(cNeg);
    
    if (cPos > hValue || cNeg > hValue) {
      signalPoints.push(i);
    }
  }
  
  return {
    cusumPos: cusumPos.slice(1),
    cusumNeg: cusumNeg.slice(1),
    signalPoints,
    threshold: hValue
  };
}

/**
 * Calculate forecast accuracy metrics
 * - RMSE: Root Mean Square Error
 * - MAE: Mean Absolute Error
 * - MAPE: Mean Absolute Percentage Error
 * - sMAPE: Symmetric MAPE
 * - MASE: Mean Absolute Scaled Error
 */
export interface AccuracyMetrics {
  rmse: number;
  mae: number;
  mape: number;
  smape: number;
  mase: number;
}

export function calculateAccuracyMetrics(
  actual: number[],
  forecast: number[],
  naiveForecastError?: number
): AccuracyMetrics {
  if (actual.length !== forecast.length) {
    throw new Error('Arrays must have same length');
  }
  
  const n = actual.length;
  let sumSquaredError = 0;
  let sumAbsError = 0;
  let sumPercentError = 0;
  let sumSymmetricPercentError = 0;
  
  for (let i = 0; i < n; i++) {
    const error = actual[i] - forecast[i];
    const absError = Math.abs(error);
    
    sumSquaredError += error * error;
    sumAbsError += absError;
    
    if (actual[i] !== 0) {
      sumPercentError += Math.abs(error / actual[i]);
    }
    
    const denominator = (Math.abs(actual[i]) + Math.abs(forecast[i])) / 2;
    if (denominator !== 0) {
      sumSymmetricPercentError += absError / denominator;
    }
  }
  
  const rmse = Math.sqrt(sumSquaredError / n);
  const mae = sumAbsError / n;
  const mape = (sumPercentError / n) * 100;
  const smape = (sumSymmetricPercentError / n) * 100;
  
  // MASE requires naive forecast MAE (typically from training data)
  const mase = naiveForecastError ? mae / naiveForecastError : mae;
  
  return { rmse, mae, mape, smape, mase };
}

/**
 * Weibull reliability function
 * S(t) = exp(-(t/η)^β)
 * where β is shape parameter and η is scale parameter
 */
export function weibullSurvival(
  t: number,
  beta: number,
  eta: number
): number {
  return Math.exp(-Math.pow(t / eta, beta));
}

/**
 * Weibull hazard rate
 * h(t) = (β/η) * (t/η)^(β-1)
 */
export function weibullHazard(
  t: number,
  beta: number,
  eta: number
): number {
  return (beta / eta) * Math.pow(t / eta, beta - 1);
}

/**
 * Calculate Remaining Useful Life (RUL) from Weibull parameters
 * Returns median and confidence bounds
 */
export function calculateRUL(
  currentAge: number,
  beta: number,
  eta: number,
  confidenceLevel: number = 0.9
): { median: number; lower: number; upper: number } {
  // Conditional survival at current age
  const S_current = weibullSurvival(currentAge, beta, eta);
  
  // Median RUL: time where S(t+age)/S(age) = 0.5
  const medianLife = eta * Math.pow(-Math.log(0.5), 1 / beta);
  const medianRUL = Math.max(0, medianLife - currentAge);
  
  // Confidence bounds
  const lowerQuantile = (1 - confidenceLevel) / 2;
  const upperQuantile = 1 - lowerQuantile;
  
  const lowerLife = eta * Math.pow(-Math.log(1 - lowerQuantile), 1 / beta);
  const upperLife = eta * Math.pow(-Math.log(1 - upperQuantile), 1 / beta);
  
  return {
    median: medianRUL,
    lower: Math.max(0, lowerLife - currentAge),
    upper: Math.max(0, upperLife - currentAge)
  };
}
