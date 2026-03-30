import type { Phase } from '../../entities/preset/preset.types';
import styles from './PhaseIndicator.module.css';

interface PhaseIndicatorProps {
  /** All phases in the breathing exercise */
  phases: Phase[];
  /** Index of the current phase (0-based) */
  currentPhaseIndex: number;
}

/**
 * PhaseIndicator displays all phases as interactive dots/pills
 * Shows phase names on hover and highlights the current phase
 */
export function PhaseIndicator({ phases, currentPhaseIndex }: PhaseIndicatorProps) {
  if (phases.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.phases} role="tablist" aria-label="Фазы дыхания">
        {phases.map((phase, index) => {
          const isCurrent = index === currentPhaseIndex;
          const isPast = index < currentPhaseIndex;

          return (
            <button
              key={phase.id}
              className={styles.phase}
              data-current={isCurrent}
              data-past={isPast}
              disabled
              type="button"
              aria-label={`${phase.name} ${isCurrent ? '(текущая)' : isPast ? '(завершена)' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <span className={styles.phaseName}>{phase.name}</span>
              <span className={styles.phaseDot} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
