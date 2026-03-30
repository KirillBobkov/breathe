/**
 * Timer module exports
 *
 * Provides drift-corrected timer implementation for accurate countdowns
 * independent of JavaScript event loop delays.
 */

export { DriftCorrectedTimer } from './DriftCorrectedTimer';
export type {
  TimerCallbacks,
  TimerConfig,
  TimerState,
  TimerStatus,
  PauseResult,
} from './timer.types';
