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
  /** Callback when edit button is clicked */
  onEdit?: (preset: Preset) => void;
}

export const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  isActive,
  onSelect,
  onDelete,
  canDelete,
  onEdit,
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(preset);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(preset.id);
    }
  };

  // Build phase summary (e.g., "Inhale → Hold → Exhale")
  const phaseSummary = preset.phases.map((phase) => phase.name).join(' → ');

  // Format cycles display
  const getCyclesText = (cycles: number): string => {
    const lastTwo = cycles % 100;
    const lastOne = cycles % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return `${cycles} циклов`;
    if (lastOne === 1) return `${cycles} цикл`;
    if (lastOne >= 2 && lastOne <= 4) return `${cycles} цикла`;
    return `${cycles} циклов`;
  };

  const cyclesText =
    preset.totalCycles !== undefined
      ? getCyclesText(preset.totalCycles)
      : 'Бесконечно';

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
        <p className={styles.phases}>
          <span>{phaseSummary}</span>
        </p>
        <div className={styles.meta}>
          <span className={styles.cycles}>{cyclesText}</span>
        </div>
      </div>


      {onEdit && (
        <button
          type="button"
          className={styles.editButton}
          onClick={handleEdit}
          aria-label={`Редактировать упражнение ${preset.name}`}
          title="Редактировать упражнение"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
        {canDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label={`Удалить упражнение ${preset.name}`}
          title="Удалить упражнение"
        >
          <span className={styles.deleteButtonIcon}>×</span>
        </button>
      )}
    </div>
  );
};
