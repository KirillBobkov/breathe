/**
 * DriftCorrectedTimer - A precision timer using drift correction
 *
 * Uses Date.now() for drift correction instead of naive decrement.
 * This ensures the timer stays accurate even if the interval ticks
 * are delayed by the JavaScript event loop.
 *
 * @example
 * ```ts
 * const timer = new DriftCorrectedTimer({
 *   onTick: (remaining) => console.log(`${remaining}ms remaining`),
 *   onComplete: () => console.log('Done!')
 * });
 * timer.start(5000); // 5 second timer
 * ```
 */

import type {
  TimerCallbacks,
  TimerConfig,
  TimerState,
  TimerStatus,
  PauseResult,
} from './timer.types';

const DEFAULT_TICK_INTERVAL = 1000;

/**
 * Drift-corrected timer implementation
 */
export class DriftCorrectedTimer {
  private state: TimerState;
  private callbacks: TimerCallbacks;
  private config: Required<TimerConfig>;
  private pausedAt: number | null = null;
  private remainingOnPause: number = 0;
  private isCompleted: boolean = false;

  /**
   * Create a new drift-corrected timer
   * @param callbacks - Callback functions for timer events
   * @param config - Optional configuration
   */
  constructor(callbacks: TimerCallbacks, config: TimerConfig = {}) {
    this.callbacks = callbacks;
    this.config = {
      tickInterval: config.tickInterval ?? DEFAULT_TICK_INTERVAL,
    };
    this.state = {
      targetEndTime: 0,
      tickInterval: this.config.tickInterval,
      intervalId: null,
    };
  }

  /**
   * Start the timer with a duration
   * @param durationMs - Duration in milliseconds
   * @throws {Error} If timer is already running
   */
  start(durationMs: number): void {
    if (this.state.intervalId !== null) {
      throw new Error('Timer is already running');
    }

    this.isCompleted = false;
    this.pausedAt = null;
    this.remainingOnPause = 0;

    // Set target end time using Date.now() for drift correction
    this.state.targetEndTime = Date.now() + durationMs;

    // Start the tick interval
    this.startInterval();
  }

  /**
   * Pause the timer and return remaining time
   * @returns Pause result with remaining milliseconds
   * @throws {Error} If timer is not running
   */
  pause(): PauseResult {
    if (this.state.intervalId === null) {
      throw new Error('Timer is not running');
    }

    // Calculate remaining time before stopping
    const remainingMs = this.calculateRemaining();

    // Clear the interval
    this.stopInterval();

    // Store pause state for resume
    this.pausedAt = Date.now();
    this.remainingOnPause = remainingMs;

    return { remainingMs };
  }

  /**
   * Resume a paused timer
   * @throws {Error} If timer is not paused
   */
  resume(): void {
    if (this.pausedAt === null) {
      throw new Error('Timer is not paused (use start() for new timer)');
    }

    if (this.remainingOnPause <= 0) {
      throw new Error('Cannot resume: no time remaining');
    }

    // Recalculate target end time based on current time and remaining duration
    this.state.targetEndTime = Date.now() + this.remainingOnPause;

    // Clear pause state
    this.pausedAt = null;
    this.remainingOnPause = 0;

    // Restart the interval
    this.startInterval();
  }

  /**
   * Stop the timer completely
   */
  stop(): void {
    this.stopInterval();
    this.pausedAt = null;
    this.remainingOnPause = 0;
    this.isCompleted = false;
  }

  /**
   * Get remaining time in milliseconds
   * @returns Remaining milliseconds, or 0 if completed
   */
  getRemaining(): number {
    if (this.isCompleted) {
      return 0;
    }
    return Math.max(0, this.calculateRemaining());
  }

  /**
   * Get current timer status
   * @returns Current status string
   */
  getStatus(): TimerStatus {
    if (this.isCompleted) {
      return 'completed';
    }
    if (this.state.intervalId !== null) {
      return 'running';
    }
    if (this.pausedAt !== null) {
      return 'paused';
    }
    return 'idle';
  }

  /**
   * Calculate remaining time using drift correction
   * Uses target end time vs current time for accuracy
   */
  private calculateRemaining(): number {
    return this.state.targetEndTime - Date.now();
  }

  /**
   * Start the tick interval
   */
  private startInterval(): void {
    // Immediate tick to provide initial state
    this.tick();

    // Set up recurring interval
    this.state.intervalId = setInterval(() => {
      this.tick();
    }, this.state.tickInterval);
  }

  /**
   * Stop the tick interval
   */
  private stopInterval(): void {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }

  /**
   * Single tick handler - called on each interval
   */
  private tick(): void {
    const remainingMs = this.calculateRemaining();

    if (remainingMs <= 0) {
      // Timer completed
      this.stopInterval();
      this.isCompleted = true;
      this.callbacks.onTick(0);
      this.callbacks.onComplete();
    } else {
      // Normal tick
      this.callbacks.onTick(remainingMs);
    }
  }

  /**
   * Cleanup method for clearing resources
   * Call this when done with the timer instance
   */
  destroy(): void {
    this.stop();
    // Clear all references
    this.state.targetEndTime = 0;
  }
}
