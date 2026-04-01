import React, { useState, useCallback } from 'react';
import type { Phase } from '../../entities/preset/preset.types';
import { PhaseItem } from './PhaseItem';
import { Icon } from '../../components/ui';
import { reorder } from '../../shared/utils/drag-reorder';
import styles from './PhaseEditor.module.css';

export interface PhaseEditorProps {
  /** Array of phases to edit */
  phases: Phase[];
  /** Callback when phases change */
  onChange: (phases: Phase[]) => void;
}

const DEFAULT_PHASE: Omit<Phase, 'id'> = {
  name: 'Фаза',
  duration: 3,
  unit: 'seconds',
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const PhaseEditor: React.FC<PhaseEditorProps> = ({ phases, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddPhase = useCallback(() => {
    const newPhase: Phase = {
      ...DEFAULT_PHASE,
      id: generateId(),
      name: `Фаза ${phases.length + 1}`,
    };
    onChange([...phases, newPhase]);
  }, [phases, onChange]);

  const handleRemovePhase = useCallback((phaseId: string) => {
    onChange(phases.filter((p) => p.id !== phaseId));
  }, [phases, onChange]);

  const handlePhaseChange = useCallback((phaseId: string, updates: Partial<Phase>) => {
    onChange(
      phases.map((p) => (p.id === phaseId ? { ...p, ...updates } : p))
    );
  }, [phases, onChange]);

  // Called when drag starts - stores the index of the dragged item
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  // Called when dragging over an item - stores the target index
  const handleDragOver = useCallback((index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  // Called when drag leaves an item
  const handleDragLeave = useCallback(() => {
    // Keep dragOverIndex to avoid flickering
  }, []);

  // Called when drop happens - performs the reorder
  const handleDrop = useCallback((targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const reordered = reorder(phases, draggedIndex, targetIndex);
      onChange(reordered);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, phases, onChange]);

  // Called when drag ends (cancels if no drop happened)
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Touch move handler - finds which item is under the touch point
  const handleTouchMove = useCallback((clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const targetItem = element?.closest('[data-phase-item]');
    if (targetItem && draggedIndex !== null) {
      const targetIndex = parseInt(targetItem.getAttribute('data-phase-index') || '-1', 10);
      if (targetIndex >= 0 && targetIndex !== draggedIndex && targetIndex !== dragOverIndex) {
        setDragOverIndex(targetIndex);
      }
    }
  }, [draggedIndex, dragOverIndex]);

  // Touch end handler - performs reorder if we have valid indices
  const handleTouchEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const reordered = reorder(phases, draggedIndex, dragOverIndex);
      onChange(reordered);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, phases, onChange]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фазы дыхания</h3>
        <span className={styles.count}>{phases.length} фаз{phases.length !== 1 ? '' : ''}</span>
      </div>

      <div className={`${styles.phaseList} ${draggedIndex !== null ? styles.phaseListDragging : ''}`}>
        {phases.map((phase, index) => (
          <PhaseItem
            key={phase.id}
            phase={phase}
            index={index}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            onChange={handlePhaseChange}
            onRemove={handleRemovePhase}
            canRemove={phases.length > 1}
            onDragStart={() => handleDragStart(index)}
            onDragOver={() => handleDragOver(index)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ))}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={handleAddPhase}
      >
        <Icon name="plus" className={styles.addButtonIcon} />
        Добавить фазу
      </button>
    </div>
  );
};
