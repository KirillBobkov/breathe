import React from 'react';
import type { Preset } from '../../entities/preset/preset.types';
import { ListGroupItem, DeleteButton } from '../../components/ui';
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
  const handleDelete = () => {
    onDelete(preset.id);
  };

  return (
    <ListGroupItem
      isActive={isActive}
      onClick={() => onSelect(preset.id)}
      ariaLabel={`Выбрать упражнение ${preset.name}`}
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      actions={
        canDelete ? (
          <DeleteButton
            onDelete={handleDelete}
            ariaLabel={`Удалить упражнение ${preset.name}`}
          />
        ) : null
      }
    >
      <h3 className={styles.name}>{preset.name}</h3>
    </ListGroupItem>
  );
};
