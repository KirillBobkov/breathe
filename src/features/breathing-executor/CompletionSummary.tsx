import { formatDuration } from '../../shared/utils/time';
import styles from './CompletionSummary.module.css';

interface CompletionSummaryProps {
  /** Number of cycles completed */
  cyclesCompleted: number;
  /** Total time of the exercise in milliseconds */
  totalTime: number;
  /** Callback to restart the exercise */
  onRestart: () => void;
  /** Callback to close the summary */
  onClose: () => void;
}

/**
 * CompletionSummary displays when a breathing exercise is complete
 * Shows statistics and provides options to restart or close
 */
export function CompletionSummary({
  cyclesCompleted,
  totalTime,
  onRestart,
  onClose,
}: CompletionSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.summary} role="dialog" aria-labelledby="completion-title">
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </div>

        <h2 id="completion-title" className={styles.title}>
          Упражнение завершено!
        </h2>

        <div className={styles.stats}>
          <div className={styles.stat}>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatDuration(totalTime)}</span>
            <span className={styles.statLabel}>Общее время</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.button}
            data-variant="primary"
            onClick={onRestart}
            type="button"
          >
            <svg
              className={styles.buttonIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Заново
          </button>

          <button
            className={styles.button}
            data-variant="secondary"
            onClick={onClose}
            type="button"
          >
            <svg
              className={styles.buttonIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
