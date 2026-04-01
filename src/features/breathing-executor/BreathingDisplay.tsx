import type { Phase } from '../../entities/preset/preset.types';
import { formatTime } from '../../shared/utils/time';
import { CircularProgress } from '../../components/ui/CircularProgress';
import styles from './BreathingDisplay.module.css';

interface BreathingDisplayProps {
  /** Current phase object */
  phase: Phase | null;
  /** Time remaining in current phase (milliseconds) */
  timeRemaining: number;
  /** Total duration of current phase (milliseconds) */
  totalTime: number;
  /** Current phase index for color cycling */
  phaseIndex: number;
  /** Whether the exercise is paused */
  isPaused?: boolean;
}

/**
 * BreathingDisplay is the main timer display with circular SVG progress
 * Shows the current phase name and animated progress circle
 */
export function BreathingDisplay({
  phase,
  timeRemaining,
  totalTime,
  phaseIndex,
  isPaused = false,
}: BreathingDisplayProps) {
  // Calculate progress (0 = empty, 1 = full)
  const progress = totalTime > 0 ? Math.max(0, Math.min(1, timeRemaining / totalTime)) : 0;

  // Color palette that cycles through phases
  const colorPalette = [
    'var(--breathing-inhale)',
    'var(--breathing-hold)',
    'var(--breathing-exhale)',
    'var(--breathing-pause)',
  ];
  const phaseColor = !phase
    ? 'var(--text-tertiary)'
    : colorPalette[phaseIndex % colorPalette.length];

  const isUrgent = timeRemaining < 3000 && timeRemaining > 0;

  return (
    <div className={styles.container}>
      <CircularProgress
        progress={progress}
        color={phaseColor}
        showGlow
        animate={!isPaused}
        ariaLabel={`Прогресс дыхания: ${phase?.name || 'Готов'}, ${formatTime(timeRemaining)} осталось`}
      >
        <div className={styles.phaseName} style={{ color: phaseColor }}>
          {phase?.name || 'Готов'}
        </div>
        <div className={styles.timeRemaining} data-urgent={isUrgent}>
          {formatTime(timeRemaining)}
        </div>
      </CircularProgress>
    </div>
  );
}
