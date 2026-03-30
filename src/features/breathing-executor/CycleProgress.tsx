import styles from './CycleProgress.module.css';

interface CycleProgressProps {
  /** Current cycle number (1-indexed) */
  currentCycle: number;
  /** Total number of cycles; undefined means infinite */
  totalCycles?: number;
}

/**
 * CycleProgress displays the current cycle progress
 * Shows "Cycle X / Y" or "Cycle X" with infinity symbol for infinite loops
 */
export function CycleProgress({ currentCycle, totalCycles }: CycleProgressProps) {
  const isInfinite = totalCycles === undefined;

  const progress = isInfinite
    ? 0
    : Math.min((currentCycle / totalCycles) * 100, 100);

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        {isInfinite ? (
          <>
            Цикл {currentCycle}
            <span className={styles.infinity} aria-label="бесконечные циклы">
              ∞
            </span>
          </>
        ) : (
          <>Цикл {currentCycle} / {totalCycles}</>
        )}
      </div>
      {!isInfinite && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentCycle}
            aria-valuemin={1}
            aria-valuemax={totalCycles}
            aria-label={`Цикл ${currentCycle} из ${totalCycles}`}
          />
        </div>
      )}
    </div>
  );
}
