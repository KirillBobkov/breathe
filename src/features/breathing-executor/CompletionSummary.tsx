import { Icon, ButtonWithIcon, IconButton } from "../../components/ui";
import { formatDuration } from "../../shared/utils";
import styles from "./CompletionSummary.module.css";

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
      <div
        className={styles.summary}
        role="dialog"
        aria-labelledby="completion-title"
      >
        <div className={styles.iconWrapper}>
          <Icon name="check" className={styles.icon} />
        </div>

        <h2 id="completion-title" className={styles.title}>
          Упражнение завершено!
        </h2>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Общее время</span>
            <span className={styles.statValue}>
              {formatDuration(totalTime, 'full')}
            </span>
          </div>
        </div>

        {/* Action Buttons - как на главном экране */}
        <div className={styles.actionButtons}>
          <IconButton
            icon={<Icon name="restart" />}
            variant="secondary"
            size="large"
            onClick={onRestart}
            aria-label="Заново"
            className={styles.iconActionButton}
          />
          <ButtonWithIcon
            icon="close"
            className={styles.primaryActionButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            Закрыть
          </ButtonWithIcon>
        </div>
      </div>
    </div>
  );
}
