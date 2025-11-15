/**
 * Validation utilities for Quality Control / Sampling Plan parameters
 * Ensures scientific and methodological correctness per industry standards
 * (IATF 16949, ISO 9001, ANSI/ASQ Z1.4)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate sample size
 * Must be positive integer, typically ≤ lot size
 */
export function validateSampleSize(value: string, lotSize?: number): ValidationResult {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Sample size must be a valid number' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Sample size must be greater than 0' };
  }
  
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Sample size must be a whole number' };
  }
  
  if (lotSize && num > lotSize) {
    return { isValid: false, error: `Sample size cannot exceed lot size (${lotSize})` };
  }
  
  return { isValid: true };
}

/**
 * Validate acceptance number (Ac)
 * Must be non-negative integer
 */
export function validateAcceptanceNumber(value: string): ValidationResult {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Acceptance number must be a valid number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'Acceptance number must be ≥ 0' };
  }
  
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Acceptance number must be a whole number' };
  }
  
  return { isValid: true };
}

/**
 * Validate rejection number (Re)
 * Must be positive integer, typically Ac + 1
 */
export function validateRejectionNumber(value: string, acceptNumber?: number): ValidationResult {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Rejection number must be a valid number' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Rejection number must be > 0' };
  }
  
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Rejection number must be a whole number' };
  }
  
  if (acceptNumber !== undefined && num <= acceptNumber) {
    return { 
      isValid: false, 
      error: `Rejection number must be greater than acceptance number (${acceptNumber})` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate AQL (Acceptable Quality Level)
 * Typically expressed as percentage (0-100%) or decimal (0-1)
 */
export function validateAQL(value: string): ValidationResult {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'AQL must be a valid number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'AQL must be ≥ 0' };
  }
  
  if (num > 100) {
    return { isValid: false, error: 'AQL cannot exceed 100%' };
  }
  
  return { isValid: true };
}

/**
 * Validate lot size range
 * Format: "min-max" where min < max
 */
export function validateLotSizeRange(value: string): ValidationResult {
  const rangePattern = /^(\d+)-(\d+)$/;
  const match = value.match(rangePattern);
  
  if (!match) {
    return { 
      isValid: false, 
      error: 'Lot size range must be in format "min-max" (e.g., "281-500")' 
    };
  }
  
  const min = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  
  if (min >= max) {
    return { 
      isValid: false, 
      error: 'Minimum lot size must be less than maximum' 
    };
  }
  
  if (min <= 0) {
    return { isValid: false, error: 'Lot size must be greater than 0' };
  }
  
  return { isValid: true };
}

/**
 * Validate process capability index (Cp, Cpk)
 * Typically ≥ 1.0 for adequate process, ≥ 1.33 for capable, ≥ 1.67 for highly capable
 */
export function validateCpk(value: string): ValidationResult {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Cpk must be a valid number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'Cpk must be ≥ 0' };
  }
  
  if (num > 5) {
    return { isValid: false, error: 'Cpk value exceeds typical range (0-5). Please verify.' };
  }
  
  return { isValid: true };
}

/**
 * Validate non-conformance rate
 * Percentage value (0-100%)
 */
export function validateNonConformanceRate(value: string): ValidationResult {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Non-conformance rate must be a valid number' };
  }
  
  if (num < 0) {
    return { isValid: false, error: 'Non-conformance rate must be ≥ 0%' };
  }
  
  if (num > 100) {
    return { isValid: false, error: 'Non-conformance rate cannot exceed 100%' };
  }
  
  return { isValid: true };
}

/**
 * Validate duration (in days)
 */
export function validateDuration(value: string): ValidationResult {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Duration must be a valid number' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Duration must be greater than 0 days' };
  }
  
  if (num > 3650) {
    return { isValid: false, error: 'Duration exceeds maximum (10 years)' };
  }
  
  return { isValid: true };
}
