import React from 'react';
import type { Preset } from '../../entities/preset/preset.types';
import styles from './PresetItem.module.css';

export interface PresetItemProps {
  /** The preset to display */
  preset: Preset;
  /** Whether this preset is currently active */
  isActive: boolean;
  /** Callback when this preset is clicked/selected */
  onSelect: (presetId: string) => void;
  /** Callback when delete button is clicked */
  onDelete: (presetId: string) => void;
  /** Whether this preset can be deleted */
  canDelete: boolean;
}

export const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  isActive,
  onSelect,
  onDelete,
  canDelete,
}) => {
  const handleClick = () => {
    onSelect(preset.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDelete) {
      onDelete(preset.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(preset.id);
    }
  };

  return (
    <div
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      aria-label={`Выбрать упражнение ${preset.name}`}
    >
      <div
        className={`${styles.indicator} ${isActive ? styles.indicatorActive : ''}`}
        aria-hidden="true"
      />

      <div className={styles.content}>
        <h3 className={styles.name}>{preset.name}</h3>
      </div>

      {canDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label={`Удалить упражнение ${preset.name}`}
          title="Удалить упражнение"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.deleteButtonIcon}
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
};
