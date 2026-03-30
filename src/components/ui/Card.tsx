import React from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'elevated';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
}) => {
  const paddingClass = padding === 'none' ? styles.noPadding : styles[`${padding}Padding`];

  const cardClasses = [
    styles.card,
    styles[variant],
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};
