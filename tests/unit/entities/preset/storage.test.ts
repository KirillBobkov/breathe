/**
 * Unit tests for preset storage operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Preset } from '../../../../src/entities/preset/preset.types';
import {
  loadPresets,
  savePresets,
  addPreset,
  updatePreset,
  deletePreset,
  clearPresetStorage,
  initializePresetStorage,
  exportPresets,
  importPresets,
  isDefaultPreset,
} from '../../../../src/entities/preset/storage';
import { appStorage } from '../../../../src/shared/storage/localStorage';
import { StorageValidationError } from '../../../../src/shared/storage/storage.types';

// Mock appStorage
vi.mock('../../../../src/shared/storage/localStorage', () => ({
  appStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    has: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn(),
  },
  LocalStorage: vi.fn(),
  createNamespacedStorage: vi.fn(),
}));

// Mock DEFAULT_PRESET
vi.mock('../../../../src/entities/preset/preset.constants', () => {
  const mockDefaultPreset: Preset = {
    id: 'default-4-7-8',
    name: 'Default Preset',
    phases: [
      { id: 'p1', name: 'Inhale', duration: 10, unit: 'seconds' },
      { id: 'p2', name: 'Hold', duration: 60, unit: 'seconds' },
      { id: 'p3', name: 'Exhale', duration: 5, unit: 'seconds' },
      { id: 'p4', name: 'Hold', duration: 10, unit: 'seconds' },
    ],
    totalCycles: 4,
    createdAt: 1000,
    updatedAt: 1000,
  };
  return {
    BUILT_IN_PRESETS: [],
    DEFAULT_PRESET: mockDefaultPreset,
    DEFAULT_PRESET_ID: 'default-4-7-8',
  };
});

const mockAppStorage = vi.mocked(appStorage);

// Get the mock DEFAULT_PRESET
import { DEFAULT_PRESET, DEFAULT_PRESET_ID } from '../../../../src/entities/preset/preset.constants';

describe('preset storage operations', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isDefaultPreset', () => {
    it('should return true for default preset ID', () => {
      expect(isDefaultPreset('default-4-7-8')).toBe(true);
    });

    it('should return false for other preset IDs', () => {
      expect(isDefaultPreset('user-123')).toBe(false);
      expect(isDefaultPreset('')).toBe(false);
    });
  });

  describe('loadPresets', () => {
    it('should return default preset when storage is empty', () => {
      mockAppStorage.get.mockReturnValue(null);

      const result = loadPresets();

      expect(result).toEqual([DEFAULT_PRESET]);
    });

    it('should return default preset when no metadata exists', () => {
      mockAppStorage.get.mockReturnValueOnce(null);

      const result = loadPresets();

      expect(result).toEqual([DEFAULT_PRESET]);
    });

    it('should return default preset on version mismatch', () => {
      mockAppStorage.get.mockReturnValue({ version: 'v0' });

      const result = loadPresets();

      expect(result).toEqual([DEFAULT_PRESET]);
      expect(mockAppStorage.remove).toHaveBeenCalledWith('presets');
      expect(mockAppStorage.remove).toHaveBeenCalledWith('preset-metadata');
    });

    it('should load presets from storage', () => {
      const storedPresets: Preset[] = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 3, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      mockAppStorage.get.mockImplementation((key) => {
        if (key === 'preset-metadata') return { version: 'v1' };
        if (key === 'presets') return storedPresets;
        return null;
      });

      const result = loadPresets();

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.id === 'user-1')).toBeDefined();
      expect(result.find((p) => p.id === DEFAULT_PRESET_ID)).toBeDefined();
    });

    it('should return default preset on validation failure', () => {
      const invalidData = [{ id: '', name: '', phases: [] }];

      mockAppStorage.get.mockImplementation((key) => {
        if (key === 'preset-metadata') return { version: 'v1' };
        if (key === 'presets') return invalidData;
        return null;
      });

      const result = loadPresets();

      expect(result).toEqual([DEFAULT_PRESET]);
      expect(mockAppStorage.remove).toHaveBeenCalledWith('presets');
    });

    it('should return default preset on error', () => {
      mockAppStorage.get.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = loadPresets();

      expect(result).toEqual([DEFAULT_PRESET]);
    });
  });

  describe('savePresets', () => {
    it('should save all presets to storage', () => {
      const presets: Preset[] = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 3, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      savePresets(presets);

      expect(mockAppStorage.set).toHaveBeenCalledWith('presets', presets);
      expect(mockAppStorage.set).toHaveBeenCalledWith('preset-metadata', { version: 'v1' });
    });

    it('should throw on invalid data', () => {
      const invalidPresets = [{ id: '', name: '', phases: [] } as any];

      expect(() => savePresets(invalidPresets)).toThrow(StorageValidationError);
    });

    it('should save empty array with default preset', () => {
      const presets = [DEFAULT_PRESET];

      expect(() => savePresets(presets)).not.toThrow();
    });
  });

  describe('addPreset', () => {
    it('should add new preset and save to storage', () => {
      const newPreset: Preset = {
        id: 'new-preset',
        name: 'New Preset',
        phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
        createdAt: 3000,
        updatedAt: 3000,
      };

      mockAppStorage.get.mockReturnValue({ version: 'v1' });

      addPreset(newPreset);

      expect(mockAppStorage.set).toHaveBeenCalled();
    });
  });

  describe('updatePreset', () => {
    it('should update existing preset', () => {
      const userPreset: Preset = {
        id: 'user-1',
        name: 'Original Name',
        phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
        createdAt: 2000,
        updatedAt: 2000,
      };

      mockAppStorage.get.mockReturnValue({ version: 'v1' });

      updatePreset('user-1', { name: 'Updated Name' });

      expect(mockAppStorage.set).toHaveBeenCalled();
    });

    it('should update default preset', () => {
      mockAppStorage.get.mockReturnValue({ version: 'v1' });

      expect(() => updatePreset(DEFAULT_PRESET_ID, { name: 'Updated Default' })).not.toThrow();
    });
  });

  describe('deletePreset', () => {
    it('should delete user preset', () => {
      const presets: Preset[] = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      mockAppStorage.get.mockReturnValue({ version: 'v1' });

      const result = deletePreset('user-1');

      expect(result).toBe(true);
      expect(mockAppStorage.set).toHaveBeenCalled();
    });

    it('should not delete default preset', () => {
      const result = deletePreset(DEFAULT_PRESET_ID);

      expect(result).toBe(false);
      expect(mockAppStorage.set).not.toHaveBeenCalled();
    });

    it('should not delete the last preset', () => {
      // Only default preset exists
      mockAppStorage.get.mockImplementation((key) => {
        if (key === 'preset-metadata') return { version: 'v1' };
        if (key === 'presets') return [DEFAULT_PRESET];
        return null;
      });

      const result = deletePreset(DEFAULT_PRESET_ID);

      expect(result).toBe(false);
    });

    it('should return true when deleting user preset', () => {
      const presets: Preset[] = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      mockAppStorage.get.mockImplementation((key) => {
        if (key === 'preset-metadata') return { version: 'v1' };
        if (key === 'presets') return presets;
        return null;
      });

      const result = deletePreset('user-1');

      expect(result).toBe(true);
    });
  });

  describe('clearPresetStorage', () => {
    it('should remove presets key', () => {
      clearPresetStorage();

      expect(mockAppStorage.remove).toHaveBeenCalledWith('presets');
    });

    it('should remove metadata key', () => {
      clearPresetStorage();

      expect(mockAppStorage.remove).toHaveBeenCalledWith('preset-metadata');
    });
  });

  describe('initializePresetStorage', () => {
    it('should initialize storage with default preset on first run', () => {
      mockAppStorage.get.mockReturnValue(null);

      const result = initializePresetStorage();

      expect(result).toEqual([DEFAULT_PRESET]);
      expect(mockAppStorage.set).toHaveBeenCalledWith('preset-metadata', { version: 'v1' });
      expect(mockAppStorage.set).toHaveBeenCalledWith('presets', [DEFAULT_PRESET]);
    });

    it('should load presets when metadata exists', () => {
      mockAppStorage.get.mockReturnValue({ version: 'v1' });

      const result = initializePresetStorage();

      expect(mockAppStorage.set).not.toHaveBeenCalledWith('preset-metadata', expect.anything());
      expect(result).toBeDefined();
    });

    it('should return default preset on error', () => {
      mockAppStorage.get.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = initializePresetStorage();

      expect(result).toEqual([DEFAULT_PRESET]);
    });
  });

  describe('exportPresets', () => {
    it('should export only user presets (excluding default)', () => {
      const presets: Preset[] = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      const result = exportPresets(presets);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('user-1');
    });

    it('should export empty array when only default preset exists', () => {
      const result = exportPresets([DEFAULT_PRESET]);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual([]);
    });
  });

  describe('importPresets', () => {
    it('should import valid preset JSON', () => {
      const importedPresets = [
        {
          id: 'user-1',
          name: 'User Preset',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      const existingPresets = [DEFAULT_PRESET];

      const result = importPresets(JSON.stringify(importedPresets), existingPresets);

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.id === 'user-1')).toBeDefined();
      expect(result.find((p) => p.id === DEFAULT_PRESET_ID)).toBeDefined();
    });

    it('should not override default preset on import', () => {
      const existingPresets = [DEFAULT_PRESET];
      const importedData = [
        {
          id: DEFAULT_PRESET_ID,
          name: 'Hacked Default',
          phases: [{ id: 'p1', name: 'Hack', duration: 1, unit: 'seconds' }],
          createdAt: 9999,
          updatedAt: 9999,
        },
      ];

      const result = importPresets(JSON.stringify(importedData), existingPresets);
      const defaultPreset = result.find((p) => p.id === DEFAULT_PRESET_ID);

      expect(defaultPreset?.name).toBe('Default Preset'); // Original preserved
    });

    it('should merge imported presets with existing', () => {
      const existingPresets = [
        DEFAULT_PRESET,
        {
          id: 'user-1',
          name: 'Original Name',
          phases: [{ id: 'p1', name: 'Breathe', duration: 5, unit: 'seconds' }],
          createdAt: 1000,
          updatedAt: 1000,
        },
      ];

      const importedData = [
        {
          id: 'user-1',
          name: 'Updated Name',
          phases: [{ id: 'p1', name: 'Inhale', duration: 3, unit: 'seconds' }],
          createdAt: 3000,
          updatedAt: 3000,
        },
      ];

      const result = importPresets(JSON.stringify(importedData), existingPresets);
      const updated = result.find((p) => p.id === 'user-1');

      expect(updated?.name).toBe('Updated Name');
    });

    it('should throw StorageValidationError for invalid JSON', () => {
      const existingPresets = [DEFAULT_PRESET];

      expect(() => importPresets('invalid json', existingPresets)).toThrow();
    });

    it('should throw StorageValidationError for invalid preset data', () => {
      const existingPresets = [DEFAULT_PRESET];
      const invalidData = [{ id: '', name: '', phases: [] }];

      expect(() => importPresets(JSON.stringify(invalidData), existingPresets)).toThrow(
        StorageValidationError
      );
    });
  });

  describe('error handling', () => {
    it('should handle storage errors in loadPresets', () => {
      mockAppStorage.get.mockImplementation(() => {
        throw new Error('Storage read error');
      });

      expect(() => loadPresets()).not.toThrow();
      expect(loadPresets()).toEqual([DEFAULT_PRESET]);
    });

    it('should handle storage errors in savePresets', () => {
      mockAppStorage.set.mockImplementation(() => {
        throw new Error('Storage write error');
      });

      expect(() => savePresets([DEFAULT_PRESET])).toThrow();
    });
  });
});
