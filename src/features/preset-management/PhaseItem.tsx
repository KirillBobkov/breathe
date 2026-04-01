import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Phase } from '../../entities/preset/preset.types';
import styles from './PhaseItem.module.css';

export interface PhaseItemProps {
  /** The phase to edit */
  phase: Phase;
  /** Index of the phase in the list */
  index: number;
  /** Whether this item is being dragged */
  isDragging: boolean;
  /** Whether this item is being dragged over */
  isDragOver: boolean;
  /** Callback when phase data changes */
  onChange: (phaseId: string, updates: Partial<Phase>) => void;
  /** Callback when remove button is clicked */
  onRemove: (phaseId: string) => void;
  /** Whether this phase can be removed */
  canRemove: boolean;
  /** Callback when drag starts */
  onDragStart: () => void;
  /** Callback when dragging over this item */
  onDragOver: () => void;
  /** Callback when drag leaves */
  onDragLeave: () => void;
  /** Callback when dropped on this item */
  onDrop: () => void;
  /** Callback when drag ends */
  onDragEnd: () => void;
  /** Callback during touch move with client coordinates */
  onTouchMove?: (clientX: number, clientY: number) => void;
  /** Callback when touch ends - performs the reorder */
  onTouchEnd?: () => void;
}

export const PhaseItem: React.FC<PhaseItemProps> = ({
  phase,
  index,
  isDragging,
  isDragOver,
  onChange,
  onRemove,
  canRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onTouchMove,
  onTouchEnd,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  // Локальное состояние для input - позволяет вводить пустые значения
  const [durationInput, setDurationInput] = useState<string>(String(phase.duration));

  // Синхронизация при изменении phase извне
  useEffect(() => {
    setDurationInput(String(phase.duration));
  }, [phase.duration]);

  // Desktop drag handlers using React synthetic events
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Store the index in dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    onDragStart();
  }, [index, onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    onDragOver();
  }, [onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if actually leaving the item (not entering child)
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      onDragLeave();
    }
  }, [onDragLeave]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop();
  }, [onDrop]);

  const handleDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  // Touch handlers for mobile drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow drag from handle
    const target = e.target as Element;
    if (!target.closest(`.${styles.dragHandle}`)) return;

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setIsTouchDragging(true);
    onDragStart();
  }, [onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchDragging) return;

    const touch = e.touches[0];

    // Check if we're moving vertically (dragging)
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // Only handle drag if moving vertically more than 10px
    if (deltaY > 10) {
      if (onTouchMove) {
        onTouchMove(touch.clientX, touch.clientY);
      }
    }
  }, [isTouchDragging, touchStartY, onTouchMove]);

  const handleTouchEnd = useCallback(() => {
    if (isTouchDragging) {
      if (onTouchEnd) {
        onTouchEnd();
      }
    }
    setIsTouchDragging(false);
  }, [isTouchDragging, onTouchEnd]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(phase.id, { name: e.target.value });
  };

  // Позволяет вводить любые значения (включая пустые)
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDurationInput(e.target.value);
  };

  // При потере фокуса валидируем и сохраняем
  const handleDurationBlur = () => {
    const value = parseFloat(durationInput);
    const validValue = !isNaN(value) && value >= 1 ? value : 1;
    setDurationInput(String(validValue));
    onChange(phase.id, { duration: validValue });
  };

  // При нажатии Enter также применяем значение
  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleDurationIncrement = () => {
    onChange(phase.id, { duration: phase.duration + 1 });
  };

  const handleDurationDecrement = () => {
    const newValue = phase.duration - 1;
    if (newValue >= 1) {
      onChange(phase.id, { duration: newValue });
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(phase.id, { unit: e.target.value as 'seconds' | 'minutes' });
  };

  const handleRemove = () => {
    onRemove(phase.id);
  };

  const containerClasses = [
    styles.item,
    isDragging || isTouchDragging ? styles.itemDragging : '',
    isDragOver ? styles.itemDragOver : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={itemRef}
      className={containerClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-phase-item="true"
      data-phase-index={index}
    >
      {/* Drag Handle - draggable element for desktop */}
      <div
        ref={dragHandleRef}
        className={styles.dragHandle}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ cursor: 'grab' }}
      >
        <svg
          className={styles.dragHandleIcon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="6" r="1.5" fill="currentColor" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="9" cy="18" r="1.5" fill="currentColor" />
          <circle cx="15" cy="6" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="18" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Inputs */}
      <div className={styles.inputs}>
        <input
          type="text"
          className={`${styles.input} ${styles.inputName}`}
          value={phase.name}
          onChange={handleNameChange}
          placeholder="Название фазы"
          aria-label="Название фазы"
        />

        <div className={styles.durationInputWrapper}>
          <button
            type="button"
            className={styles.durationButton}
            onClick={handleDurationDecrement}
            disabled={phase.duration <= 1}
            aria-label="Уменьшить длительность"
          >
            −
          </button>
          <input
            type="number"
            className={`${styles.input} ${styles.inputDuration}`}
            value={durationInput}
            onChange={handleDurationChange}
            onBlur={handleDurationBlur}
            onKeyDown={handleDurationKeyDown}
            step="1"
            aria-label="Длительность фазы"
          />
          <button
            type="button"
            className={styles.durationButton}
            onClick={handleDurationIncrement}
            aria-label="Увеличить длительность"
          >
            +
          </button>
        </div>

        <select
          className={styles.select}
          value={phase.unit}
          onChange={handleUnitChange}
          aria-label="Единица измерения"
        >
          <option value="seconds">Секунды</option>
          <option value="minutes">Минуты</option>
        </select>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        className={`${styles.deleteButton} ${!canRemove ? styles.deleteButtonDisabled : ''}`}
        onClick={handleRemove}
        disabled={!canRemove}
        aria-label={`Удалить фазу ${phase.name}`}
        title={canRemove ? 'Удалить фазу' : 'Нельзя удалить последнюю фазу'}
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
    </div>
  );
};
