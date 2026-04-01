import React from 'react';
import { Icon } from './Icon';
import styles from './DeleteButton.module.css';

export interface DeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  className?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  disabled = false,
  ariaLabel = 'Удалить',
  title = 'Удалить',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${disabled ? styles.buttonDisabled : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      <Icon name="trash" size={20} className={styles.icon} />
    </button>
  );
};
