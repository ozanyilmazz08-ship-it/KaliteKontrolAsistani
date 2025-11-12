// Export utilities for AI Report generation
// Supports JSON (reproducibility), CSV (risk data), and metadata for PDF generation

export interface AIReportConfig {
  // Context
  site: string;
  line: string;
  product: string;
  feature: string;
  shift: string;
  dateRange: { start: string; end: string };
  horizonHours: number;
  
  // Model configuration
  modelType: string;
  modelVersion: string;
  lastTrained: string;
  trainingWindow: number;
  
  // Uncertainty settings
  predictionInterval: number; // e.g., 95
  uncertaintyMethod: string; // e.g., "Conformal Prediction + Quantile Regression"
  
  // Anomaly detection settings
  ewmaLambda: number;
  cusumK: number;
  cusumH: number;
  isolationForestContamination: number;
  
  // Drift settings
  psiThresholds: { small: number; moderate: number; large: number };
  ksSignificance: number;
  
  // Governance
  user: string;
  timestamp: string;
  approvals: { action: string; approver: string; timestamp: string }[];
}

export interface AIReportData {
  config: AIReportConfig;
  
  // Risk metrics
  riskMetrics: {
    probabilityLSL: number;
    probabilityUSL: number;
    expectedPPM: number;
    forecastedYield: number;
    zRisk: number;
    projectedCpk?: number;
  };
  
  // Forecast summary
  forecast: {
    horizon: number;
    predictedMean: number;
    predictedSigma: number;
    piLevel: number;
    lowerBound: number;
    upperBound: number;
  };
  
  // Model performance
  performance: {
    rmse: number;
    mae: number;
    mape: number;
    smape: number;
    mase: number;
    calibrationScore: number;
    empiricalCoverage: number;
  };
  
  // Drift and quality
  drift: {
    psi: number;
    ksStatistic: number;
    conceptDrift: number;
    dataQualityScore: number;
  };
  
  // Anomalies
  anomalies: {
    count: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    detectionMethods: string[];
  };
  
  // Explainability
  topDrivers: {
    feature: string;
    contribution: number;
    value: string;
  }[];
}

/**
 * Generate JSON export for full reproducibility
 * Following spec requirement: "Exports include JSON of settings"
 */
export function exportAsJSON(report: AIReportData): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(report: AIReportData, filename: string = 'ai-report.json'): void {
  const jsonStr = exportAsJSON(report);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV export for risk by horizon
 * Columns: Timestamp, Horizon, Median, Lower95, Upper95, ProbOutOfSpec, PPM
 */
export function exportRiskCSV(
  forecastData: Array<{
    timestamp: Date;
    median: number;
    lower95: number;
    upper95: number;
  }>,
  riskByHorizon: Array<{ ppm: number; probOut: number }>,
  LSL: number,
  USL: number
): string {
  const headers = [
    'Timestamp',
    'Horizon_Hours',
    'Predicted_Median',
    'Lower_95_PI',
    'Upper_95_PI',
    'LSL',
    'USL',
    'Prob_Out_Of_Spec',
    'Expected_PPM'
  ];
  
  const rows = forecastData.map((point, idx) => [
    point.timestamp.toISOString(),
    (idx + 1).toString(),
    point.median.toFixed(4),
    point.lower95.toFixed(4),
    point.upper95.toFixed(4),
    LSL.toString(),
    USL.toString(),
    riskByHorizon[idx]?.probOut.toFixed(6) || '0',
    riskByHorizon[idx]?.ppm.toFixed(2) || '0'
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'risk-forecast.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Generate audit log entry
 * Following spec: "Audit AI Actions with who/when/what/model version"
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  modelVersion: string;
  settings: Record<string, any>;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  approved: boolean;
  approver?: string;
  approvalTimestamp?: string;
}

export function createAuditEntry(
  user: string,
  action: string,
  modelVersion: string,
  settings: Record<string, any>,
  beforeState?: Record<string, any>,
  afterState?: Record<string, any>
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    modelVersion,
    settings,
    beforeState,
    afterState,
    approved: false
  };
}

/**
 * Export audit log as JSON
 */
export function exportAuditLog(entries: AuditLogEntry[]): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      entryCount: entries.length,
      entries
    },
    null,
    2
  );
}

/**
 * Generate PDF-ready summary (returns structured data for PDF library)
 */
export function generatePDFSummary(report: AIReportData): {
  title: string;
  sections: Array<{ heading: string; content: string | Array<[string, string]> }>;
} {
  return {
    title: 'Predictive Analytics & AI Insights Report',
    sections: [
      {
        heading: 'Executive Summary',
        content: `Forecast horizon: ${report.forecast.horizon}h | Expected PPM: ${report.riskMetrics.expectedPPM.toFixed(0)} | Forecasted Yield: ${report.riskMetrics.forecastedYield.toFixed(2)}%`
      },
      {
        heading: 'Context',
        content: [
          ['Site', report.config.site],
          ['Line', report.config.line],
          ['Product', report.config.product],
          ['Feature', report.config.feature],
          ['Shift', report.config.shift]
        ]
      },
      {
        heading: 'Risk Metrics',
        content: [
          ['Expected PPM', report.riskMetrics.expectedPPM.toFixed(2)],
          ['Forecasted Yield', `${report.riskMetrics.forecastedYield.toFixed(2)}%`],
          ['P(Below LSL)', `${(report.riskMetrics.probabilityLSL * 100).toFixed(4)}%`],
          ['P(Above USL)', `${(report.riskMetrics.probabilityUSL * 100).toFixed(4)}%`],
          ['Z-Risk', report.riskMetrics.zRisk.toFixed(3)],
          ['Projected Cpk', report.riskMetrics.projectedCpk?.toFixed(3) || 'N/A']
        ]
      },
      {
        heading: 'Model Information',
        content: [
          ['Model Type', report.config.modelType],
          ['Version', report.config.modelVersion],
          ['Last Trained', report.config.lastTrained],
          ['RMSE', report.performance.rmse.toFixed(4)],
          ['MAPE', `${report.performance.mape.toFixed(2)}%`],
          ['Calibration Score', report.performance.calibrationScore.toFixed(3)]
        ]
      },
      {
        heading: 'Data Quality & Drift',
        content: [
          ['PSI', report.drift.psi.toFixed(4)],
          ['KS Statistic', report.drift.ksStatistic.toFixed(4)],
          ['Data Quality Score', `${(report.drift.dataQualityScore * 100).toFixed(1)}%`],
          ['Anomalies Detected', report.anomalies.count.toString()]
        ]
      },
      {
        heading: 'Top Drivers (SHAP)',
        content: report.topDrivers.slice(0, 5).map(d => 
          [d.feature, `${d.contribution > 0 ? '+' : ''}${d.contribution.toFixed(3)} (${d.value})`]
        )
      },
      {
        heading: 'Governance',
        content: [
          ['Generated By', report.config.user],
          ['Timestamp', report.config.timestamp],
          ['Approvals', report.config.approvals.length.toString()]
        ]
      }
    ]
  };
}
