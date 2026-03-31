import type { Preset } from './preset.types';

export const DEFAULT_PRESET_ID = 'default-4-7-8';

export const DEFAULT_PRESET: Preset = {
  id: DEFAULT_PRESET_ID,
  name: 'Задержка дыхания',
  description: 'Тренировка для улучшения дыхательной системы',
  phases: [
    { id: 'p1', name: 'Вдох', duration: 5, unit: 'seconds' },
    { id: 'p2', name: 'Задержка', duration: 40, unit: 'seconds' },
    { id: 'p3', name: 'Выдох', duration: 10, unit: 'seconds' },
    { id: 'p4', name: 'Задержка', duration: 10, unit: 'seconds' },
  ],
  totalCycles: 7,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Collection of all built-in presets
 * Empty array - all presets are stored in localStorage
 */
export const BUILT_IN_PRESETS: Preset[] = [];
