// Specification validation utilities
// References: AIAG SPC Handbook, ISO 22514, Montgomery

import { CapabilityConfig, ValidationError, SpecValidation } from "./capability-types";

/**
 * Validate specification limits and return detailed validation results
 * Reference: AIAG SPC Handbook Ch. 2, ISO 22514-2
 */
export function validateSpecifications(config: CapabilityConfig): SpecValidation {
  const { lsl, usl, target } = config.specifications;
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Determine spec configuration
  const isSingleSided = (lsl === undefined) !== (usl === undefined);
  const isUpperOnly = lsl === undefined && usl !== undefined;
  const isLowerOnly = lsl !== undefined && usl === undefined;
  const hasTarget = target !== undefined;
  
  // Critical errors
  if (lsl !== undefined && usl !== undefined && lsl >= usl) {
    errors.push({
      field: "specifications",
      message: "Lower Spec Limit must be less than Upper Spec Limit (LSL < USL)",
      severity: "error",
      action: "Adjust LSL to be less than USL, or USL to be greater than LSL",
      sopLink: "/docs/spc-spec-limits",
      code: "SPEC_001"
    });
  }
  
  if (lsl !== undefined && usl !== undefined && target !== undefined) {
    if (target <= lsl) {
      errors.push({
        field: "specifications.target",
        message: "Target must be greater than LSL",
        severity: "error",
        action: "Set Target between LSL and USL (LSL < Target < USL)",
        code: "SPEC_002"
      });
    }
    if (target >= usl) {
      errors.push({
        field: "specifications.target",
        message: "Target must be less than USL",
        severity: "error",
        action: "Set Target between LSL and USL (LSL < Target < USL)",
        code: "SPEC_003"
      });
    }
  }
  
  // No specs at all
  if (lsl === undefined && usl === undefined) {
    warnings.push({
      field: "specifications",
      message: "No specification limits defined",
      severity: "warning",
      action: "Capability indices (Cp, Cpk, Pp, Ppk) cannot be computed. Only performance statistics will be shown.",
      code: "SPEC_004"
    });
  }
  
  // Single-sided warnings
  if (isSingleSided && target !== undefined) {
    warnings.push({
      field: "specifications.target",
      message: "Cpm requires both LSL and USL",
      severity: "info",
      action: "Cpm (Taguchi index) will not be computed for one-sided specifications. Only Cp/Cpk or Pp/Ppk will be shown.",
      code: "SPEC_005"
    });
  }
  
  // Target without specs warning
  if (target !== undefined && lsl === undefined && usl === undefined) {
    warnings.push({
      field: "specifications.target",
      message: "Target specified but no spec limits defined",
      severity: "warning",
      action: "Define LSL and/or USL to enable capability analysis",
      code: "SPEC_006"
    });
  }
  
  // Very narrow tolerance warning
  if (lsl !== undefined && usl !== undefined) {
    const tolerance = usl - lsl;
    if (tolerance < 0.001) {
      warnings.push({
        field: "specifications",
        message: "Very narrow specification tolerance",
        severity: "warning",
        action: "Ensure spec limits are entered in correct units. Very tight tolerances may require high-precision measurement systems.",
        code: "SPEC_007"
      });
    }
  }
  
  // Target centering info
  if (lsl !== undefined && usl !== undefined && target !== undefined) {
    const midpoint = (lsl + usl) / 2;
    const offset = Math.abs(target - midpoint);
    const tolerance = usl - lsl;
    if (offset / tolerance > 0.1) {
      warnings.push({
        field: "specifications.target",
        message: `Target is ${(offset / tolerance * 100).toFixed(1)}% off-center`,
        severity: "info",
        action: "Off-center targets increase Cpm penalty. Consider if this is intentional per design requirements.",
        code: "SPEC_008"
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    isSingleSided,
    isUpperOnly,
    isLowerOnly,
    hasTarget,
    errors,
    warnings
  };
}

/**
 * Validate sample size and return warnings/errors
 * Reference: AIAG SPC Handbook, NIST/SEMATECH
 */
export function validateSampleSize(n: number, subgroupSize: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (n < 1) {
    errors.push({
      field: "sampleSize",
      message: "No data available",
      severity: "error",
      action: "Load data to perform capability analysis",
      code: "DATA_001"
    });
    return errors;
  }
  
  if (n < 25) {
    errors.push({
      field: "sampleSize",
      message: `Sample size (n=${n}) is very small`,
      severity: "error",
      action: "Minimum n ≥ 25 recommended for reliable estimates. Confidence intervals will be very wide.",
      sopLink: "/docs/sample-size-requirements",
      code: "DATA_002"
    });
  } else if (n < 50) {
    errors.push({
      field: "sampleSize",
      message: `Sample size (n=${n}) is small`,
      severity: "warning",
      action: "n ≥ 50 recommended. Current sample size may yield wide confidence intervals.",
      code: "DATA_003"
    });
  } else if (n < 100) {
    errors.push({
      field: "sampleSize",
      message: `For highly reliable indices, n ≥ 100 recommended (current: ${n})`,
      severity: "info",
      code: "DATA_004"
    });
  }
  
  const nSubgroups = Math.floor(n / subgroupSize);
  if (nSubgroups < 5) {
    errors.push({
      field: "subgroupSize",
      message: `Only ${nSubgroups} subgroups with size ${subgroupSize}`,
      severity: "warning",
      action: "Minimum 20-25 subgroups recommended for control charts. Consider reducing subgroup size.",
      code: "DATA_005"
    });
  }
  
  return errors;
}

/**
 * Validate subgroup configuration
 * Reference: Montgomery Ch. 6, AIAG
 */
export function validateSubgroupConfig(config: CapabilityConfig, n: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const { subgroupMode, subgroupSize, individualsMRSpan, estimators } = config;
  
  if (subgroupMode === "x-mr") {
    if (individualsMRSpan < 2 || individualsMRSpan > 5) {
      errors.push({
        field: "individualsMRSpan",
        message: `MR span of ${individualsMRSpan} is unusual`,
        severity: "warning",
        action: "Typical MR span is 2 or 3. Higher spans reduce sensitivity to shifts.",
        code: "SUBG_001"
      });
    }
  } else {
    if (subgroupSize < 2) {
      errors.push({
        field: "subgroupSize",
        message: "Subgroup size must be at least 2",
        severity: "error",
        action: "Use Individuals (X-MR) mode for single observations",
        code: "SUBG_002"
      });
    }
    
    if (subgroupSize < 4 && estimators.withinEstimator === "rbar") {
      errors.push({
        field: "subgroupSize",
        message: `Subgroup size ${subgroupSize} is small for R̄/d₂ estimator`,
        severity: "info",
        action: "Consider using S̄/c₄ estimator for subgroup size < 4",
        code: "SUBG_003"
      });
    }
    
    if (subgroupSize > 10 && estimators.withinEstimator === "rbar") {
      errors.push({
        field: "estimators.withinEstimator",
        message: `R̄/d₂ not recommended for subgroup size > 10`,
        severity: "warning",
        action: "Use S̄/c₄ or pooled estimator for large subgroups",
        code: "SUBG_004"
      });
    }
  }
  
  return errors;
}

/**
 * Validate bootstrap settings
 */
export function validateBootstrap(config: CapabilityConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (config.bootstrapResamples < 500) {
    errors.push({
      field: "bootstrapResamples",
      message: `Only ${config.bootstrapResamples} bootstrap resamples`,
      severity: "warning",
      action: "Minimum 1000 resamples recommended for stable CIs. Increase to ≥1000.",
      code: "BOOT_001"
    });
  }
  
  if (config.bootstrapResamples > 10000) {
    errors.push({
      field: "bootstrapResamples",
      message: `${config.bootstrapResamples} resamples may be slow`,
      severity: "info",
      action: "Consider reducing to 5000 unless very high precision is needed",
      code: "BOOT_002"
    });
  }
  
  return errors;
}

/**
 * Validate non-normal settings
 */
export function validateNonNormal(config: CapabilityConfig, n: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const { autoThresholds } = config.nonNormal;
  
  if (n < autoThresholds.minSampleSize) {
    errors.push({
      field: "nonNormal",
      message: `Sample size (${n}) below minimum for reliable distribution fitting (${autoThresholds.minSampleSize})`,
      severity: "warning",
      action: "Distribution fitting may be unreliable. Use normal assumption or percentile method instead.",
      code: "NONNORM_001"
    });
  }
  
  return errors;
}

/**
 * Master validation function - runs all checks
 */
export function validateConfiguration(config: CapabilityConfig, n: number): ValidationError[] {
  const allErrors: ValidationError[] = [];
  
  // Spec validation
  const specValidation = validateSpecifications(config);
  allErrors.push(...specValidation.errors, ...specValidation.warnings);
  
  // Sample size validation
  allErrors.push(...validateSampleSize(n, config.subgroupSize));
  
  // Subgroup validation
  allErrors.push(...validateSubgroupConfig(config, n));
  
  // Bootstrap validation
  allErrors.push(...validateBootstrap(config));
  
  // Non-normal validation
  allErrors.push(...validateNonNormal(config, n));
  
  return allErrors;
}
