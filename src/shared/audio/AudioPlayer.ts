import type { AudioPlayerConfig, BreathingPhaseSound } from './audio.types';
import { DEFAULT_SOUNDS } from './audio.types';

/**
 * AudioPlayer uses Web Audio API to generate sounds for breathing phases
 * No external audio files required - sounds are synthesized in real-time
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private config: AudioPlayerConfig;
  private sounds: typeof DEFAULT_SOUNDS;

  constructor(config: Partial<AudioPlayerConfig> = {}) {
    this.config = {
      volume: config.volume ?? 0.5,
      enabled: config.enabled ?? true,
    };
    this.sounds = DEFAULT_SOUNDS;
  }

  /**
   * Initialize the AudioContext (must be called after user interaction)
   */
  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Initialize/resume AudioContext after user interaction
   * Call this on user gesture (click, tap) to ensure audio works on mobile browsers
   */
  init(): void {
    try {
      const ctx = this.initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  /**
   * Play a sound for a specific breathing phase
   */
  play(soundType: BreathingPhaseSound): void {
    if (!this.config.enabled) {
      return;
    }

    try {
      const ctx = this.initAudioContext();
      const soundConfig = this.sounds[soundType];

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const freqs = [soundConfig.startFreq, soundConfig.endFreq ?? soundConfig.startFreq, soundConfig.endFreq ?? soundConfig.startFreq];
      const toneDuration = 0.15;

      freqs.forEach((freq, i) => {
        const startTime = ctx.currentTime + i * toneDuration;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = soundConfig.waveform;
        oscillator.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.config.volume, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, startTime + toneDuration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + toneDuration);
      });
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Update the volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get the current volume
   */
  getVolume(): number {
    return this.config.volume;
  }

  /**
   * Enable or disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
