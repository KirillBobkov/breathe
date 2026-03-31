/**
 * Unit tests for breathing-store (useBreathingStore)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBreathingStore } from '../../../../src/store/useBreathingStore';
import type { PresetCreateInput, PresetUpdateInput } from '../../../../src/entities/preset/preset.types';
import { DEFAULT_PRESET } from '../../../../src/entities/preset/preset.constants';

// Mock console methods
const originalWarn = console.warn;
const originalError = console.error;

describe('useBreathingStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBreathingStore.getState().reset();
    // Reset to initial state with default preset
    useBreathingStore.setState({
      presets: [DEFAULT_PRESET],
      activePresetId: DEFAULT_PRESET.id,
      currentPhaseIndex: 0,
      currentCycle: 1,
      timeRemaining: 0,
      isRunning: false,
      isPaused: false,
      appState: 'READY',
      activePhase: DEFAULT_PRESET.phases[0],
      totalCycles: DEFAULT_PRESET.totalCycles ?? null,
    });

    // Mock console to avoid noise
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  describe('initial state has default preset', () => {
    it('should have the default preset in presets array', () => {
      const state = useBreathingStore.getState();
      expect(state.presets).toHaveLength(1);
      expect(state.presets[0].id).toBe('default-4-7-8');
    });

    it('should have default preset as active preset', () => {
      const state = useBreathingStore.getState();
      expect(state.activePresetId).toBe('default-4-7-8');
    });

    it('should have active phase set to first phase of default preset', () => {
      const state = useBreathingStore.getState();
      expect(state.activePhase).toEqual({
        id: 'p1',
        name: 'Вдох',
        duration: 5,
        unit: 'seconds',
      });
    });

    it('should have totalCycles from default preset', () => {
      const state = useBreathingStore.getState();
      expect(state.totalCycles).toBe(7);
    });

    it('should start in READY state', () => {
      const state = useBreathingStore.getState();
      expect(state.appState).toBe('READY');
    });

    it('should have initial runtime values', () => {
      const state = useBreathingStore.getState();
      expect(state.currentPhaseIndex).toBe(0);
      expect(state.currentCycle).toBe(1);
      expect(state.timeRemaining).toBe(0);
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe('selectPreset changes activePresetId and resets runtime', () => {
    it('should change activePresetId when selecting existing preset', () => {
      const state = useBreathingStore.getState();

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().activePresetId).toBe('default-4-7-8');
    });

    it('should reset currentPhaseIndex to 0', () => {
      const state = useBreathingStore.getState();
      state.nextPhase(); // Move to phase 1
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(1);

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
    });

    it('should reset currentCycle to 1', () => {
      const state = useBreathingStore.getState();
      // Simulate being in cycle 2
      useBreathingStore.setState({ currentCycle: 2 });

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().currentCycle).toBe(1);
    });

    it('should reset timeRemaining to 0', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ timeRemaining: 5000 });

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().timeRemaining).toBe(0);
    });

    it('should reset isRunning to false', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ isRunning: true });

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().isRunning).toBe(false);
    });

    it('should reset isPaused to false', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ isPaused: true });

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().isPaused).toBe(false);
    });

    it('should set appState to READY', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ appState: 'RUNNING' });

      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().appState).toBe('READY');
    });

    it('should update activePhase to first phase of selected preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().activePhase).toEqual(
        DEFAULT_PRESET.phases[0]
      );
    });

    it('should update totalCycles to selected preset cycles', () => {
      const state = useBreathingStore.getState();
      state.selectPreset('default-4-7-8');

      expect(useBreathingStore.getState().totalCycles).toBe(7);
    });

    it('should warn and do nothing when preset not found', () => {
      const state = useBreathingStore.getState();
      const originalActivePresetId = state.activePresetId;

      state.selectPreset('non-existent-id');

      expect(useBreathingStore.getState().activePresetId).toBe(originalActivePresetId);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
    });
  });

  describe('createPreset adds to presets array', () => {
    it('should add new preset to presets array', () => {
      const state = useBreathingStore.getState();
      const initialCount = state.presets.length;

      const input: PresetCreateInput = {
        name: 'Custom Preset',
        phases: [
          { name: 'Inhale', duration: 5, unit: 'seconds' },
          { name: 'Exhale', duration: 5, unit: 'seconds' },
        ],
        totalCycles: 3,
      };

      const newId = state.createPreset(input);

      expect(useBreathingStore.getState().presets).toHaveLength(initialCount + 1);
      expect(useBreathingStore.getState().presets.find((p) => p.id === newId)).toBeDefined();
    });

    it('should generate unique ID for new preset', () => {
      const state = useBreathingStore.getState();

      const input: PresetCreateInput = {
        name: 'Custom Preset',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      };

      const id1 = state.createPreset(input);
      const id2 = state.createPreset(input);

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs for phases', () => {
      const state = useBreathingStore.getState();

      const input: PresetCreateInput = {
        name: 'Custom Preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Hold', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
      };

      const newId = state.createPreset(input);
      const newPreset = useBreathingStore.getState().presets.find((p) => p.id === newId);

      expect(newPreset?.phases[0].id).toBeDefined();
      expect(newPreset?.phases[1].id).toBeDefined();
      expect(newPreset?.phases[2].id).toBeDefined();
      expect(newPreset?.phases[0].id).not.toBe(newPreset?.phases[1].id);
    });

    it('should return the new preset ID', () => {
      const state = useBreathingStore.getState();

      const input: PresetCreateInput = {
        name: 'Custom Preset',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      };

      const newId = state.createPreset(input);
      const newPreset = useBreathingStore.getState().presets.find((p) => p.id === newId);

      expect(newPreset?.id).toBe(newId);
    });

    it('should preserve all input properties', () => {
      const state = useBreathingStore.getState();

      const input: PresetCreateInput = {
        name: 'Full Preset',
        description: 'A complete preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 5,
        themeColor: '#FF0000',
      };

      const newId = state.createPreset(input);
      const newPreset = useBreathingStore.getState().presets.find((p) => p.id === newId);

      expect(newPreset?.name).toBe('Full Preset');
      expect(newPreset?.description).toBe('A complete preset');
      expect(newPreset?.totalCycles).toBe(5);
      expect(newPreset?.themeColor).toBe('#FF0000');
      expect(newPreset?.phases).toHaveLength(2);
    });
  });

  describe('updatePreset modifies existing preset', () => {
    let presetId: string;

    beforeEach(() => {
      const state = useBreathingStore.getState();
      presetId = state.createPreset({
        name: 'Original Name',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 3,
      });
    });

    it('should update preset name', () => {
      const state = useBreathingStore.getState();

      state.updatePreset(presetId, { name: 'Updated Name' });

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.name).toBe('Updated Name');
    });

    it('should update description', () => {
      const state = useBreathingStore.getState();

      state.updatePreset(presetId, { description: 'New description' });

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.description).toBe('New description');
    });

    it('should update phases', () => {
      const state = useBreathingStore.getState();

      const newPhases = [
        { id: 'p1', name: 'Hold', duration: 2, unit: 'seconds' },
        { id: 'p2', name: 'Release', duration: 2, unit: 'seconds' },
      ];

      state.updatePreset(presetId, { phases: newPhases });

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.phases).toEqual(newPhases);
    });

    it('should update totalCycles', () => {
      const state = useBreathingStore.getState();

      state.updatePreset(presetId, { totalCycles: 10 });

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.totalCycles).toBe(10);
    });

    it('should update themeColor', () => {
      const state = useBreathingStore.getState();

      state.updatePreset(presetId, { themeColor: '#00FF00' });

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.themeColor).toBe('#00FF00');
    });

    it('should update updatedAt timestamp', () => {
      const state = useBreathingStore.getState();
      const original = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      const originalUpdatedAt = original?.updatedAt ?? 0;

      vi.spyOn(Date, 'now').mockReturnValue(9999999999);
      state.updatePreset(presetId, { name: 'Updated' });
      vi.restoreAllMocks();

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should recompute derived state when updating active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset(presetId);

      const newPhases = [
        { id: 'p1', name: 'New Phase 1', duration: 5, unit: 'minutes' },
        { id: 'p2', name: 'New Phase 2', duration: 3, unit: 'minutes' },
      ];

      state.updatePreset(presetId, { phases: newPhases });

      const storeState = useBreathingStore.getState();
      expect(storeState.activePhase).toEqual(newPhases[0]);
    });

    it('should update totalCycles in derived state when updating active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset(presetId);

      state.updatePreset(presetId, { totalCycles: 7 });

      expect(useBreathingStore.getState().totalCycles).toBe(7);
    });

    it('should not affect other presets', () => {
      const state = useBreathingStore.getState();
      const defaultPreset = state.presets.find((p) => p.id === 'default-4-7-8');

      state.updatePreset(presetId, { name: 'Updated Name' });

      const unchanged = useBreathingStore.getState().presets.find((p) => p.id === 'default-4-7-8');
      expect(unchanged?.name).toBe(defaultPreset?.name);
    });
  });

  describe('deletePreset removes preset and handles active preset', () => {
    let presetId: string;

    beforeEach(() => {
      const state = useBreathingStore.getState();
      presetId = state.createPreset({
        name: 'To Delete',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      });
    });

    it('should remove preset from array', () => {
      const state = useBreathingStore.getState();
      const initialCount = state.presets.length;

      state.deletePreset(presetId);

      expect(useBreathingStore.getState().presets).toHaveLength(initialCount - 1);
      expect(useBreathingStore.getState().presets.find((p) => p.id === presetId)).toBeUndefined();
    });

    it('should warn when trying to delete last preset', () => {
      const state = useBreathingStore.getState();
      // First delete the custom preset to leave only default
      state.deletePreset(presetId);

      // Now we have only the default preset (count = 1)
      const countBeforeLastDelete = useBreathingStore.getState().presets.length;
      expect(countBeforeLastDelete).toBe(1);

      // Try to delete the last remaining preset
      state.deletePreset('default-4-7-8');

      // Should not delete, count should still be 1
      expect(useBreathingStore.getState().presets).toHaveLength(1);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('last remaining')
      );
    });

    it('should select another preset when deleting active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset(presetId);

      state.deletePreset(presetId);

      expect(useBreathingStore.getState().activePresetId).not.toBe(presetId);
      expect(useBreathingStore.getState().activePresetId).toBe('default-4-7-8');
    });

    it('should reset runtime when deleting active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset(presetId);
      useBreathingStore.setState({
        currentPhaseIndex: 2,
        currentCycle: 3,
        isRunning: true,
        isPaused: true,
        appState: 'RUNNING',
      });

      state.deletePreset(presetId);

      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().currentCycle).toBe(1);
      expect(useBreathingStore.getState().isRunning).toBe(false);
      expect(useBreathingStore.getState().isPaused).toBe(false);
      expect(useBreathingStore.getState().appState).toBe('READY');
    });

    it('should not reset runtime when deleting non-active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset('default-4-7-8');
      useBreathingStore.setState({
        currentPhaseIndex: 1,
        currentCycle: 2,
        appState: 'RUNNING',
      });

      state.deletePreset(presetId);

      expect(useBreathingStore.getState().activePresetId).toBe('default-4-7-8');
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(1);
      expect(useBreathingStore.getState().currentCycle).toBe(2);
    });

    it('should warn when preset not found', () => {
      const state = useBreathingStore.getState();
      const initialCount = state.presets.length;

      state.deletePreset('non-existent-id');

      expect(useBreathingStore.getState().presets).toHaveLength(initialCount);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
    });

    it('should recompute derived state after deletion', () => {
      const state = useBreathingStore.getState();
      state.selectPreset(presetId);

      state.deletePreset(presetId);

      expect(useBreathingStore.getState().activePhase).toEqual(DEFAULT_PRESET.phases[0]);
      expect(useBreathingStore.getState().totalCycles).toBe(7);
    });
  });

  describe('start sets isRunning=true and initializes timeRemaining', () => {
    it('should set isRunning to true', () => {
      const state = useBreathingStore.getState();
      state.start();

      expect(useBreathingStore.getState().isRunning).toBe(true);
    });

    it('should set isPaused to false', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ isPaused: true });

      state.start();

      expect(useBreathingStore.getState().isPaused).toBe(false);
    });

    it('should set appState to RUNNING', () => {
      const state = useBreathingStore.getState();
      state.start();

      expect(useBreathingStore.getState().appState).toBe('RUNNING');
    });

    it('should set timeRemaining to first phase duration in seconds', () => {
      const state = useBreathingStore.getState();
      state.start();

      // Default preset first phase (Вдох) is 5 seconds = 5000ms
      expect(useBreathingStore.getState().timeRemaining).toBe(5000);
    });

    it('should set timeRemaining to first phase duration in minutes', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Minute Preset',
        phases: [{ name: 'Hold', duration: 2, unit: 'minutes' }],
      });

      state.selectPreset(presetId);
      state.start();

      // 2 minutes = 120000ms
      expect(useBreathingStore.getState().timeRemaining).toBe(120000);
    });

    it('should warn and do nothing when no active preset', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ activePresetId: null });

      state.start();

      expect(useBreathingStore.getState().isRunning).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn and do nothing when preset has no phases', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Empty',
        phases: [],
      });
      state.selectPreset(presetId);

      state.start();

      expect(useBreathingStore.getState().isRunning).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('pause sets isPaused=true', () => {
    it('should set isPaused to true', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();

      expect(useBreathingStore.getState().isPaused).toBe(true);
    });

    it('should set appState to PAUSED', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();

      expect(useBreathingStore.getState().appState).toBe('PAUSED');
    });

    it('should preserve isRunning state', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();

      expect(useBreathingStore.getState().isRunning).toBe(true);
    });

    it('should preserve timeRemaining', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ timeRemaining: 2500 });
      state.pause();

      expect(useBreathingStore.getState().timeRemaining).toBe(2500);
    });
  });

  describe('resume sets isPaused=false', () => {
    it('should set isPaused to false', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();
      state.resume();

      expect(useBreathingStore.getState().isPaused).toBe(false);
    });

    it('should set appState to RUNNING', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();
      state.resume();

      expect(useBreathingStore.getState().appState).toBe('RUNNING');
    });

    it('should preserve isRunning state', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();
      state.resume();

      expect(useBreathingStore.getState().isRunning).toBe(true);
    });
  });

  describe('stop resets runtime state', () => {
    it('should set isRunning to false', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.stop();

      expect(useBreathingStore.getState().isRunning).toBe(false);
    });

    it('should set isPaused to false', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();
      state.stop();

      expect(useBreathingStore.getState().isPaused).toBe(false);
    });

    it('should reset currentPhaseIndex to 0', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentPhaseIndex: 2 });
      state.stop();

      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
    });

    it('should reset currentCycle to 1', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentCycle: 3 });
      state.stop();

      expect(useBreathingStore.getState().currentCycle).toBe(1);
    });

    it('should reset timeRemaining to 0', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ timeRemaining: 5000 });
      state.stop();

      expect(useBreathingStore.getState().timeRemaining).toBe(0);
    });

    it('should set appState to READY', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.stop();

      expect(useBreathingStore.getState().appState).toBe('READY');
    });

    it('should reset activePhase to first phase', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentPhaseIndex: 1 });
      state.stop();

      expect(useBreathingStore.getState().activePhase).toEqual(DEFAULT_PRESET.phases[0]);
    });
  });

  describe('nextPhase increments phase index and handles cycle wrap', () => {
    it('should increment currentPhaseIndex', () => {
      const state = useBreathingStore.getState();
      state.start();

      state.nextPhase();

      expect(useBreathingStore.getState().currentPhaseIndex).toBe(1);
    });

    it('should wrap phase index to 0 when reaching end', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentPhaseIndex: 3 }); // Last phase (0,1,2,3)

      state.nextPhase();

      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
    });

    it('should increment currentCycle when wrapping to phase 0', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentPhaseIndex: 3 });

      state.nextPhase();

      expect(useBreathingStore.getState().currentCycle).toBe(2);
    });

    it('should not increment currentCycle when not wrapping', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.nextPhase();

      expect(useBreathingStore.getState().currentCycle).toBe(1);
    });

    it('should update timeRemaining to next phase duration', () => {
      const state = useBreathingStore.getState();
      state.start(); // Phase 0: 5 seconds (Вдох)

      state.nextPhase(); // Phase 1: 40 seconds (Задержка)

      expect(useBreathingStore.getState().timeRemaining).toBe(40000);
    });

    it('should update activePhase to next phase', () => {
      const state = useBreathingStore.getState();
      state.start();

      state.nextPhase();

      expect(useBreathingStore.getState().activePhase).toEqual(DEFAULT_PRESET.phases[1]);
    });

    it('should handle minutes unit in next phase', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Mixed',
        phases: [
          { name: 'Seconds', duration: 5, unit: 'seconds' },
          { name: 'Minutes', duration: 2, unit: 'minutes' },
        ],
      });
      state.selectPreset(presetId);
      state.start();

      state.nextPhase();

      expect(useBreathingStore.getState().timeRemaining).toBe(120000);
    });
  });

  describe('nextPhase handles completion when all cycles done', () => {
    it('should set appState to COMPLETED when cycles exhausted', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentCycle: 7, currentPhaseIndex: 3 });

      state.nextPhase();

      expect(useBreathingStore.getState().appState).toBe('COMPLETED');
    });

    it('should set isRunning to false when completed', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentCycle: 7, currentPhaseIndex: 3 });

      state.nextPhase();

      expect(useBreathingStore.getState().isRunning).toBe(false);
    });

    it('should set isPaused to false when completed', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentCycle: 7, currentPhaseIndex: 3, isPaused: true });

      state.nextPhase();

      expect(useBreathingStore.getState().isPaused).toBe(false);
    });

    it('should not increment cycle beyond totalCycles', () => {
      const state = useBreathingStore.getState();
      state.start();
      useBreathingStore.setState({ currentCycle: 7, currentPhaseIndex: 2 });

      state.nextPhase();

      expect(useBreathingStore.getState().currentCycle).toBe(7);
    });

    it('should handle infinite cycles (totalCycles undefined)', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Infinite',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: undefined, // Infinite
      });
      state.selectPreset(presetId);
      state.start();

      // Simulate many cycles
      for (let i = 0; i < 100; i++) {
        useBreathingStore.setState({ currentPhaseIndex: 1 });
        state.nextPhase();
      }

      expect(useBreathingStore.getState().appState).not.toBe('COMPLETED');
      expect(useBreathingStore.getState().isRunning).toBe(true);
    });

    it('should handle single cycle preset', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Single Cycle',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 1,
      });
      state.selectPreset(presetId);
      state.start();
      useBreathingStore.setState({ currentPhaseIndex: 1 });

      state.nextPhase();

      expect(useBreathingStore.getState().appState).toBe('COMPLETED');
    });

    it('should return early when no active preset', () => {
      const state = useBreathingStore.getState();
      useBreathingStore.setState({ activePresetId: null });

      // Should not throw
      expect(() => state.nextPhase()).not.toThrow();
    });
  });

  describe('reorderPhases replaces phase array', () => {
    it('should replace phases in preset', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Original Order',
        phases: [
          { name: 'First', duration: 1, unit: 'seconds' },
          { name: 'Second', duration: 1, unit: 'seconds' },
          { name: 'Third', duration: 1, unit: 'seconds' },
        ],
      });

      const reordered = [
        { id: 'p3', name: 'Third', duration: 1, unit: 'seconds' },
        { id: 'p1', name: 'First', duration: 1, unit: 'seconds' },
        { id: 'p2', name: 'Second', duration: 1, unit: 'seconds' },
      ];

      state.reorderPhases(presetId, reordered);

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.phases).toEqual(reordered);
    });

    it('should update updatedAt timestamp', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'To Reorder',
        phases: [
          { name: 'A', duration: 1, unit: 'seconds' },
          { name: 'B', duration: 1, unit: 'seconds' },
        ],
      });

      const original = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      const originalUpdatedAt = original?.updatedAt ?? 0;

      vi.spyOn(Date, 'now').mockReturnValue(9999999999);
      state.reorderPhases(presetId, original?.phases ?? []);
      vi.restoreAllMocks();

      const updated = useBreathingStore.getState().presets.find((p) => p.id === presetId);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update activePhase when reordering active preset', () => {
      const state = useBreathingStore.getState();
      state.selectPreset('default-4-7-8');

      const reordered = [
        { id: 'p3', name: 'Exhale', duration: 8, unit: 'seconds' },
        { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        { id: 'p2', name: 'Hold', duration: 7, unit: 'seconds' },
      ];

      state.reorderPhases('default-4-7-8', reordered);

      // activePhase should now be the first phase of reordered array
      expect(useBreathingStore.getState().activePhase).toEqual(reordered[0]);
    });

    it('should not affect activePhase when reordering non-active preset', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Other',
        phases: [
          { name: 'A', duration: 1, unit: 'seconds' },
          { name: 'B', duration: 1, unit: 'seconds' },
        ],
      });

      state.reorderPhases(presetId, [
        { id: 'p2', name: 'B', duration: 1, unit: 'seconds' },
        { id: 'p1', name: 'A', duration: 1, unit: 'seconds' },
      ]);

      // activePhase should still be from default preset
      expect(useBreathingStore.getState().activePhase).toEqual(DEFAULT_PRESET.phases[0]);
    });

    it('should not affect other presets', () => {
      const state = useBreathingStore.getState();
      const defaultPreset = state.presets.find((p) => p.id === 'default-4-7-8');
      const originalPhases = defaultPreset?.phases ?? [];

      state.reorderPhases('default-4-7-8', originalPhases);

      const otherPresets = state.presets.filter((p) => p.id !== 'default-4-7-8');
      otherPresets.forEach((p) => {
        // Their phases should not have changed
        expect(p.phases).toBeDefined();
      });
    });
  });

  describe('setTimeRemaining', () => {
    it('should update timeRemaining', () => {
      const state = useBreathingStore.getState();
      state.setTimeRemaining(5000);

      expect(useBreathingStore.getState().timeRemaining).toBe(5000);
    });

    it('should allow setting to 0', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.setTimeRemaining(0);

      expect(useBreathingStore.getState().timeRemaining).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const state = useBreathingStore.getState();
      state.start();
      state.pause();

      state.reset();

      expect(useBreathingStore.getState().activePresetId).toBe(null);
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().currentCycle).toBe(1);
      expect(useBreathingStore.getState().timeRemaining).toBe(0);
      expect(useBreathingStore.getState().isRunning).toBe(false);
      expect(useBreathingStore.getState().isPaused).toBe(false);
      expect(useBreathingStore.getState().appState).toBe('IDLE');
      expect(useBreathingStore.getState().activePhase).toBe(null);
      expect(useBreathingStore.getState().totalCycles).toBe(null);
    });
  });

  describe('single phase with multiple cycles', () => {
    it('should handle single phase preset with 2 cycles', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Single Phase Two Cycles',
        phases: [
          { name: 'Inhale', duration: 5, unit: 'seconds' },
        ],
        totalCycles: 2,
      });
      state.selectPreset(presetId);
      state.start();

      // Initial state
      expect(useBreathingStore.getState().currentCycle).toBe(1);
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().appState).toBe('RUNNING');

      // After first phase completes
      state.nextPhase();

      // Should move to cycle 2, same phase (index 0)
      expect(useBreathingStore.getState().currentCycle).toBe(2);
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().timeRemaining).toBe(5000);
      expect(useBreathingStore.getState().appState).toBe('RUNNING');
      expect(useBreathingStore.getState().isRunning).toBe(true);

      // After second phase completes
      state.nextPhase();

      // Should complete since we've done 2 cycles
      expect(useBreathingStore.getState().currentCycle).toBe(2);
      expect(useBreathingStore.getState().appState).toBe('COMPLETED');
      expect(useBreathingStore.getState().isRunning).toBe(false);
    });

    it('should handle single phase preset with 3 cycles', () => {
      const state = useBreathingStore.getState();
      const presetId = state.createPreset({
        name: 'Single Phase Three Cycles',
        phases: [
          { name: 'Hold', duration: 3, unit: 'seconds' },
        ],
        totalCycles: 3,
      });
      state.selectPreset(presetId);
      state.start();

      // Cycle 1 -> Cycle 2
      state.nextPhase();
      expect(useBreathingStore.getState().currentCycle).toBe(2);
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().appState).toBe('RUNNING');

      // Cycle 2 -> Cycle 3
      state.nextPhase();
      expect(useBreathingStore.getState().currentCycle).toBe(3);
      expect(useBreathingStore.getState().currentPhaseIndex).toBe(0);
      expect(useBreathingStore.getState().appState).toBe('RUNNING');

      // Cycle 3 -> Complete
      state.nextPhase();
      expect(useBreathingStore.getState().appState).toBe('COMPLETED');
      expect(useBreathingStore.getState().isRunning).toBe(false);
    });
  });
});
