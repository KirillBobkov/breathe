import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import type { BreathingStore } from './store.types';
import type { PresetCreateInput, PresetUpdateInput, Preset, Phase } from '../entities/preset/preset.types';
import { DEFAULT_PRESET, BUILT_IN_PRESETS } from '../entities/preset/preset.constants';
import { initializePresetStorage, savePresets } from '../entities/preset/storage';

/**
 * Helper to generate unique IDs
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load initial presets from storage
 * Falls back to built-in presets if storage is unavailable
 */
function loadInitialPresets(): Preset[] {
  try {
    return initializePresetStorage();
  } catch (error) {
    console.error('Failed to load presets from storage, using built-ins:', error);
    return [...BUILT_IN_PRESETS];
  }
}

/**
 * Get the initial active preset ID
 * Prioritizes DEFAULT_PRESET, falls back to first available
 */
function getInitialActivePresetId(presets: Preset[]): string {
  // Try to use DEFAULT_PRESET if it exists
  const defaultPreset = presets.find((p) => p.id === DEFAULT_PRESET.id);
  if (defaultPreset) {
    return defaultPreset.id;
  }
  // Fall back to first available preset
  return presets[0]?.id ?? DEFAULT_PRESET.id;
}

/**
 * Helper to generate phase IDs for new presets
 */
function generatePhasesWithIds(phases: PresetCreateInput['phases']): Phase[] {
  return phases.map((phase) => ({
    ...phase,
    id: generateId(),
  }));
}

/**
 * Helper to compute the active phase from state
 */
function computeActivePhase(
  activePresetId: string | null,
  presets: Preset[],
  currentPhaseIndex: number
) {
  const activePreset = presets.find((p) => p.id === activePresetId);
  if (!activePreset || !activePreset.phases[currentPhaseIndex]) {
    return null;
  }
  return activePreset.phases[currentPhaseIndex];
}

/**
 * Helper to compute total cycles from state
 */
function computeTotalCycles(activePresetId: string | null, presets: Preset[]): number | null {
  const activePreset = presets.find((p) => p.id === activePresetId);
  return activePreset?.totalCycles ?? null;
}

/**
 * Zustand store for breathing training app
 *
 * Manages:
 * - Preset collection (CRUD operations with localStorage persistence)
 * - Active preset selection
 * - Runtime state for active breathing session
 * - Application state machine (IDLE, READY, RUNNING, PAUSED, COMPLETED)
 */
export const useBreathingStore = create<BreathingStore>()(
  devtools(
    (set, get) => {
      // Load initial presets from storage
      const initialPresets = loadInitialPresets();
      const initialActivePresetId = getInitialActivePresetId(initialPresets);

      return {
        // ==========================================================================
        // Initial State
        // ==========================================================================
        presets: initialPresets,
        activePresetId: initialActivePresetId,
        currentPhaseIndex: 0,
        currentCycle: 1,
        timeRemaining: 0,
        isRunning: false,
        isPaused: false,
        appState: 'READY',
        // Derived state (computed on init and kept in sync)
        activePhase: computeActivePhase(initialActivePresetId, initialPresets, 0),
        totalCycles: computeTotalCycles(initialActivePresetId, initialPresets),
        // Sound Settings
        soundEnabled: true,
        soundVolume: 0.5,

      // ==========================================================================
      // Preset Management Actions
      // ==========================================================================

      selectPreset: (presetId: string) => {
        const { presets } = get();
        const preset = presets.find((p) => p.id === presetId);

        if (!preset) {
          console.warn(`Preset with id "${presetId}" not found`);
          return;
        }

        set(
          {
            activePresetId: presetId,
            currentPhaseIndex: 0,
            currentCycle: 1,
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            appState: 'READY',
            activePhase: computeActivePhase(presetId, presets, 0),
            totalCycles: computeTotalCycles(presetId, presets),
          },
          false,
          'selectPreset'
        );
      },

      createPreset: (input: PresetCreateInput): string => {
        const now = Date.now();
        const newPreset = {
          id: generateId(),
          name: input.name,
          description: input.description,
          phases: generatePhasesWithIds(input.phases),
          totalCycles: input.totalCycles,
          themeColor: input.themeColor,
          createdAt: now,
          updatedAt: now,
        };
        const newPresetId = newPreset.id;

        set(
          (state) => {
            const newPresets = [...state.presets, newPreset];
            // Persist to localStorage
            try {
              savePresets(newPresets);
            } catch (error) {
              console.error('Failed to persist presets after create:', error);
            }
            return {
              presets: newPresets,
            };
          },
          false,
          'createPreset'
        );

        return newPresetId;
      },

      updatePreset: (presetId: string, input: PresetUpdateInput) => {
        set(
          (state) => {
            const updatedPresets = state.presets.map((p) =>
              p.id === presetId
                ? {
                    ...p,
                    ...input,
                    updatedAt: Date.now(),
                  }
                : p
            );
            const result: Partial<BreathingStore> = { presets: updatedPresets };

            // If updating the active preset, recompute derived state
            if (state.activePresetId === presetId) {
              result.activePhase = computeActivePhase(
                state.activePresetId,
                updatedPresets,
                state.currentPhaseIndex
              );
              result.totalCycles = computeTotalCycles(state.activePresetId, updatedPresets);
            }

            // Persist to localStorage
            try {
              savePresets(updatedPresets);
            } catch (error) {
              console.error('Failed to persist presets after update:', error);
            }

            return result;
          },
          false,
          'updatePreset'
        );
      },

      deletePreset: (presetId: string) => {
        const { activePresetId, presets, currentPhaseIndex } = get();

        // Prevent deleting the last preset
        if (presets.length <= 1) {
          console.warn('Cannot delete the last remaining preset');
          return;
        }

        // Find the preset to delete to get its index
        const presetIndex = presets.findIndex((p) => p.id === presetId);
        if (presetIndex === -1) {
          console.warn(`Preset with id "${presetId}" not found`);
          return;
        }

        // If deleting the active preset, select another one
        let newActivePresetId = activePresetId;
        let newPhaseIndex = currentPhaseIndex;
        const wasActivePreset = activePresetId === presetId;
        if (wasActivePreset) {
          // Select the first available preset that isn't being deleted
          const remainingPresets = presets.filter((p) => p.id !== presetId);
          newActivePresetId = remainingPresets[0].id;
          newPhaseIndex = 0;
        }

        const newPresets = presets.filter((p) => p.id !== presetId);

        // Persist to localStorage
        try {
          savePresets(newPresets);
        } catch (error) {
          console.error('Failed to persist presets after delete:', error);
        }

        set(
          {
            presets: newPresets,
            activePresetId: newActivePresetId,
            // If we changed the active preset, reset runtime state
            ...(wasActivePreset && {
              currentPhaseIndex: 0,
              currentCycle: 1,
              timeRemaining: 0,
              isRunning: false,
              isPaused: false,
              appState: 'READY' as const,
            }),
            // Recompute derived state
            activePhase: computeActivePhase(newActivePresetId, newPresets, newPhaseIndex),
            totalCycles: computeTotalCycles(newActivePresetId, newPresets),
          },
          false,
          'deletePreset'
        );
      },

      reorderPhases: (presetId: string, phases) => {
        set(
          (state) => {
            const updatedPresets = state.presets.map((p) =>
              p.id === presetId
                ? {
                    ...p,
                    phases,
                    updatedAt: Date.now(),
                  }
                : p
            );
            const result: Partial<BreathingStore> = { presets: updatedPresets };

            // If reordering phases in the active preset, recompute derived state
            if (state.activePresetId === presetId) {
              result.activePhase = computeActivePhase(
                state.activePresetId,
                updatedPresets,
                state.currentPhaseIndex
              );
            }

            // Persist to localStorage
            try {
              savePresets(updatedPresets);
            } catch (error) {
              console.error('Failed to persist presets after reorder:', error);
            }

            return result;
          },
          false,
          'reorderPhases'
        );
      },

      // ==========================================================================
      // Session Control Actions
      // ==========================================================================

      start: () => {
        const { activePresetId, presets } = get();
        const activePreset = presets.find((p) => p.id === activePresetId);

        if (!activePreset || activePreset.phases.length === 0) {
          console.warn('Cannot start: no active preset or preset has no phases');
          return;
        }

        const firstPhase = activePreset.phases[0];
        const durationMs =
          firstPhase.unit === 'minutes'
            ? firstPhase.duration * 60 * 1000
            : firstPhase.duration * 1000;

        set(
          {
            isRunning: true,
            isPaused: false,
            timeRemaining: durationMs,
            appState: 'RUNNING',
          },
          false,
          'start'
        );
      },

      pause: () => {
        set(
          (state) => ({
            ...state,
            isPaused: true,
            appState: 'PAUSED',
          }),
          false,
          'pause'
        );
      },

      resume: () => {
        set(
          (state) => ({
            ...state,
            isPaused: false,
            appState: 'RUNNING',
          }),
          false,
          'resume'
        );
      },

      stop: () => {
        const { activePresetId, presets } = get();
        set(
          {
            isRunning: false,
            isPaused: false,
            currentPhaseIndex: 0,
            currentCycle: 1,
            timeRemaining: 0,
            appState: 'READY',
            activePhase: computeActivePhase(activePresetId, presets, 0),
          },
          false,
          'stop'
        );
      },

      reset: () => {
        set(
          {
            activePresetId: null,
            currentPhaseIndex: 0,
            currentCycle: 1,
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            appState: 'IDLE',
            activePhase: null,
            totalCycles: null,
          },
          false,
          'reset'
        );
      },

      nextPhase: () => {
        const { activePresetId, presets, currentPhaseIndex, currentCycle } = get();
        const activePreset = presets.find((p) => p.id === activePresetId);

        if (!activePreset) {
          return;
        }

        const phaseCount = activePreset.phases.length;
        const nextPhaseIndex = (currentPhaseIndex + 1) % phaseCount;
        const isNewCycle = nextPhaseIndex === 0;
        const nextCycle = isNewCycle ? currentCycle + 1 : currentCycle;

        // Check if exercise is complete
        const totalCycles = activePreset.totalCycles;
        const isComplete = totalCycles !== undefined && nextCycle > totalCycles;

        if (isComplete) {
          set(
            {
              isRunning: false,
              isPaused: false,
              appState: 'COMPLETED',
            },
            false,
            'nextPhase'
          );
          return;
        }

        // Calculate new phase duration
        const nextPhase = activePreset.phases[nextPhaseIndex];
        const durationMs =
          nextPhase.unit === 'minutes'
            ? nextPhase.duration * 60 * 1000
            : nextPhase.duration * 1000;

        set(
          {
            currentPhaseIndex: nextPhaseIndex,
            currentCycle: nextCycle,
            timeRemaining: durationMs,
            activePhase: nextPhase,
          },
          false,
          'nextPhase'
        );
      },

      setTimeRemaining: (ms: number) => {
        set({ timeRemaining: ms }, false, 'setTimeRemaining');
      },

      // ==========================================================================
      // Sound Settings Actions
      // ==========================================================================

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled }, false, 'setSoundEnabled');
      },

      setSoundVolume: (volume: number) => {
        set({ soundVolume: Math.max(0, Math.min(1, volume)) }, false, 'setSoundVolume');
      },
    };
    },
    {
      name: 'breathing-store',
      enabled: import.meta.env.DEV,
    }
  )
);
