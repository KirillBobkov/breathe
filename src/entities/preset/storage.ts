/**
 * Preset storage module
 * Handles persistence of presets to localStorage with validation
 */

import type { Preset } from './preset.types';
import { validatePresetArray } from './preset.schema';
import { appStorage, StorageValidationError } from '../../shared/storage';
import { DEFAULT_PRESET, DEFAULT_PRESET_ID } from './preset.constants';

/**
 * Storage key for all presets (including default)
 */
const PRESETS_KEY = 'presets';

/**
 * Storage schema version for future migrations
 */
const STORAGE_VERSION = 'v1';

/**
 * Storage metadata key for version tracking
 */
const PRESET_METADATA_KEY = 'preset-metadata';

/**
 * Check if a preset is the default preset (cannot be deleted)
 */
export function isDefaultPreset(presetId: string): boolean {
  return presetId === DEFAULT_PRESET_ID;
}

/**
 * Load presets from localStorage
 * Falls back to default preset if storage is empty or invalid
 * @returns Array of presets from localStorage
 */
export function loadPresets(): Preset[] {
  try {
    // Load and verify storage metadata
    const metadata = appStorage.get<{ version: string }>(PRESET_METADATA_KEY);
    if (metadata?.version !== STORAGE_VERSION) {
      // Version mismatch or no metadata - clear and reinitialize
      clearPresetStorage();
      return [DEFAULT_PRESET];
    }

    // Load presets from storage
    const stored = appStorage.get<Preset[]>(PRESETS_KEY);

    if (!stored) {
      // No presets found, return default
      return [DEFAULT_PRESET];
    }

    // Validate the stored data
    const validation = validatePresetArray(stored);

    if (!validation.success) {
      console.error('Invalid preset data in storage:', validation.error);
      // Clear invalid data and return default
      clearPresetStorage();
      return [DEFAULT_PRESET];
    }

    return validation.data;
  } catch (error) {
    console.error('Failed to load presets from storage:', error);
    // On error, return default preset as fallback
    return [DEFAULT_PRESET];
  }
}

/**
 * Save all presets to localStorage
 * @param presets - All current presets to save
 */
export function savePresets(presets: Preset[]): void {
  try {
    // Validate before saving
    const validation = validatePresetArray(presets);
    if (validation.success === false) {
      throw new StorageValidationError('Invalid preset data', validation.issues);
    }

    // Save all presets
    appStorage.set(PRESETS_KEY, presets);

    // Update metadata
    appStorage.set(PRESET_METADATA_KEY, { version: STORAGE_VERSION });
  } catch (error) {
    console.error('[savePresets] Failed to save presets to storage:', error);
    throw error;
  }
}

/**
 * Add a new preset to storage
 * @param preset - The preset to add
 */
export function addPreset(preset: Preset): void {
  try {
    const currentPresets = loadPresets();
    const updatedPresets = [...currentPresets, preset];
    savePresets(updatedPresets);
  } catch (error) {
    console.error('Failed to add preset to storage:', error);
    throw error;
  }
}

/**
 * Update an existing preset in storage
 * @param presetId - ID of the preset to update
 * @param updates - Partial preset data to update
 */
export function updatePreset(presetId: string, updates: Partial<Preset>): void {
  try {
    const currentPresets = loadPresets();
    const updatedPresets = currentPresets.map((p) =>
      p.id === presetId ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    savePresets(updatedPresets);
  } catch (error) {
    console.error('Failed to update preset in storage:', error);
    throw error;
  }
}

/**
 * Delete a preset from storage
 * Cannot delete the default preset
 * @param presetId - ID of the preset to delete
 * @returns true if deleted, false if it's the default preset
 */
export function deletePreset(presetId: string): boolean {
  try {
    // Prevent deleting the default preset
    if (isDefaultPreset(presetId)) {
      console.warn('Cannot delete default preset');
      return false;
    }

    const currentPresets = loadPresets();
    const filteredPresets = currentPresets.filter((p) => p.id !== presetId);

    // Ensure we don't delete the last preset
    if (filteredPresets.length === 0) {
      console.warn('Cannot delete the last remaining preset');
      return false;
    }

    savePresets(filteredPresets);
    return true;
  } catch (error) {
    console.error('Failed to delete preset from storage:', error);
    throw error;
  }
}

/**
 * Clear all preset data from localStorage
 * Resets to default preset
 */
export function clearPresetStorage(): void {
  try {
    appStorage.remove(PRESETS_KEY);
    appStorage.remove(PRESET_METADATA_KEY);
  } catch (error) {
    console.error('Failed to clear preset storage:', error);
  }
}

/**
 * Initialize preset storage on first load
 * Saves default preset to localStorage on first run
 * @returns Array of presets (from storage or default)
 */
export function initializePresetStorage(): Preset[] {
  try {
    const metadata = appStorage.get<{ version: string }>(PRESET_METADATA_KEY);

    if (!metadata) {
      // First run - initialize storage with default preset
      appStorage.set(PRESET_METADATA_KEY, { version: STORAGE_VERSION });
      appStorage.set(PRESETS_KEY, [DEFAULT_PRESET]);
      return [DEFAULT_PRESET];
    }

    // Existing storage - load presets
    return loadPresets();
  } catch (error) {
    console.error('Failed to initialize preset storage:', error);
    return [DEFAULT_PRESET];
  }
}

/**
 * Export presets as JSON string
 * Excludes the default preset
 * @param presets - Presets to export
 * @returns JSON string of presets
 */
export function exportPresets(presets: Preset[]): string {
  try {
    // Exclude default preset from export
    const userPresets = presets.filter((p) => !isDefaultPreset(p.id));
    return JSON.stringify(userPresets, null, 2);
  } catch (error) {
    console.error('Failed to export presets:', error);
    throw error;
  }
}

/**
 * Import presets from JSON string
 * Validates and merges with existing presets
 * @param json - JSON string to import
 * @param existingPresets - Current presets to merge with
 * @returns Updated presets array
 */
export function importPresets(json: string, existingPresets: Preset[]): Preset[] {
  try {
    const parsed = JSON.parse(json);
    const validation = validatePresetArray(parsed);

    if (validation.success === false) {
      throw new StorageValidationError('Invalid preset data in import', validation.issues);
    }

    const imported = validation.data;
    const existingMap = new Map(existingPresets.map((p) => [p.id, p]));

    // Merge: imported presets override existing ones with same ID
    // But never override the default preset
    imported.forEach((preset) => {
      if (!isDefaultPreset(preset.id)) {
        existingMap.set(preset.id, preset);
      }
    });

    return Array.from(existingMap.values());
  } catch (error) {
    console.error('Failed to import presets:', error);
    throw error;
  }
}
