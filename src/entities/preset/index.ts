export type {
  TimeUnit,
  Phase,
  Preset,
  PresetCreateInput,
  PresetUpdateInput,
} from './preset.types';
export {
  DEFAULT_PRESET,
  BOX_BREATHING_PRESET,
  COHERENT_BREATHING_PRESET,
  BUILT_IN_PRESETS,
} from './preset.constants';
export {
  generateId,
  createPreset,
  updatePreset,
  clonePreset,
} from './preset.model';
export {
  validatePhase,
  validatePreset,
  validateUniquePresetIds,
  createValidationError,
  combineValidationResults,
} from './validation';
export type { ValidationError, ValidationResult } from './validation';
