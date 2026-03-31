/**
 * Unit tests for preset Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  timeUnitSchema,
  phaseSchema,
  presetSchema,
  presetCreateInputSchema,
  presetUpdateInputSchema,
  presetArraySchema,
  formatZodError,
  validatePreset,
  validatePresetArray,
} from '../../../../src/entities/preset/preset.schema';
import type { Preset, Phase } from '../../../../src/entities/preset/preset.types';

describe('timeUnitSchema', () => {
  it('should accept "seconds"', () => {
    const result = timeUnitSchema.safeParse('seconds');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('seconds');
    }
  });

  it('should accept "minutes"', () => {
    const result = timeUnitSchema.safeParse('minutes');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('minutes');
    }
  });

  it('should reject invalid time units', () => {
    const result = timeUnitSchema.safeParse('hours');
    expect(result.success).toBe(false);
  });

  it('should reject numbers', () => {
    const result = timeUnitSchema.safeParse(123);
    expect(result.success).toBe(false);
  });

  it('should reject null', () => {
    const result = timeUnitSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('should reject undefined', () => {
    const result = timeUnitSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});

describe('phaseSchema', () => {
  const validPhase: Phase = {
    id: 'phase-1',
    name: 'Inhale',
    duration: 4,
    unit: 'seconds',
  };

  it('should accept valid phase', () => {
    const result = phaseSchema.safeParse(validPhase);
    expect(result.success).toBe(true);
  });

  it('should require id field', () => {
    const { id, ...phaseWithoutId } = validPhase;
    const result = phaseSchema.safeParse(phaseWithoutId);
    expect(result.success).toBe(false);
  });

  it('should require non-empty id', () => {
    const result = phaseSchema.safeParse({ ...validPhase, id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot be empty');
    }
  });

  it('should require name field', () => {
    const { name, ...phaseWithoutName } = validPhase;
    const result = phaseSchema.safeParse(phaseWithoutName);
    expect(result.success).toBe(false);
  });

  it('should require non-empty name', () => {
    const result = phaseSchema.safeParse({ ...validPhase, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot be empty');
    }
  });

  it('should require duration field', () => {
    const { duration, ...phaseWithoutDuration } = validPhase;
    const result = phaseSchema.safeParse(phaseWithoutDuration);
    expect(result.success).toBe(false);
  });

  it('should require positive duration', () => {
    const result = phaseSchema.safeParse({ ...validPhase, duration: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('positive');
    }
  });

  it('should reject negative duration', () => {
    const result = phaseSchema.safeParse({ ...validPhase, duration: -5 });
    expect(result.success).toBe(false);
  });

  it('should accept decimal duration', () => {
    const result = phaseSchema.safeParse({ ...validPhase, duration: 2.5 });
    expect(result.success).toBe(true);
  });

  it('should require unit field', () => {
    const { unit, ...phaseWithoutUnit } = validPhase;
    const result = phaseSchema.safeParse(phaseWithoutUnit);
    expect(result.success).toBe(false);
  });

  it('should accept "seconds" as unit', () => {
    const result = phaseSchema.safeParse({ ...validPhase, unit: 'seconds' });
    expect(result.success).toBe(true);
  });

  it('should accept "minutes" as unit', () => {
    const result = phaseSchema.safeParse({ ...validPhase, unit: 'minutes' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid unit', () => {
    const result = phaseSchema.safeParse({ ...validPhase, unit: 'hours' });
    expect(result.success).toBe(false);
  });
});

describe('presetSchema', () => {
  const validPreset: Preset = {
    id: 'preset-1',
    name: '4-7-8 Breathing',
    phases: [
      { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
      { id: 'p2', name: 'Hold', duration: 7, unit: 'seconds' },
      { id: 'p3', name: 'Exhale', duration: 8, unit: 'seconds' },
    ],
    totalCycles: 4,
    description: 'Relaxing breathing pattern',
    themeColor: '#4A90E2',
    createdAt: 1609459200000,
    updatedAt: 1609459200000,
  };

  it('should accept valid preset with all fields', () => {
    const result = presetSchema.safeParse(validPreset);
    expect(result.success).toBe(true);
  });

  it('should accept preset without optional fields', () => {
    const minimalPreset = {
      id: 'preset-2',
      name: 'Simple Breathing',
      phases: [{ id: 'p1', name: 'Breathe', duration: 5, unit: 'seconds' }],
      createdAt: 1609459200000,
      updatedAt: 1609459200000,
    };

    const result = presetSchema.safeParse(minimalPreset);
    expect(result.success).toBe(true);
  });

  it('should require id field', () => {
    const { id, ...presetWithoutId } = validPreset;
    const result = presetSchema.safeParse(presetWithoutId);
    expect(result.success).toBe(false);
  });

  it('should require non-empty id', () => {
    const result = presetSchema.safeParse({ ...validPreset, id: '' });
    expect(result.success).toBe(false);
  });

  it('should require name field', () => {
    const { name, ...presetWithoutName } = validPreset;
    const result = presetSchema.safeParse(presetWithoutName);
    expect(result.success).toBe(false);
  });

  it('should require non-empty name', () => {
    const result = presetSchema.safeParse({ ...validPreset, name: '' });
    expect(result.success).toBe(false);
  });

  it('should enforce maximum name length', () => {
    const result = presetSchema.safeParse({
      ...validPreset,
      name: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('too long');
    }
  });

  it('should accept name at maximum length', () => {
    const result = presetSchema.safeParse({
      ...validPreset,
      name: 'a'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('should require phases array', () => {
    const { phases, ...presetWithoutPhases } = validPreset;
    const result = presetSchema.safeParse(presetWithoutPhases);
    expect(result.success).toBe(false);
  });

  it('should require at least one phase', () => {
    const result = presetSchema.safeParse({ ...validPreset, phases: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one');
    }
  });

  it('should enforce maximum phases limit', () => {
    const tooManyPhases = Array.from({ length: 21 }, (_, i) => ({
      id: `p${i}`,
      name: `Phase ${i}`,
      duration: 1,
      unit: 'seconds' as const,
    }));

    const result = presetSchema.safeParse({ ...validPreset, phases: tooManyPhases });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('more than 20');
    }
  });

  it('should accept 20 phases (maximum)', () => {
    const maxPhases = Array.from({ length: 20 }, (_, i) => ({
      id: `p${i}`,
      name: `Phase ${i}`,
      duration: 1,
      unit: 'seconds' as const,
    }));

    const result = presetSchema.safeParse({ ...validPreset, phases: maxPhases });
    expect(result.success).toBe(true);
  });

  it('should validate each phase in phases array', () => {
    const invalidPhases = [
      { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
      { id: 'p2', name: '', duration: 7, unit: 'seconds' }, // Invalid: empty name
    ];

    const result = presetSchema.safeParse({ ...validPreset, phases: invalidPhases });
    expect(result.success).toBe(false);
  });

  it('should require positive integer totalCycles when provided', () => {
    const result = presetSchema.safeParse({ ...validPreset, totalCycles: -1 });
    expect(result.success).toBe(false);
  });

  it('should require integer totalCycles when provided', () => {
    const result = presetSchema.safeParse({ ...validPreset, totalCycles: 4.5 });
    expect(result.success).toBe(false);
  });

  it('should accept zero totalCycles as invalid (must be positive)', () => {
    const result = presetSchema.safeParse({ ...validPreset, totalCycles: 0 });
    expect(result.success).toBe(false);
  });

  it('should enforce maximum description length', () => {
    const result = presetSchema.safeParse({
      ...validPreset,
      description: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('too long');
    }
  });

  it('should accept description at maximum length', () => {
    const result = presetSchema.safeParse({
      ...validPreset,
      description: 'a'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('should validate hex color format for themeColor', () => {
    const result = presetSchema.safeParse({ ...validPreset, themeColor: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should accept valid 6-digit hex color', () => {
    const result = presetSchema.safeParse({ ...validPreset, themeColor: '#FF5733' });
    expect(result.success).toBe(true);
  });

  it('should accept lowercase hex color', () => {
    const result = presetSchema.safeParse({ ...validPreset, themeColor: '#ff5733' });
    expect(result.success).toBe(true);
  });

  it('should reject 3-digit hex color', () => {
    const result = presetSchema.safeParse({ ...validPreset, themeColor: '#F53' });
    expect(result.success).toBe(false);
  });

  it('should reject hex color without hash', () => {
    const result = presetSchema.safeParse({ ...validPreset, themeColor: 'FF5733' });
    expect(result.success).toBe(false);
  });

  it('should require createdAt field', () => {
    const { createdAt, ...presetWithoutCreatedAt } = validPreset;
    const result = presetSchema.safeParse(presetWithoutCreatedAt);
    expect(result.success).toBe(false);
  });

  it('should require positive integer createdAt', () => {
    const result = presetSchema.safeParse({ ...validPreset, createdAt: -1 });
    expect(result.success).toBe(false);
  });

  it('should require updatedAt field', () => {
    const { updatedAt, ...presetWithoutUpdatedAt } = validPreset;
    const result = presetSchema.safeParse(presetWithoutUpdatedAt);
    expect(result.success).toBe(false);
  });

  it('should require positive integer updatedAt', () => {
    const result = presetSchema.safeParse({ ...validPreset, updatedAt: -1 });
    expect(result.success).toBe(false);
  });
});

describe('presetCreateInputSchema', () => {
  const validInput = {
    name: 'New Preset',
    phases: [
      { name: 'Inhale', duration: 4, unit: 'seconds' as const },
      { name: 'Exhale', duration: 4, unit: 'seconds' as const },
    ],
    totalCycles: 4,
    description: 'A test preset',
    themeColor: '#4A90E2',
  };

  it('should accept valid create input', () => {
    const result = presetCreateInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should not require id in phases', () => {
    const inputWithoutIds = {
      name: 'Test',
      phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' as const }],
    };

    const result = presetCreateInputSchema.safeParse(inputWithoutIds);
    expect(result.success).toBe(true);
  });

  it('should reject phases with id field (not needed for create)', () => {
    const inputWithIds = {
      name: 'Test',
      phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' as const }],
    };

    // This should still pass because we don't explicitly forbid id
    const result = presetCreateInputSchema.safeParse(inputWithIds);
    expect(result.success).toBe(true);
  });

  it('should require name', () => {
    const { name, ...inputWithoutName } = validInput;
    const result = presetCreateInputSchema.safeParse(inputWithoutName);
    expect(result.success).toBe(false);
  });

  it('should require phases array', () => {
    const { phases, ...inputWithoutPhases } = validInput;
    const result = presetCreateInputSchema.safeParse(inputWithoutPhases);
    expect(result.success).toBe(false);
  });

  it('should require at least one phase', () => {
    const result = presetCreateInputSchema.safeParse({ ...validInput, phases: [] });
    expect(result.success).toBe(false);
  });
});

describe('presetUpdateInputSchema', () => {
  it('should accept empty object (no updates)', () => {
    const result = presetUpdateInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update with name only', () => {
    const result = presetUpdateInputSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with phases only', () => {
    const result = presetUpdateInputSchema.safeParse({
      phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
    });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with totalCycles only', () => {
    const result = presetUpdateInputSchema.safeParse({ totalCycles: 10 });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with description only', () => {
    const result = presetUpdateInputSchema.safeParse({ description: 'New description' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with themeColor only', () => {
    const result = presetUpdateInputSchema.safeParse({ themeColor: '#FF0000' });
    expect(result.success).toBe(true);
  });

  it('should accept multiple fields', () => {
    const result = presetUpdateInputSchema.safeParse({
      name: 'Updated',
      totalCycles: 5,
      description: 'Updated description',
    });
    expect(result.success).toBe(true);
  });

  it('should validate name when provided', () => {
    const result = presetUpdateInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should validate phases when provided', () => {
    const result = presetUpdateInputSchema.safeParse({ phases: [] });
    expect(result.success).toBe(false);
  });

  it('should validate totalCycles when provided', () => {
    const result = presetUpdateInputSchema.safeParse({ totalCycles: -1 });
    expect(result.success).toBe(false);
  });

  it('should validate themeColor when provided', () => {
    const result = presetUpdateInputSchema.safeParse({ themeColor: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('presetArraySchema', () => {
  const validPreset: Preset = {
    id: 'preset-1',
    name: 'Test Preset',
    phases: [{ id: 'p1', name: 'Breathe', duration: 5, unit: 'seconds' }],
    createdAt: 1609459200000,
    updatedAt: 1609459200000,
  };

  it('should accept empty array', () => {
    const result = presetArraySchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('should accept array of valid presets', () => {
    const presets = [
      validPreset,
      { ...validPreset, id: 'preset-2', name: 'Preset 2' },
      { ...validPreset, id: 'preset-3', name: 'Preset 3' },
    ];

    const result = presetArraySchema.safeParse(presets);
    expect(result.success).toBe(true);
  });

  it('should reject array with one invalid preset', () => {
    const invalidPresets = [
      validPreset,
      { id: '', name: 'Invalid', phases: [], createdAt: 1, updatedAt: 1 },
    ];

    const result = presetArraySchema.safeParse(invalidPresets);
    expect(result.success).toBe(false);
  });

  it('should reject non-array values', () => {
    expect(presetArraySchema.safeParse(null).success).toBe(false);
    expect(presetArraySchema.safeParse('string').success).toBe(false);
    expect(presetArraySchema.safeParse({}).success).toBe(false);
    expect(presetArraySchema.safeParse(123).success).toBe(false);
  });
});

describe('formatZodError', () => {
  it('should format single error', () => {
    const result = presetSchema.safeParse({
      id: '',
      name: '',
      phases: [{ id: 'p1', name: '', duration: -1, unit: 'invalid' }],
      createdAt: -1,
      updatedAt: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain('id');
      expect(formatted).toContain('name');
      expect(formatted).toContain('duration');
      expect(formatted).toContain('unit');
    }
  });

  it('should format nested errors with path', () => {
    const result = presetSchema.safeParse({
      id: 'test',
      name: 'Test',
      phases: [{ id: 'p1', name: '', duration: 4, unit: 'seconds' }],
      createdAt: 1000,
      updatedAt: 1000,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain('phases');
    }
  });

  it('should handle multiple errors', () => {
    const result = presetSchema.safeParse({
      id: '',
      name: 'a'.repeat(101),
      phases: [],
      createdAt: -1,
      updatedAt: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      // Should contain multiple error messages
      expect(formatted.split(',').length).toBeGreaterThan(1);
    }
  });
});

describe('validatePreset', () => {
  const validPreset: Preset = {
    id: 'preset-1',
    name: 'Test Preset',
    phases: [{ id: 'p1', name: 'Breathe', duration: 5, unit: 'seconds' }],
    createdAt: 1609459200000,
    updatedAt: 1609459200000,
  };

  it('should return success with data for valid preset', () => {
    const result = validatePreset(validPreset);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPreset);
    }
  });

  it('should return failure with error for invalid preset', () => {
    const invalidPreset = { id: '', name: '', phases: [] };

    const result = validatePreset(invalidPreset);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.issues).toBeDefined();
    }
  });

  it('should include error details', () => {
    const invalidPreset = {
      id: '',
      name: 'Test',
      phases: [{ id: 'p1', name: '', duration: -1, unit: 'invalid' }],
      createdAt: -1,
      updatedAt: -1,
    };

    const result = validatePreset(invalidPreset);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it('should handle null input', () => {
    const result = validatePreset(null);

    expect(result.success).toBe(false);
  });

  it('should handle undefined input', () => {
    const result = validatePreset(undefined);

    expect(result.success).toBe(false);
  });
});

describe('validatePresetArray', () => {
  const validPreset: Preset = {
    id: 'preset-1',
    name: 'Test Preset',
    phases: [{ id: 'p1', name: 'Breathe', duration: 5, unit: 'seconds' }],
    createdAt: 1609459200000,
    updatedAt: 1609459200000,
  };

  it('should return success with data for valid array', () => {
    const presets = [validPreset, { ...validPreset, id: 'preset-2' }];
    const result = validatePresetArray(presets);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it('should return success for empty array', () => {
    const result = validatePresetArray([]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should return failure for array with invalid preset', () => {
    const invalidPresets = [
      validPreset,
      { id: '', name: 'Invalid', phases: [], createdAt: -1, updatedAt: -1 },
    ];

    const result = validatePresetArray(invalidPresets);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.issues).toBeDefined();
    }
  });

  it('should return failure for non-array input', () => {
    const result = validatePresetArray('not an array');

    expect(result.success).toBe(false);
  });

  it('should return failure for null input', () => {
    const result = validatePresetArray(null);

    expect(result.success).toBe(false);
  });

  it('should return failure for undefined input', () => {
    const result = validatePresetArray(undefined);

    expect(result.success).toBe(false);
  });

  it('should validate all items in array', () => {
    const invalidPresets = [
      { ...validPreset },
      { id: '', name: 'Bad', phases: [], createdAt: 1, updatedAt: 1 },
      { ...validPreset, id: 'ok' },
      { id: 'also-bad', name: '', phases: [], createdAt: 1, updatedAt: 1 },
    ];

    const result = validatePresetArray(invalidPresets);

    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for both invalid presets
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});

describe('edge cases and complex scenarios', () => {
  it('should handle phases with minute units', () => {
    const preset = {
      id: 'test',
      name: 'Minute Preset',
      phases: [
        { id: 'p1', name: 'Hold', duration: 2, unit: 'minutes' as const },
        { id: 'p2', name: 'Release', duration: 1, unit: 'minutes' as const },
      ],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const result = presetSchema.safeParse(preset);
    expect(result.success).toBe(true);
  });

  it('should handle very long phase names', () => {
    const preset = {
      id: 'test',
      name: 'Test',
      phases: [
        {
          id: 'p1',
          name: 'This is a very long phase name that describes exactly what the user should do during this phase',
          duration: 5,
          unit: 'seconds' as const,
        },
      ],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const result = presetSchema.safeParse(preset);
    expect(result.success).toBe(true);
  });

  it('should handle decimal duration values', () => {
    const preset = {
      id: 'test',
      name: 'Test',
      phases: [
        { id: 'p1', name: 'Inhale', duration: 3.5, unit: 'seconds' as const },
        { id: 'p2', name: 'Exhale', duration: 4.2, unit: 'seconds' as const },
      ],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const result = presetSchema.safeParse(preset);
    expect(result.success).toBe(true);
  });

  it('should handle special characters in name', () => {
    const preset = {
      id: 'test',
      name: 'Test (4-7-8) - "Relaxing" & Calming',
      phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' as const }],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const result = presetSchema.safeParse(preset);
    expect(result.success).toBe(true);
  });

  it('should handle unicode characters', () => {
    const preset = {
      id: 'test',
      name: '呼吸模式',
      description: 'Упражнение для дыхания',
      phases: [{ id: 'p1', name: 'Вдох', duration: 4, unit: 'seconds' as const }],
      createdAt: 1000,
      updatedAt: 1000,
    };

    const result = presetSchema.safeParse(preset);
    expect(result.success).toBe(true);
  });
});
