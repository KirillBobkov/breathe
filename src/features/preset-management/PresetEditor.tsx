import React, { useState, useEffect, useCallback } from 'react';
import type { Preset, PresetCreateInput, PresetUpdateInput, Phase } from '../../entities/preset/preset.types';
import { PhaseEditor } from './PhaseEditor';
import { useBreathingStore } from '../../store/useBreathingStore';
import { generateId } from '../../entities/preset/preset.model';
import { Toggle, Modal, NumberInput } from '../../components/ui';
import styles from './PresetEditor.module.css';

export interface PresetEditorProps {
  /** The preset being edited (undefined for creating new) */
  preset?: Preset;
  /** Callback when save is clicked - includes ID for newly created presets */
  onSave: (data: PresetCreateInput & { _id?: string }) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether the modal is open */
  isOpen: boolean;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return phases.map(({ id: _id, ...phase }) => phase);
};

export const PresetEditor: React.FC<PresetEditorProps> = ({
  preset,
  onSave,
  onCancel,
  isOpen,
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={preset ? 'Изменить' : 'Создать'}
      size="medium"
      className={styles.modal}
    >
      <div className={styles.content} onKeyDown={handleKeyDown}>
        {/* Name Input */}
        <div className={styles.formGroup}>
          <label htmlFor="preset-name" className={styles.formGroupLabel}>
            Название
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
            <NumberInput
              value={totalCycles}
              onChange={setTotalCycles}
              min={1}
              max={999}
              step={1}
              ariaLabel="Количество циклов"
              className={styles.cyclesInput}
              disabled={isInfinite}
            />
            <Toggle
              checked={isInfinite}
              onChange={handleInfiniteToggle}
              label="Без остановки"
              ariaLabel="Бесконечный режим"
            />
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
    </Modal>
  );
};
