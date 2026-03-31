/**
 * Unit tests for useBreathingStore localStorage persistence integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBreathingStore } from '../../../src/store/useBreathingStore';
import type { PresetCreateInput, PresetUpdateInput } from '../../../src/entities/preset/preset.types';
import { DEFAULT_PRESET, DEFAULT_PRESET_ID } from '../../../src/entities/preset/preset.constants';
import type { Preset } from '../../../src/entities/preset/preset.types';

// Mock the storage module - initializePresetStorage returns presets with default preset
vi.mock('../../../src/entities/preset/storage', () => ({
  initializePresetStorage: vi.fn(() => [
    {
      id: 'default-4-7-8',
      name: 'Задержка дыхания',
      description: 'Успокаивающая дыхательная техника',
      phases: [
        { id: 'p1', name: 'Вдох', duration: 10, unit: 'seconds' },
        { id: 'p2', name: 'Задержка', duration: 60, unit: 'seconds' },
        { id: 'p3', name: 'Выдох', duration: 5, unit: 'seconds' },
        { id: 'p4', name: 'Задержка', duration: 10, unit: 'seconds' },
      ],
      totalCycles: 4,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]),
  savePresets: vi.fn(),
  isDefaultPreset: vi.fn((id: string) => id === 'default-4-7-8'),
}));

import { initializePresetStorage, savePresets, isDefaultPreset } from '../../../src/entities/preset/storage';

const mockInitializePresetStorage = vi.mocked(initializePresetStorage);
const mockSavePresets = vi.mocked(savePresets);
const mockIsDefaultPreset = vi.mocked(isDefaultPreset);

// Mock console to reduce noise
const originalWarn = console.warn;
const originalError = console.error;

describe('useBreathingStore persistence integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBreathingStore.getState().reset();
    // Reset to initial state
    const presets = mockInitializePresetStorage();
    useBreathingStore.setState({
      presets,
      activePresetId: presets[0]?.id ?? null,
      currentPhaseIndex: 0,
      currentCycle: 1,
      timeRemaining: 0,
      isRunning: false,
      isPaused: false,
      appState: 'READY',
      activePhase: presets[0]?.phases[0] ?? null,
      totalCycles: presets[0]?.totalCycles ?? null,
    });

    // Reset mocks
    vi.clearAllMocks();

    // Mock console
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  describe('store initialization', () => {
    it('should initialize with presets from storage', () => {
      const state = useBreathingStore.getState();

      expect(state.presets).toHaveLength(1);
      expect(state.presets[0].id).toBe('default-4-7-8');
    });

    it('should have default preset as active preset', () => {
      const state = useBreathingStore.getState();

      expect(state.activePresetId).toBe('default-4-7-8');
    });
  });

  describe('createPreset persistence', () => {
    it('should persist new preset to localStorage', () => {
      const { createPreset } = useBreathingStore.getState();

      const newId = createPreset({
        name: 'Test Preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 3,
      });

      expect(newId).toBeTruthy();
      expect(mockSavePresets).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: newId }),
        ])
      );
    });

    it('should include default preset in saved presets', () => {
      const { createPreset } = useBreathingStore.getState();

      createPreset({
        name: 'Test',
        phases: [{ name: 'In', duration: 4, unit: 'seconds' }],
        totalCycles: 2,
      });

      const savedPresets = mockSavePresets.mock.calls[0][0] as Preset[];
      expect(savedPresets).toContainEqual(expect.objectContaining({ id: DEFAULT_PRESET_ID }));
    });
  });

  describe('updatePreset persistence', () => {
    it('should persist updated preset to localStorage', () => {
      const { updatePreset } = useBreathingStore.getState();

      updatePreset(DEFAULT_PRESET_ID, { name: 'Updated Name' });

      expect(mockSavePresets).toHaveBeenCalled();
      const savedPresets = mockSavePresets.mock.calls[0][0] as Preset[];
      const updated = savedPresets.find((p) => p.id === DEFAULT_PRESET_ID);
      expect(updated?.name).toBe('Updated Name');
    });

    it('should update updatedAt timestamp', () => {
      vi.useFakeTimers();
      vi.setSystemTime(5000);

      const { updatePreset } = useBreathingStore.getState();

      updatePreset(DEFAULT_PRESET_ID, { name: 'Updated' });

      const savedPresets = mockSavePresets.mock.calls[0][0] as Preset[];
      const updated = savedPresets.find((p) => p.id === DEFAULT_PRESET_ID);

      expect(updated?.updatedAt).toBe(5000);

      vi.useRealTimers();
    });
  });

  describe('deletePreset persistence', () => {
    it('should persist deletion to localStorage', () => {
      // Add a user preset first
      const { createPreset, deletePreset } = useBreathingStore.getState();
      const userId = createPreset({
        name: 'User Preset',
        phases: [{ name: 'In', duration: 4, unit: 'seconds' }],
        totalCycles: 2,
      });

      vi.clearAllMocks();

      deletePreset(userId);

      expect(mockSavePresets).toHaveBeenCalled();
      const savedPresets = mockSavePresets.mock.calls[0][0] as Preset[];
      expect(savedPresets.find((p) => p.id === userId)).toBeUndefined();
    });

    it('should not persist deletion of default preset', () => {
      mockIsDefaultPreset.mockReturnValue(true);

      const { deletePreset } = useBreathingStore.getState();

      deletePreset(DEFAULT_PRESET_ID);

      expect(mockSavePresets).not.toHaveBeenCalled();
    });
  });

  describe('reorderPhases persistence', () => {
    it('should persist phase order changes', () => {
      const { reorderPhases } = useBreathingStore.getState();

      const newPhases = [
        { id: 'p3', name: 'Выдох', duration: 5, unit: 'seconds' },
        { id: 'p1', name: 'Вдох', duration: 10, unit: 'seconds' },
      ];

      reorderPhases(DEFAULT_PRESET_ID, newPhases);

      expect(mockSavePresets).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle savePresets errors gracefully', () => {
      mockSavePresets.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { createPreset } = useBreathingStore.getState();

      const newId = createPreset({
        name: 'Test',
        phases: [{ name: 'In', duration: 4, unit: 'seconds' }],
        totalCycles: 2,
      });

      expect(newId).toBeTruthy();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
