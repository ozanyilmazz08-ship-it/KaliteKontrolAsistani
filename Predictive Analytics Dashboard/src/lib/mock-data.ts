// Mock data generator for Predictive Analytics dashboard
import { 
  calculateSpecRisk, 
  calculateProjectedCpk, 
  calculatePSI,
  calculateKS,
  calculateEWMA,
  calculateCUSUM,
  calculateAccuracyMetrics,
  calculateRUL,
  type SpecRisk
} from './statistical-methods';

export interface DataPoint {
  timestamp: Date;
  value: number;
  isAnomaly?: boolean;
  anomalySeverity?: 'low' | 'medium' | 'high';
  anomalyReason?: string;
}

export interface ForecastPoint {
  timestamp: Date;
  median: number;
  lower80: number;
  upper80: number;
  lower95: number;
  upper95: number;
}

export interface SpecLimits {
  LSL: number;
  Target: number;
  USL: number;
}

export interface ShapValue {
  feature: string;
  contribution: number;
  value: string;
}

export interface AnomalyDetail {
  timestamp: Date;
  value: number;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  zScore: number;
  reconstructionError?: number;
  rules: string[];
}

// Generate historical time series data
export function generateHistoricalData(points: number = 200): DataPoint[] {
  const data: DataPoint[] = [];
  const baseValue = 50;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000); // hourly data
    const trend = -0.01 * (points - i);
    const seasonal = 2 * Math.sin((2 * Math.PI * i) / 24);
    const noise = (Math.random() - 0.5) * 1.5;
    
    // Add occasional anomalies
    const isAnomaly = Math.random() > 0.95;
    const anomalyMagnitude = isAnomaly ? (Math.random() - 0.5) * 8 : 0;
    
    const value = baseValue + trend + seasonal + noise + anomalyMagnitude;
    
    data.push({
      timestamp,
      value,
      isAnomaly,
      anomalySeverity: isAnomaly 
        ? (Math.abs(anomalyMagnitude) > 5 ? 'high' : Math.abs(anomalyMagnitude) > 3 ? 'medium' : 'low')
        : undefined,
      anomalyReason: isAnomaly ? ['Spike detected', 'Variance jump', 'Drift pattern'][Math.floor(Math.random() * 3)] : undefined
    });
  }
  
  return data;
}

// Generate forecast data
export function generateForecast(horizon: number = 24): ForecastPoint[] {
  const forecast: ForecastPoint[] = [];
  const now = new Date();
  const lastValue = 48;
  
  for (let i = 1; i <= horizon; i++) {
    const timestamp = new Date(now.getTime() + i * 3600000);
    const trend = -0.02 * i;
    const seasonal = 2 * Math.sin((2 * Math.PI * i) / 24);
    const median = lastValue + trend + seasonal;
    
    const uncertainty = 0.5 + 0.05 * i; // Increasing uncertainty
    
    forecast.push({
      timestamp,
      median,
      lower80: median - 1.28 * uncertainty,
      upper80: median + 1.28 * uncertainty,
      lower95: median - 1.96 * uncertainty,
      upper95: median + 1.96 * uncertainty
    });
  }
  
  return forecast;
}

export const specLimits: SpecLimits = {
  LSL: 45,
  Target: 50,
  USL: 55
};

// SHAP values for explainability
export function generateShapValues(): ShapValue[] {
  return [
    { feature: 'Temperature (°C)', contribution: -0.42, value: '72.3' },
    { feature: 'Raw Material Batch', contribution: 0.28, value: 'B-2847' },
    { feature: 'Machine Speed (RPM)', contribution: -0.21, value: '1850' },
    { feature: 'Humidity (%)', contribution: 0.15, value: '48.2' },
    { feature: 'Shift', contribution: -0.12, value: 'Night' },
    { feature: 'Tool Age (hours)', contribution: 0.18, value: '347' },
    { feature: 'Operator Experience', contribution: -0.08, value: 'Mid' },
    { feature: 'Coolant Temp (°C)', contribution: 0.11, value: '22.1' }
  ];
}

// Anomaly details
export function getAnomalyDetails(historicalData: DataPoint[]): AnomalyDetail[] {
  return historicalData
    .filter(d => d.isAnomaly)
    .map(d => ({
      timestamp: d.timestamp,
      value: d.value,
      severity: d.anomalySeverity!,
      reason: d.anomalyReason!,
      zScore: 2.5 + Math.random() * 2,
      reconstructionError: 0.15 + Math.random() * 0.3,
      rules: ['Western Electric Rule 1', 'CUSUM breach'][Math.floor(Math.random() * 2)] === 'Western Electric Rule 1' 
        ? ['Western Electric Rule 1'] 
        : ['CUSUM breach', 'Isolation Forest anomaly score > 0.7']
    }));
}

// Drift metrics
export interface DriftMetrics {
  psi: number;
  ksStatistic: number;
  conceptDrift: number;
  dataQualityScore: number;
}

export function generateDriftMetrics(): DriftMetrics {
  return {
    psi: 0.08 + Math.random() * 0.15, // 0.08-0.23
    ksStatistic: 0.05 + Math.random() * 0.1,
    conceptDrift: Math.random() * 0.2,
    dataQualityScore: 0.92 + Math.random() * 0.07
  };
}

// Risk calculation
export interface RiskMetrics {
  probabilityLSL: number;
  probabilityUSL: number;
  expectedPPM: number;
  forecastedYield: number;
  zRisk: number;
  projectedCpk?: number;
}

export function calculateRisk(forecast: ForecastPoint[], specs: SpecLimits): RiskMetrics {
  // Calculate average predicted values across horizon
  const avgMedian = forecast.reduce((sum, f) => sum + f.median, 0) / forecast.length;
  const avgUpper95 = forecast.reduce((sum, f) => sum + f.upper95, 0) / forecast.length;
  const sigma = (avgUpper95 - avgMedian) / 1.96;
  
  // Use proper statistical method for risk calculation
  const risk = calculateSpecRisk(avgMedian, sigma, specs.LSL, specs.USL);
  
  // Calculate projected Cpk (informational, using estimated within-subgroup sigma)
  const sigmaWithin = sigma * 0.85; // Approximate short-term sigma
  const projectedCpk = calculateProjectedCpk(avgMedian, sigmaWithin, specs.LSL, specs.USL);
  
  return {
    probabilityLSL: risk.probBelowLSL,
    probabilityUSL: risk.probAboveUSL,
    expectedPPM: risk.ppm,
    forecastedYield: risk.forecastedYield,
    zRisk: Math.min(risk.zLSL, risk.zUSL),
    projectedCpk
  };
}