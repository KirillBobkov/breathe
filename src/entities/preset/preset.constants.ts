import type { Preset } from './preset.types';

/**
 * Default built-in breathing preset using the 4-7-8 technique
 * - Inhale for 4 seconds
 * - Hold for 7 seconds
 * - Exhale for 8 seconds
 */
export const DEFAULT_PRESET: Preset = {
  id: 'default-4-7-8',
  name: 'Дыхание 4-7-8',
  description: 'Успокаивающая дыхательная техника для снижения тревожности и улучшения сна',
  phases: [
    { id: 'p1', name: 'Вдох', duration: 4, unit: 'seconds' },
    { id: 'p2', name: 'Задержка', duration: 7, unit: 'seconds' },
    { id: 'p3', name: 'Выдох', duration: 8, unit: 'seconds' },
  ],
  totalCycles: 4,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Box breathing preset (4-4-4-4) - used by Navy SEALs for stress management
 */
export const BOX_BREATHING_PRESET: Preset = {
  id: 'box-breathing',
  name: 'Квадратное дыхание',
  description: 'Равные интервалы для концентрации и снятия стресса',
  phases: [
    { id: 'p1', name: 'Вдох', duration: 4, unit: 'seconds' },
    { id: 'p2', name: 'Задержка', duration: 4, unit: 'seconds' },
    { id: 'p3', name: 'Выдох', duration: 4, unit: 'seconds' },
    { id: 'p4', name: 'Задержка', duration: 4, unit: 'seconds' },
  ],
  totalCycles: 4,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Coherent breathing preset - synchronizes breathing with heart rhythm
 */
export const COHERENT_BREATHING_PRESET: Preset = {
  id: 'coherent-breathing',
  name: 'Когерентное дыхание',
  description: 'Дыхательный паттерн 5-5 для вариабельности сердечного ритма',
  phases: [
    { id: 'p1', name: 'Вдох', duration: 5, unit: 'seconds' },
    { id: 'p2', name: 'Выдох', duration: 5, unit: 'seconds' },
  ],
  totalCycles: undefined, // Infinite
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Collection of all built-in presets
 */
export const BUILT_IN_PRESETS: Preset[] = [
  DEFAULT_PRESET,
  BOX_BREATHING_PRESET,
  COHERENT_BREATHING_PRESET,
];
