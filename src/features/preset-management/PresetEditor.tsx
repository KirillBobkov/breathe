import React, { useState, useEffect, useCallback } from 'react';
import type { Preset, PresetCreateInput, PresetUpdateInput, Phase } from '../../entities/preset/preset.types';
import { PhaseEditor } from './PhaseEditor';
import { useBreathingStore } from '../../store/useBreathingStore';
import { generateId } from '../../entities/preset/preset.model';
import styles from './PresetEditor.module.css';

export interface PresetEditorProps {
  /** The preset being edited (undefined for creating new) */
  preset?: Preset;
  /** Callback when save is clicked - includes ID for newly created presets */
  onSave: (data: PresetCreateInput & { _id?: string }) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
}

const DEFAULT_PRESET_DATA: PresetCreateInput = {
  name: 'Новое упражнение',
  phases: [
    { name: 'Вдох', duration: 4, unit: 'seconds' },
    { name: 'Задержка', duration: 4, unit: 'seconds' },
    { name: 'Выдох', duration: 4, unit: 'seconds' },
  ],
  totalCycles: 5,
  description: '',
};

// Helper to convert Phase[] to Omit<Phase, 'id'>[]
const toPhaseInputs = (phases: Phase[]): PresetCreateInput['phases'] => {
  return phases.map(({ id: _id, ...phase }) => phase);
};

export const PresetEditor: React.FC<PresetEditorProps> = ({
  preset,
  onSave,
  onCancel,
}) => {
  const createPreset = useBreathingStore((state) => state.createPreset);
  const updatePreset = useBreathingStore((state) => state.updatePreset);

  // Initialize form state
  const [name, setName] = useState(preset?.name ?? DEFAULT_PRESET_DATA.name);
  const [description, setDescription] = useState(
    preset?.description ?? DEFAULT_PRESET_DATA.description
  );
  const [phases, setPhases] = useState<Phase[]>(
    preset?.phases ?? DEFAULT_PRESET_DATA.phases.map((p, i) => ({ ...p, id: `phase-${i}` }))
  );
  const [totalCycles, setTotalCycles] = useState(
    preset?.totalCycles ?? DEFAULT_PRESET_DATA.totalCycles ?? 5
  );
  const [isInfinite, setIsInfinite] = useState(
    preset?.totalCycles === undefined
  );

  // Локальное состояние для input cycles
  const [cyclesInput, setCyclesInput] = useState<string>(
    isInfinite ? '' : String(totalCycles)
  );

  // Update form when preset changes (for reuse)
  useEffect(() => {
    if (preset) {
      setName(preset.name);
      setDescription(preset.description ?? '');
      setPhases(preset.phases);
      setTotalCycles(preset.totalCycles ?? 5);
      setIsInfinite(preset.totalCycles === undefined);
    }
  }, [preset]);

  // Синхронизируем cyclesInput при изменении totalCycles или isInfinite
  useEffect(() => {
    setCyclesInput(isInfinite ? '' : String(totalCycles));
  }, [totalCycles, isInfinite]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  // Позволяет вводить любые значения (включая пустые)
  const handleCyclesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCyclesInput(e.target.value);
  };

  // При потере фокуса валидируем и сохраняем
  const handleCyclesBlur = () => {
    const value = parseInt(cyclesInput, 10);
    const validValue = !isNaN(value) && value >= 1 ? value : 1;
    setTotalCycles(validValue);
    setCyclesInput(String(validValue));
  };

  // При нажатии Enter также применяем значение
  const handleCyclesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleInfiniteToggle = () => {
    setIsInfinite((prev) => !prev);
  };

  const handleSave = useCallback(() => {
    // Ensure all phases have IDs
    const phasesWithIds: Phase[] = phases.map((phase) => ({
      ...phase,
      id: phase.id || generateId(),
    }));

    if (preset) {
      // Update existing preset - use PresetUpdateInput
      const updateData: PresetUpdateInput = {
        name: name.trim() || 'Безымянное упражнение',
        description: (description ?? '').trim() || undefined,
        phases: phasesWithIds,
        totalCycles: isInfinite ? undefined : totalCycles,
      };
      updatePreset(preset.id, updateData);
    } else {
      // Create new preset - use PresetCreateInput
      const createData: PresetCreateInput = {
        name: name.trim() || 'Безымянное упражнение',
        description: (description ?? '').trim() || undefined,
        phases: toPhaseInputs(phasesWithIds),
        totalCycles: isInfinite ? undefined : totalCycles,
      };
      const newPresetId = createPreset(createData);
      // Auto-select the newly created preset
      if (newPresetId) {
        onSave({ ...createData, _id: newPresetId } as PresetCreateInput & { _id: string });
      } else {
        onSave(createData);
      }
      return;
    }

    // Convert to PresetCreateInput for callback
    const callbackData: PresetCreateInput = {
      name: name.trim() || 'Безымянное упражнение',
      description: (description ?? '').trim() || undefined,
      phases: toPhaseInputs(phasesWithIds),
      totalCycles: isInfinite ? undefined : totalCycles,
    };
    onSave(callbackData);
  }, [name, description, phases, totalCycles, isInfinite, preset, createPreset, updatePreset, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-editor-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="preset-editor-title" className={styles.title}>
              {preset ? 'Редактировать упражнение' : 'Создать новое упражнение'}
            </h2>
            {preset && <p className={styles.subtitle}>{preset.name}</p>}
          </div>
        </div>

        <div className={styles.content}>
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-name" className={styles.formGroupLabel}>
              Название упражнения
            </label>
            <input
              id="preset-name"
              type="text"
              className={styles.formGroupInput}
              value={name}
              onChange={handleNameChange}
              placeholder="например, Квадратное дыхание"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-description" className={styles.formGroupLabel}>
              Описание (необязательно)
            </label>
            <input
              id="preset-description"
              type="text"
              className={styles.formGroupInput}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="например, Успокаивающая дыхательная техника"
            />
          </div>

          {/* Cycles Input */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-cycles" className={styles.formGroupLabel}>
              Всего циклов
            </label>
            <div className={styles.cyclesRow}>
              <input
                id="preset-cycles"
                type="number"
                className={`${styles.formGroupInput} ${styles.cyclesInput}`}
                value={cyclesInput}
                onChange={handleCyclesChange}
                onBlur={handleCyclesBlur}
                onKeyDown={handleCyclesKeyDown}
                placeholder="5"
                disabled={isInfinite}
              />
              <label className={styles.infiniteToggle}>
                <input
                  type="checkbox"
                  className={styles.infiniteCheckbox}
                  checked={isInfinite}
                  onChange={handleInfiniteToggle}
                />
                <span className={styles.infiniteLabel}>Бесконечно</span>
              </label>
            </div>
          </div>

          {/* Phase Editor */}
          <div className={styles.formGroup}>
            <PhaseEditor
              phases={phases}
              onChange={setPhases}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSave}`}
            onClick={handleSave}
          >
            {preset ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};
