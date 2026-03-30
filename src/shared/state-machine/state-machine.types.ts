/**
 * Possible states for the breathing application
 *
 * - IDLE: Initial state, no preset selected
 * - READY: Preset selected, ready to start
 * - RUNNING: Exercise is actively running
 * - PAUSED: Exercise is paused, can be resumed
 * - COMPLETED: Exercise has finished all cycles
 */
type AppState = 'IDLE' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type { AppState };
