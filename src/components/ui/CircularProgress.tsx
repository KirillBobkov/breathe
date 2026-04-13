import React from 'react';
import styles from './CircularProgress.module.css';

export interface CircularProgressProps {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showGlow?: boolean;
  animate?: boolean;
  phaseIndex?: number; // Used to restart animations on phase change
  children?: React.ReactNode;
  ariaLabel?: string;
}

export function CircularProgress({
  progress = 1,
  size = 400,
  strokeWidth = 22,
  color = 'var(--accent)',
  showGlow = false,
  animate = false,
  phaseIndex = 0,
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

  // Outward waves - expand from circle edge (zen ripple effect)
  const waves = animate ? (
    <>
      <circle
        className={`${styles.wave} ${styles.wave1}`}
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
      />
      <circle
        className={`${styles.wave} ${styles.wave2}`}
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
      />
      <circle
        className={`${styles.wave} ${styles.wave3}`}
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
      />
    </>
  ) : null;

  // Static pulsing circles around main circle (idle state)
  const idlePulseCircles = !animate ? (
    <>
      <circle
        className={`${styles.idlePulseCircle} ${styles.idlePulse1}`}
        cx={center}
        cy={center}
        r={radius}
      />
      <circle
        className={`${styles.idlePulseCircle} ${styles.idlePulse3}`}
        cx={center}
        cy={center}
        r={radius}
      />
    </>
  ) : null;

  const centerContent = children ? (
    <div className={styles.centerContent}>{children}</div>
  ) : null;

  // Pass radius as CSS variable for wave animations
  const circleWrapperStyle = {
    '--circle-radius': `${radius}px`,
  } as React.CSSProperties;

  // Key restarts animations when phase changes
  const animationKey = phaseIndex;

  return (
    <div className={styles.container}>
      <div
        key={animationKey}
        className={styles.circleWrapper}
        style={circleWrapperStyle}
        data-animate={animate}
      >
        <svg
          className={styles.svg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={ariaLabel}
        >
          {/* Waves rendered first (behind) */}
          {waves}
          {idlePulseCircles}

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
          />

          {/* Glow effect */}
          {glowCircle}

          {/* Yin-Yang symbol (idle state) */}
          <g className={`${styles.yinYang} ${styles.yinYangGroup}`}>
            <defs>
              {/* Clip for left half (yang) */}
              <clipPath id="yyClipLeft">
                <rect x="0" y="0" width={size / 2} height={size} />
              </clipPath>
              {/* Clip for right half (yin) */}
              <clipPath id="yyClipRight">
                <rect x={size / 2} y="0" width={size / 2} height={size} />
              </clipPath>
            </defs>

            {/* Main yang circle (left side) - clipped to left half */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.85}
              className={styles.yinYangYang}
              clipPath="url(#yyClipLeft)"
            />

            {/* Main yin circle (right side) - clipped to right half */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.85}
              className={styles.yinYangYin}
              clipPath="url(#yyClipRight)"
            />

            {/* Small yang circle at bottom - creates yang's head */}
            <circle
              cx={center}
              cy={center + radius * 0.425}
              r={radius * 0.425}
              className={styles.yinYangYang}
            />

            {/* Small yin circle at top - creates yin's head */}
            <circle
              cx={center}
              cy={center - radius * 0.425}
              r={radius * 0.425}
              className={styles.yinYangYin}
            />

          </g>
        </svg>
        {centerContent}
      </div>
    </div>
  );
}
