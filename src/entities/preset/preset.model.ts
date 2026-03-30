import type { Phase, Preset, PresetCreateInput, PresetUpdateInput } from './preset.types';
import { validatePreset } from './validation';

/**
 * Generates a unique identifier for phases and presets
 * @returns A unique ID string
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a new breathing preset from input data
 * @param input - The input data for creating a preset
 * @returns A new Preset instance
 * @throws Error if validation fails
 */
export function createPreset(input: PresetCreateInput): Preset {
  const now = Date.now();

  // Generate IDs for phases that don't have one
  const phases: Phase[] = input.phases.map((phase) => ({
    id: generateId(),
    name: phase.name,
    duration: phase.duration,
    unit: phase.unit,
  }));

  const preset: Preset = {
    id: generateId(),
    name: input.name,
    description: input.description,
    phases,
    totalCycles: input.totalCycles,
    themeColor: input.themeColor,
    createdAt: now,
    updatedAt: now,
  };

  // Validate before returning
  const validation = validatePreset(preset);
  if (!validation.valid) {
    throw new Error(
      `Invalid preset: ${validation.errors.map((e) => e.message).join(', ')}`
    );
  }

  return preset;
}

/**
 * Updates an existing preset with new data
 * @param preset - The preset to update
 * @param input - The update data
 * @returns The updated preset
 * @throws Error if validation fails
 */
export function updatePreset(
  preset: Preset,
  input: PresetUpdateInput
): Preset {
  const updated: Preset = {
    ...preset,
    name: input.name ?? preset.name,
    description: input.description !== undefined ? input.description : preset.description,
    phases: input.phases ?? preset.phases,
    totalCycles: input.totalCycles !== undefined ? input.totalCycles : preset.totalCycles,
    themeColor: input.themeColor !== undefined ? input.themeColor : preset.themeColor,
    updatedAt: Date.now(),
  };

  // Validate before returning
  const validation = validatePreset(updated);
  if (!validation.valid) {
    throw new Error(
      `Invalid preset: ${validation.errors.map((e) => e.message).join(', ')}`
    );
  }

  return updated;
}

/**
 * Clones a preset with a new ID (useful for duplicating presets)
 * @param preset - The preset to clone
 * @returns A new preset with a unique ID
 */
export function clonePreset(preset: Preset): Preset {
  return {
    ...preset,
    id: generateId(),
    phases: preset.phases.map((phase) => ({
      ...phase,
      id: generateId(),
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
