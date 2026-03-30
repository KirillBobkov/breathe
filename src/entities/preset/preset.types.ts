/**
 * Time unit for phase duration
 */
type TimeUnit = 'seconds' | 'minutes';

/**
 * A single phase within a breathing preset
 * Represents one step in a breathing exercise (e.g., inhale, hold, exhale)
 */
interface Phase {
  /** Unique identifier for the phase */
  id: string;
  /** Human-readable name of the phase (e.g., "Inhale", "Hold", "Exhale") */
  name: string;
  /** Duration value for the phase */
  duration: number;
  /** Unit of time for the duration */
  unit: TimeUnit;
}

/**
 * A complete breathing exercise preset
 * Contains all phases and configuration for a breathing training session
 */
interface Preset {
  /** Unique identifier for the preset */
  id: string;
  /** Human-readable name of the preset */
  name: string;
  /** Ordered list of phases that make up the breathing exercise */
  phases: Phase[];
  /** Number of complete cycles to run; undefined means infinite looping */
  totalCycles?: number;
  /** Optional description of the preset's purpose or technique */
  description?: string;
  /** Optional theme color for UI display (hex, rgb, etc.) */
  themeColor?: string;
  /** Unix timestamp of when the preset was created */
  createdAt: number;
  /** Unix timestamp of when the preset was last updated */
  updatedAt: number;
}

/**
 * Input data for creating a new preset
 * Excludes auto-generated fields like id and timestamps
 */
interface PresetCreateInput {
  /** Human-readable name of the preset */
  name: string;
  /** Ordered list of phases (ids will be auto-generated) */
  phases: Omit<Phase, 'id'>[];
  /** Number of complete cycles to run; undefined means infinite looping */
  totalCycles?: number;
  /** Optional description of the preset's purpose or technique */
  description?: string;
  /** Optional theme color for UI display (hex, rgb, etc.) */
  themeColor?: string;
}

/**
 * Input data for updating an existing preset
 * All fields are optional; only provided fields will be updated
 */
interface PresetUpdateInput {
  /** New name for the preset */
  name?: string;
  /** New ordered list of phases */
  phases?: Phase[];
  /** New number of cycles; undefined means infinite looping */
  totalCycles?: number;
  /** New description */
  description?: string;
  /** New theme color */
  themeColor?: string;
}

export type { TimeUnit, Phase, Preset, PresetCreateInput, PresetUpdateInput };
