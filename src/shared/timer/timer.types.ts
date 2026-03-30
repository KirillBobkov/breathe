/**
 * Timer configuration options
 */
export interface TimerConfig {
  /** Tick interval in milliseconds (default: 1000) */
  tickInterval?: number;
}

/**
 * Callbacks for timer events
 */
export interface TimerCallbacks {
  /** Called on each tick with remaining time in milliseconds */
  onTick: (remainingMs: number) => void;
  /** Called when timer completes (reaches zero) */
  onComplete: () => void;
}

/**
 * Internal timer state
 */
export interface TimerState {
  /** Target end timestamp in milliseconds since epoch */
  targetEndTime: number;
  /** Tick interval in milliseconds */
  tickInterval: number;
  /** Interval ID (null if not running) - number for browser, NodeJS.Timeout for Node */
  intervalId: ReturnType<typeof setInterval> | null;
}

/**
 * Public timer status for inspection
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Result from pausing a timer
 */
export interface PauseResult {
  /** Remaining time in milliseconds */
  remainingMs: number;
}
