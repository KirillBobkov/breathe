import React from 'react';
import styles from './ListGroupItem.module.css';

export interface ListGroupItemProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const ListGroupItem: React.FC<ListGroupItemProps> = ({
  isActive,
  onClick,
  children,
  actions,
  className = '',
  ariaLabel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.item} ${isActive ? styles.itemActive : ''} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      aria-label={ariaLabel}
    >
      <div className={`${styles.indicator} ${isActive ? styles.indicatorActive : ''}`} aria-hidden="true" />

      <div className={styles.content}>
        {children}
      </div>

      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};
