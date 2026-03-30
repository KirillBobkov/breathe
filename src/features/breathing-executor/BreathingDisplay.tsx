import type { Phase } from '../../entities/preset/preset.types';
import { formatTime } from '../../shared/utils/time';
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
}: BreathingDisplayProps) {
  // Calculate progress (0 = empty, 1 = full)
  const progress = totalTime > 0 ? Math.max(0, Math.min(1, timeRemaining / totalTime)) : 0;

  // SVG circle properties
  const size = 280;
  const strokeWidth = 8;
  const center = size / 2;
  // Radius calculation: center the stroke path within the SVG viewport
  // The stroke is drawn along the path, centered on it, so we need to account for half stroke width on each side
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // For round line caps, we need to adjust the visible dash array to prevent overflow
  // The round cap extends stroke-width/2 beyond the path endpoint
  const effectiveCircumference = circumference - strokeWidth;
  const dashArray = effectiveCircumference;
  const dashOffset = effectiveCircumference * (1 - progress);

  // Color palette that cycles through phases
  const colorPalette = [
    'var(--breathing-inhale)',
    'var(--breathing-hold)',
    'var(--breathing-exhale)',
    'var(--breathing-pause)',
  ];
  const phaseColor = !phase
    ? 'var(--color-text-tertiary)'
    : colorPalette[phaseIndex % colorPalette.length];

  return (
    <div className={styles.container}>
      <div className={styles.circleWrapper}>
        <svg
          className={styles.svg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Прогресс дыхания: ${phase?.name || 'Готов'}, ${formatTime(timeRemaining)} осталось`}
        >
          {/* Background circle */}
          <circle
            className={styles.circleBackground}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle - starts from top (12 o'clock) and goes clockwise */}
          <circle
            className={styles.circleProgress}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={phaseColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90, ${center}, ${center})`}
            style={{ '--phase-color': phaseColor } as React.CSSProperties}
          />
        </svg>

        {/* Center content */}
        <div className={styles.centerContent}>
          <div className={styles.phaseName} style={{ color: phaseColor }}>
            {phase?.name || 'Готов'}
          </div>
          <div className={styles.timeRemaining}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
}
