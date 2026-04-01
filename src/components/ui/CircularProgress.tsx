import styles from './CircularProgress.module.css';

export interface CircularProgressProps {
  /** Progress value from 0 to 1 */
  progress?: number;
  /** Size of the circle in pixels */
  size?: number;
  /** Width of the stroke */
  strokeWidth?: number;
  /** Color of the progress circle (CSS variable or color value) */
  color?: string;
  /** Whether to show glow effect */
  showGlow?: boolean;
  /** Whether to apply breathing animation */
  animate?: boolean;
  /** Content to display in the center */
  children?: React.ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * CircularProgress - reusable circular progress indicator
 * Used for breathing exercise timer and preset preview
 */
export function CircularProgress({
  progress = 1,
  size = 400,
  strokeWidth = 14,
  color = 'var(--accent)',
  showGlow = false,
  animate = false,
  children,
  ariaLabel,
}: CircularProgressProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const effectiveCircumference = circumference - strokeWidth;
  const dashArray = effectiveCircumference;
  const dashOffset = effectiveCircumference * (1 - progress);

  return (
    <div className={styles.container}>
      <div className={styles.circleWrapper} data-animate={animate}>
        <svg
          className={styles.svg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={ariaLabel}
        >
          {/* Background circle */}
          <circle
            className={styles.circleBackground}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            className={styles.circleProgress}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            style={{ stroke: color } as React.CSSProperties}
          />

          {/* Glow effect */}
          {showGlow && (
            <circle
              className={styles.circleGlow}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              style={{ stroke: color } as React.CSSProperties}
            />
          )}
        </svg>

        {/* Center content */}
        {children && <div className={styles.centerContent}>{children}</div>}
      </div>
    </div>
  );
}
