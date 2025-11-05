// Comprehensive type definitions for Process Capability & Performance analysis
// References: Montgomery, AIAG SPC Handbook, ISO 22514, NIST/SEMATECH

export type SpecificationLimits = {
  lsl?: number;
  usl?: number;
  target?: number;
  unit: string;
  engineeringUnits?: string;
  roundingPrecision?: number;
};

export type EstimatorSettings = {
  meanEstimator: "mean" | "median";
  sigmaEstimator: "classical" | "robust";
  withinEstimator: "rbar" | "sbar" | "pooled" | "mr";
  robustMAD: boolean;
};

export type DistributionType = 
  | "normal" 
  | "lognormal" 
  | "weibull-2p" 
  | "weibull-3p"
  | "gamma" 
  | "exponential" 
  | "logistic"
  | "loglogistic"
  | "johnson-su" 
  | "johnson-sb"
  | "johnson-sl"
  | "johnson-sn";

export type NonNormalSettings = {
  strategy: "auto" | "fit" | "transform" | "percentile";
  selectedDistribution?: DistributionType; // User override or auto-selected
  manualOverride: boolean; // True if user manually selected distribution
  transformationLambda?: number; // Box-Cox transformation parameter
  autoThresholds: {
    adPValue: number; // Minimum p-value for Anderson-Darling test (default: 0.05)
    preferJohnson: boolean; // Prefer Johnson when no fit passes
    minSampleSize: number; // Minimum N for reliable fitting (default: 30)
  };
  fallbackStrategy: "percentile" | "normal-anyway" | "fail"; // What to do if all fits fail
};

export type OutlierSettings = {
  method: "none" | "iqr" | "sigma" | "manual";
  params: { k?: number; sigma?: number };
  excludedIds: number[];
  previewCount?: number; // Number of points that would be excluded
};

export type RollingSettings = {
  windowSize: number;
  stepSize: number;
  minSamplesPerWindow: number;
};

export type AttributeSettings = {
  chartType: "p" | "np" | "c" | "u";
  // For p and np charts (proportion defective)
  sampleSize: number; // n (number of items inspected)
  defectives: number; // Number of defective items
  // For c and u charts (count of defects)
  inspectionUnits?: number; // Number of units inspected (for u chart)
  defects?: number; // Total number of defects found
  opportunities?: number; // Opportunities for defects per unit (for DPMO)
  // Control limits
  useStandardLimits: boolean; // Use 3-sigma or custom
  customLCL?: number;
  customUCL?: number;
};

export type I18nSettings = {
  locale: string; // e.g., "en-US", "de-DE", "zh-CN"
  decimalSeparator: "." | ",";
  thousandSeparator: "," | "." | " " | "none";
  dateFormat: string; // e.g., "MM/DD/YYYY", "DD.MM.YYYY"
  decimalPlaces: number; // Default precision for displaying numbers
};

export type A11ySettings = {
  colorBlindSafe: boolean; // Use colorblind-safe palette
  colorBlindType: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  highContrast: boolean; // High contrast mode
  reducedMotion: boolean; // Respect prefers-reduced-motion
  keyboardNavigationEnabled: boolean;
  screenReaderOptimized: boolean; // Add extra ARIA labels
  fontSize: "normal" | "large" | "x-large";
};

export type RBACSettings = {
  role: "viewer" | "engineer" | "statistician" | "admin";
  canEditSpecs: boolean;
  canEditOutliers: boolean;
  canEditEstimators: boolean;
  canEditNonNormal: boolean;
  canExport: boolean;
  canViewAudit: boolean;
  canApplyToOthers: boolean; // Can propagate settings
  requireJustification: boolean; // Require text justification for changes
};

export type SubgroupMode = "xbar-r" | "xbar-s" | "x-mr";

export type CapabilityConfig = {
  // Specification Limits
  specifications: SpecificationLimits;
  
  // Subgrouping and Estimation
  subgroupMode: SubgroupMode; // X̄-R, X̄-S, or X-MR (Individuals)
  subgroupSize: number; // For X̄-R and X̄-S
  individualsMRSpan: number; // For X-MR charts (typically 2 or 3)
  estimators: EstimatorSettings;
  
  // Non-Normal Analysis
  nonNormal: NonNormalSettings;
  
  // Outlier Handling
  outliers: OutlierSettings;
  
  // Confidence Intervals
  ciLevel: 0.9 | 0.95 | 0.99;
  ciMethod: "analytic" | "bootstrap-percentile" | "bootstrap-bca";
  bootstrapResamples: number;
  bootstrapSeed: number;
  
  // Stability & Phase Selection
  useStableWindow: boolean;
  phaseWindow?: { start: number; end: number }; // Baseline/phase selection
  
  // Rolling Capability
  rolling: RollingSettings;
  
  // Attribute Data
  attribute: AttributeSettings;
  
  // Internationalization
  i18n: I18nSettings;
  
  // Accessibility
  a11y: A11ySettings;
  
  // Role-Based Access Control
  rbac: RBACSettings;
  
  // Analysis Metadata
  analysisId?: string;
  analyst?: string;
  lastModified?: Date;
  sopReference?: string; // Link to SOP or procedure document
};

export type ConfidenceInterval = {
  lower: number;
  upper: number;
  level: number;
  method: "analytic" | "bootstrap-percentile" | "bootstrap-bca" | "exact";
};

export type CapabilityIndex = {
  name: string;
  value: number;
  ci?: ConfidenceInterval;
  basis: "short-term" | "long-term";
};

export type CapabilityIndices = {
  // Short-term (within-subgroup variation)
  cp?: CapabilityIndex;
  cpk?: CapabilityIndex;
  cpu?: CapabilityIndex;
  cpl?: CapabilityIndex;
  cpm?: CapabilityIndex; // When target exists
  zst?: CapabilityIndex; // Z short-term = 3 × Cpk
  
  // Long-term (overall variation)
  pp?: CapabilityIndex;
  ppk?: CapabilityIndex;
  ppu?: CapabilityIndex;
  ppl?: CapabilityIndex;
  zlt?: CapabilityIndex; // Z long-term = 3 × Ppk
};

export type TailMetrics = {
  pctBelowLSL?: number;
  pctAboveUSL?: number;
  ppmBelowLSL?: number;
  ppmAboveUSL?: number;
  ppmTotal?: number;
  yield?: number; // Percentage within specs
};

export type ProcessStatistics = {
  mean: number;
  median: number;
  stdDev: number;
  sigmaWithin: number;
  sigmaOverall: number;
  n: number;
  nSubgroups?: number;
  skewness?: number;
  kurtosis?: number;
};

export type GoodnessOfFitTest = {
  testName: string;
  statistic: number;
  pValue: number;
  criticalValue?: number;
  decision: "pass" | "fail";
};

export type DistributionFit = {
  distribution: string;
  parameters: Record<string, number>;
  parameterCIs?: Record<string, ConfidenceInterval>;
  gofTests: GoodnessOfFitTest[];
  aic: number;
  bic: number;
  selected: boolean;
  autoRationale?: string; // Why auto-selection chose this
};

export type StabilityCheck = {
  isStable: boolean;
  rulesViolated: string[];
  violationCount: number;
  message: string;
};

export type ValidationError = {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
  action?: string; // Recommended action
  sopLink?: string; // Link to relevant SOP or documentation
  code?: string; // Error code for tracking
};

export type SpecValidation = {
  isValid: boolean;
  isSingleSided: boolean;
  isUpperOnly: boolean;
  isLowerOnly: boolean;
  hasTarget: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
};

export type CapabilityResults = {
  indices: CapabilityIndices;
  tailMetrics: TailMetrics;
  processStats: ProcessStatistics;
  distributionFits?: DistributionFit[];
  stability?: StabilityCheck;
  validationErrors: ValidationError[];
  computeTime?: number;
  timestamp: Date;
};

export type AttributeResults = {
  chartType: "p" | "np" | "c" | "u";
  proportion?: number;
  rate?: number;
  yield: number;
  dpmo: number; // Defects per million opportunities
  zbench: number; // Benchmark Z-score
  ci: ConfidenceInterval;
  controlLimits: {
    lcl: number;
    centerLine: number;
    ucl: number;
  };
};

export type RollingCapabilityPoint = {
  windowStart: number;
  windowEnd: number;
  cpk?: number;
  ppk?: number;
  mean: number;
  sigmaWithin: number;
  sigmaOverall: number;
  isStable: boolean;
};

export type AuditEntry = {
  id: string;
  timestamp: Date;
  user: string;
  action: "config-change" | "outlier-change" | "spec-change" | "revert";
  description: string;
  before?: Partial<CapabilityConfig>;
  after?: Partial<CapabilityConfig>;
  affectedMetrics?: string[];
};

export type ExportFormat = "pdf" | "png" | "csv" | "json" | "excel";

export type ExportOptions = {
  format: ExportFormat;
  // Content selection
  includeCharts: boolean;
  chartSelection: string[]; // IDs of charts to include
  includeTables: boolean;
  tableSelection: string[]; // IDs of tables to include
  includeSettings: boolean;
  includeAudit: boolean;
  includeRawData: boolean;
  // Metadata
  includeTimestamp: boolean;
  includeAnalyst: boolean;
  includeSOPReference: boolean;
  // Formatting
  pageOrientation?: "portrait" | "landscape";
  pageSize?: "letter" | "a4" | "legal";
  includePageNumbers: boolean;
  includeWatermark: boolean;
  watermarkText?: string;
};

export type PolicyPropagationTarget = {
  site: string;
  line: string;
  product: string;
  feature: string;
};

export type PolicyPropagationSettings = {
  targets: PolicyPropagationTarget[];
  settingsToPropagate: {
    estimators: boolean;
    nonNormal: boolean;
    bootstrap: boolean;
    rolling: boolean;
    outliers: boolean;
    ciLevel: boolean;
    i18n: boolean;
    a11y: boolean;
  };
  overwriteExisting: boolean;
  requireApproval: boolean;
};
