import React from 'react';
import type { Preset } from '../../entities/preset/preset.types';
import { DEFAULT_PRESET_ID } from '../../entities/preset/preset.constants';
import { PresetItem } from './PresetItem';
import styles from './PresetList.module.css';

export interface PresetListProps {
  /** Array of all presets to display */
  presets: Preset[];
  /** ID of the currently active preset */
  activePresetId: string | null;
  /** Callback when a preset is selected */
  onSelect: (presetId: string) => void;
  /** Callback when a preset is deleted */
  onDelete: (presetId: string) => void;
  /** Callback when creating a new preset */
  onCreate: () => void;
  /** IDs of built-in presets that cannot be deleted */
  builtInIds?: string[];
}

export const PresetList: React.FC<PresetListProps> = ({
  presets,
  activePresetId,
  onSelect,
  onDelete,
  onCreate,
  builtInIds = [DEFAULT_PRESET_ID],
}) => {
  // Sort presets: built-ins first, then by name
  const sortedPresets = [...presets].sort((a, b) => {
    const aIsBuiltIn = builtInIds.includes(a.id);
    const bIsBuiltIn = builtInIds.includes(b.id);

    if (aIsBuiltIn && !bIsBuiltIn) return -1;
    if (!aIsBuiltIn && bIsBuiltIn) return 1;

    return a.name.localeCompare(b.name);
  });

  return (
    <div className={styles.list}>
      <div className={styles.items}>
        {sortedPresets.length === 0 ? (
          <div className={styles.empty}>
            Пока нет упражнений. Создайте своё первое дыхательное упражнение!
          </div>
        ) : (
          sortedPresets.map((preset) => (
            <PresetItem
              key={preset.id}
              preset={preset}
              isActive={preset.id === activePresetId}
              onSelect={onSelect}
              onDelete={onDelete}
              canDelete={!builtInIds.includes(preset.id)}
            />
          ))
        )}

        <button
          type="button"
          className={styles.createButton}
          onClick={onCreate}
          aria-label="Создать новое упражнение"
        >
          <svg className={styles.createButtonIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Создать новое упражнение
        </button>
      </div>
    </div>
  );
};
