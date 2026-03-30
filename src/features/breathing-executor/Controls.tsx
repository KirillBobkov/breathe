import styles from './Controls.module.css';

interface ControlsProps {
  /** Whether the exercise is currently running */
  isRunning: boolean;
  /** Whether the exercise is currently paused */
  isPaused: boolean;
  /** Callback to start the exercise */
  onStart: () => void;
  /** Callback to pause the exercise */
  onPause: () => void;
  /** Callback to resume from pause */
  onResume: () => void;
  /** Callback to stop the exercise */
  onStop: () => void;
}

/**
 * Controls provides Play/Pause/Stop buttons for the breathing exercise
 * Features large touch targets for accessibility
 */
export function Controls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: ControlsProps) {
  const showPlay = !isRunning;
  const showPause = isRunning && !isPaused;
  const showResume = isRunning && isPaused;

  return (
    <div className={styles.container}>
      <div className={styles.controls} role="group" aria-label="Управление дыхательным упражнением">
        {/* Stop button - always shown when running or paused */}
        {(isRunning || isPaused) && (
          <button
            className={styles.button}
            data-variant="secondary"
            onClick={onStop}
            type="button"
            aria-label="Остановить упражнение"
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span className={styles.label}>Стоп</span>
          </button>
        )}

        {/* Play button - shown when not running */}
        {showPlay && (
          <button
            className={styles.button}
            data-variant="primary"
            onClick={onStart}
            type="button"
            aria-label="Начать упражнение"
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className={styles.label}>Старт</span>
          </button>
        )}

        {/* Pause button - shown when running */}
        {showPause && (
          <button
            className={styles.button}
            data-variant="primary"
            onClick={onPause}
            type="button"
            aria-label="Приостановить упражнение"
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <span className={styles.label}>Пауза</span>
          </button>
        )}

        {/* Resume button - shown when paused */}
        {showResume && (
          <button
            className={styles.button}
            data-variant="primary"
            onClick={onResume}
            type="button"
            aria-label="Продолжить упражнение"
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className={styles.label}>Продолжить</span>
          </button>
        )}
      </div>
    </div>
  );
}
