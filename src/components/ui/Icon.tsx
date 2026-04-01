import React from 'react';
import styles from './Icon.module.css';

export type IconName =
  | 'play'
  | 'pause'
  | 'stop'
  | 'restart'
  | 'trash'
  | 'edit'
  | 'plus'
  | 'minus'
  | 'close'
  | 'check'
  | 'sound'
  | 'menu'
  | 'drag-handle'
  | 'infinite'
  | 'volume';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const ICONS: Record<IconName, React.ReactNode> = {
  play: (
    <path d="M8 5v14l11-7z" />
  ),
  pause: (
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  ),
  stop: (
    <rect x="6" y="6" width="12" height="12" rx="2" />
  ),
  restart: (
    <>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </>
  ),
  edit: (
    <path d="M16 5.5a2.121 2.121 0 0 1 3 3L9.5 18l-4 1 1-4 9.5-9.5z" />
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  minus: (
    <path d="M5 12h14" />
  ),
  close: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </>
  ),
  sound: (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
  menu: (
    <>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </>
  ),
  'drag-handle': (
    <>
      <circle cx="9" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" />
      <circle cx="15" cy="6" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </>
  ),
  infinite: (
    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
  ),
  volume: (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ),
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
}) => {
  const iconClasses = [
    styles.icon,
    className,
  ].filter(Boolean).join(' ');

  return (
    <svg
      className={iconClasses}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ICONS[name]}
    </svg>
  );
};
