/**
 * Types for the audio player service
 */

/**
 * Type of breathing phase for sound mapping
 */
export type BreathingPhaseSound = 'inhale' | 'hold' | 'exhale' | 'pause' | 'phaseChange' | 'complete';

/**
 * Configuration options for the audio player
 */
export interface AudioPlayerConfig {
  /** Master volume (0.0 to 1.0) */
  volume: number;
  /** Whether sounds are enabled */
  enabled: boolean;
}

/**
 * Sound configuration for a specific breathing phase
 */
export interface SoundConfig {
  /** Type of sound to play */
  type: BreathingPhaseSound;
  /** Duration of the sound in seconds */
  duration: number;
  /** Starting frequency in Hz */
  startFreq: number;
  /** Ending frequency in Hz (for ascending/descending sounds) */
  endFreq?: number;
  /** Waveform type */
  waveform: OscillatorType;
}

/**
 * Default sound configurations for each breathing phase
 */
export const DEFAULT_SOUNDS: Record<BreathingPhaseSound, SoundConfig> = {
  inhale: {
    type: 'inhale',
    duration: 0.5,
    startFreq: 300,
    endFreq: 500,
    waveform: 'sine',
  },
  hold: {
    type: 'hold',
    duration: 0.3,
    startFreq: 500,
    endFreq: 500,
    waveform: 'sine',
  },
  exhale: {
    type: 'exhale',
    duration: 0.5,
    startFreq: 500,
    endFreq: 300,
    waveform: 'sine',
  },
  pause: {
    type: 'pause',
    duration: 0.15,
    startFreq: 400,
    endFreq: 400,
    waveform: 'triangle',
  },
  phaseChange: {
    type: 'phaseChange',
    duration: 0.2,
    startFreq: 600,
    endFreq: 600,
    waveform: 'sine',
  },
  complete: {
    type: 'complete',
    duration: 0.8,
    startFreq: 400,
    endFreq: 800,
    waveform: 'sine',
  },
};
