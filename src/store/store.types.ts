import type { Preset, Phase } from '../entities/preset/preset.types';
import type { AppState } from '../shared/state-machine/state-machine.types';

/**
 * Main application store interface
 * Manages preset data and runtime state for the breathing exercise
 */
interface BreathingStore {
  // Presets
  /** All available breathing presets */
  presets: Preset[];
  /** ID of the currently selected preset; null if none selected */
  activePresetId: string | null;

  // Runtime
  /** Index of the current phase within the active preset */
  currentPhaseIndex: number;
  /** Current cycle number (1-indexed) */
  currentCycle: number;
  /** Time remaining in the current phase (milliseconds) */
  timeRemaining: number;
  /** Whether the exercise is currently running */
  isRunning: boolean;
  /** Whether the exercise is currently paused */
  isPaused: boolean;
  /** Current application state */
  appState: AppState;

  // Derived
  /** The current phase object; null if no preset is active */
  activePhase: Phase | null;
  /** Total cycles configured for the active preset; null if no preset active */
  totalCycles: number | null;

  // Sound Settings
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Sound volume (0.0 to 1.0) */
  soundVolume: number;

  // Actions
  /** Select a preset as the active preset */
  selectPreset: (presetId: string) => void;
  /** Create a new preset and return its ID */
  createPreset: (input: import('../entities/preset/preset.types').PresetCreateInput) => string;
  /** Update an existing preset */
  updatePreset: (presetId: string, input: import('../entities/preset/preset.types').PresetUpdateInput) => void;
  /** Delete a preset */
  deletePreset: (presetId: string) => void;
  /** Reorder phases within a preset */
  reorderPhases: (presetId: string, phases: Phase[]) => void;
  /** Start the breathing exercise */
  start: () => void;
  /** Pause the running exercise */
  pause: () => void;
  /** Resume a paused exercise */
  resume: () => void;
  /** Stop the exercise and return to READY state */
  stop: () => void;
  /** Reset all runtime state to initial values */
  reset: () => void;
  /** Manually set the remaining time for the current phase */
  setTimeRemaining: (ms: number) => void;
  /** Advance to the next phase in the sequence */
  nextPhase: () => void;
  /** Enable or disable sound effects */
  setSoundEnabled: (enabled: boolean) => void;
  /** Set the sound volume (0.0 to 1.0) */
  setSoundVolume: (volume: number) => void;
}

export type { BreathingStore };
