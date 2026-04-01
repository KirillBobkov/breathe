import React, { useRef, useCallback } from 'react';
import type { Phase } from '../../entities/preset/preset.types';
import { Icon, DeleteButton, NumberInput } from '../../components/ui';
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
  const [isTouchDragging, setIsTouchDragging] = React.useState(false);
  const [touchStartY, setTouchStartY] = React.useState(0);

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

  const handleDurationChange = (value: number) => {
    onChange(phase.id, { duration: value });
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
        <Icon name="drag-handle" className={styles.dragHandleIcon} />
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

        <NumberInput
          value={phase.duration}
          onChange={handleDurationChange}
          min={1}
          max={999}
          step={1}
          ariaLabel="Длительность фазы"
          className={styles.durationInputWrapper}
        />

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
      <DeleteButton
        onDelete={handleRemove}
        disabled={!canRemove}
        ariaLabel={`Удалить фазу ${phase.name}`}
        title={canRemove ? 'Удалить фазу' : 'Нельзя удалить последнюю фазу'}
      />
    </div>
  );
};
