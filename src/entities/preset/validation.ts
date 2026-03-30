import type { Phase, Preset } from './preset.types';

/**
 * Validation error details
 */
export interface ValidationError {
  /** Path to the invalid field */
  path: string;
  /** Error message describing what's wrong */
  message: string;
  /** The invalid value */
  value: unknown;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Valid time units for phase duration
 */
const VALID_TIME_UNITS = ['seconds', 'minutes'];

/**
 * Checks if a value is in the valid time units array
 */
function isValidUnit(unit: string): boolean {
  return VALID_TIME_UNITS.indexOf(unit) !== -1;
}

/**
 * Validates a single breathing phase
 * Validation rules:
 * - duration >= 0
 * - name not empty
 * - unit is 'seconds' or 'minutes'
 *
 * @param phase - The phase to validate
 * @returns ValidationResult with any errors found
 */
export function validatePhase(phase: Phase): ValidationResult {
  const errors: ValidationError[] = [];

  // Check id exists
  if (!phase.id || typeof phase.id !== 'string' || phase.id.trim() === '') {
    errors.push({
      path: 'phase.id',
      message: 'Phase ID cannot be empty',
      value: phase.id,
    });
  }

  // Check name is not empty
  if (!phase.name || typeof phase.name !== 'string' || phase.name.trim() === '') {
    errors.push({
      path: 'phase.name',
      message: 'Phase name cannot be empty',
      value: phase.name,
    });
  }

  // Check duration is non-negative
  if (typeof phase.duration !== 'number' || phase.duration < 0) {
    errors.push({
      path: 'phase.duration',
      message: 'Phase duration must be a non-negative number',
      value: phase.duration,
    });
  }

  // Check unit is valid
  if (!phase.unit || !isValidUnit(phase.unit)) {
    errors.push({
      path: 'phase.unit',
      message: `Phase unit must be one of: ${VALID_TIME_UNITS.join(', ')}`,
      value: phase.unit,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete breathing preset
 * Validation rules:
 * - at least 1 phase
 * - name not empty
 * - totalCycles >= 1 or undefined (infinite)
 * - All IDs must be unique
 *
 * @param preset - The preset to validate
 * @returns ValidationResult with any errors found
 */
export function validatePreset(preset: Preset): ValidationResult {
  const errors: ValidationError[] = [];

  // Check id is not empty
  if (!preset.id || typeof preset.id !== 'string' || preset.id.trim() === '') {
    errors.push({
      path: 'preset.id',
      message: 'Preset ID cannot be empty',
      value: preset.id,
    });
  }

  // Check name is not empty
  if (!preset.name || typeof preset.name !== 'string' || preset.name.trim() === '') {
    errors.push({
      path: 'preset.name',
      message: 'Preset name cannot be empty',
      value: preset.name,
    });
  }

  // Check phases array exists and has at least one phase
  if (!Array.isArray(preset.phases) || preset.phases.length === 0) {
    errors.push({
      path: 'preset.phases',
      message: 'Preset must have at least one phase',
      value: preset.phases,
    });
  } else {
    // Validate each phase
    preset.phases.forEach((phase, index) => {
      const phaseResult = validatePhase(phase);
      if (!phaseResult.valid) {
        phaseResult.errors.forEach((error) => {
          errors.push({
            ...error,
            path: `preset.phases[${index}].${error.path.replace('phase.', '')}`,
          });
        });
      }
    });

    // Check for duplicate phase IDs (all IDs must be unique)
    const phaseIds = preset.phases.map(function (p) { return p.id; }).filter(Boolean);
    var hasDuplicates = false;
    for (var i = 0; i < phaseIds.length; i++) {
      if (phaseIds.indexOf(phaseIds[i], i + 1) !== -1) {
        hasDuplicates = true;
        break;
      }
    }
    if (hasDuplicates) {
      errors.push({
        path: 'preset.phases',
        message: 'All phase IDs must be unique within a preset',
        value: 'duplicate IDs found',
      });
    }
  }

  // Check totalCycles is undefined (infinite) or a positive number >= 1
  if (preset.totalCycles !== undefined) {
    if (typeof preset.totalCycles !== 'number' || preset.totalCycles < 1) {
      errors.push({
        path: 'preset.totalCycles',
        message: 'totalCycles must be undefined (infinite) or a number >= 1',
        value: preset.totalCycles,
      });
    }
  }

  // Check timestamps are valid numbers
  if (typeof preset.createdAt !== 'number' || preset.createdAt < 0) {
    errors.push({
      path: 'preset.createdAt',
      message: 'createdAt must be a valid timestamp',
      value: preset.createdAt,
    });
  }

  if (typeof preset.updatedAt !== 'number' || preset.updatedAt < 0) {
    errors.push({
      path: 'preset.updatedAt',
      message: 'updatedAt must be a valid timestamp',
      value: preset.updatedAt,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all IDs in an array of presets are unique
 * @param presets - Array of presets to check
 * @returns ValidationResult with any errors found
 */
export function validateUniquePresetIds(presets: Preset[]): ValidationResult {
  const errors: ValidationError[] = [];
  const ids = presets.map(function (p) { return p.id; });

  // Check for duplicates
  var hasDuplicates = false;
  var duplicateIds: string[] = [];
  for (var i = 0; i < ids.length; i++) {
    if (ids.indexOf(ids[i], i + 1) !== -1 && duplicateIds.indexOf(ids[i]) === -1) {
      hasDuplicates = true;
      duplicateIds.push(ids[i]);
    }
  }

  if (hasDuplicates) {
    errors.push({
      path: 'presets',
      message: 'Duplicate preset IDs found: ' + duplicateIds.join(', '),
      value: duplicateIds,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a validation error with the given details
 * @param path - Path to the invalid field
 * @param message - Error message
 * @param value - The invalid value
 * @returns A ValidationError object
 */
export function createValidationError(
  path: string,
  message: string,
  value: unknown
): ValidationError {
  return { path, message, value };
}

/**
 * Combines multiple validation results into one
 * @param results - Validation results to combine
 * @returns Combined ValidationResult
 */
export function combineValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  var allErrors: ValidationError[] = [];
  for (var i = 0; i < results.length; i++) {
    for (var j = 0; j < results[i].errors.length; j++) {
      allErrors.push(results[i].errors[j]);
    }
  }
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
