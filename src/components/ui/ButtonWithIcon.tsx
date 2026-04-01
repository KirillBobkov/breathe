import React from 'react';
import { Icon, type IconName } from './Icon';
import styles from './ButtonWithIcon.module.css';

export type ButtonWithIconVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonWithIconSize = 'small' | 'medium' | 'large';

export interface ButtonWithIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: ButtonWithIconVariant;
  size?: ButtonWithIconSize;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({
  icon,
  variant = 'primary',
  size = 'medium',
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...rest}
    >
      <span className={styles.iconWrapper}>
        <Icon name={icon} size={size === 'small' ? 18 : 20} />
      </span>
      <span className={styles.label}>{children}</span>
    </button>
  );
};
