/**
 * Types for the audio player service
 */

/**
 * Type of sound
 */
export type BreathingPhaseSound = 'inhale' | 'complete';

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
 * Sound configuration for a specific sound type
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
 * Default sound configurations
 */
export const DEFAULT_SOUNDS: Record<BreathingPhaseSound, SoundConfig> = {
  inhale: {
    type: 'inhale',
    duration: 0.5,
    startFreq: 300,
    endFreq: 500,
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
