import React from 'react';
import styles from './CircularProgress.module.css';

export interface CircularProgressProps {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showGlow?: boolean;
  animate?: boolean;
  children?: React.ReactNode;
  ariaLabel?: string;
}

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

  const glowCircle = showGlow ? (
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
    />
  ) : null;

  const centerContent = children ? (
    <div className={styles.centerContent}>{children}</div>
  ) : null;

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
          <circle
            className={styles.circleBackground}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />
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
          />
          {glowCircle}
        </svg>
        {centerContent}
      </div>
    </div>
  );
}
