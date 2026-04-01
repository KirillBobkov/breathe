import { formatDuration } from '../../shared/utils/time';
import { Icon, ButtonWithIcon } from '../../components/ui';
import styles from './CompletionSummary.module.css';

interface CompletionSummaryProps {
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
  totalTime,
  onRestart,
  onClose,
}: CompletionSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.summary} role="dialog" aria-labelledby="completion-title">
        <div className={styles.iconWrapper}>
          <Icon name="check" className={styles.icon} />
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
          <ButtonWithIcon
            icon="restart"
            variant="primary"
            size="medium"
            className={styles.button}
            onClick={onRestart}
          >
            Заново
          </ButtonWithIcon>

          <ButtonWithIcon
            icon="close"
            variant="secondary"
            size="medium"
            className={styles.button}
            onClick={onClose}
          >
            Закрыть
          </ButtonWithIcon>
        </div>
      </div>
    </div>
  );
}
