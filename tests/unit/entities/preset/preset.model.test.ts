/**
 * Unit tests for preset.model
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createPreset,
  updatePreset,
  clonePreset,
  generateId,
} from '../../../../src/entities/preset/preset.model';
import type { Preset, Phase, PresetCreateInput, PresetUpdateInput } from '../../../../src/entities/preset/preset.types';
import { validatePhase, validatePreset, validateUniquePresetIds } from '../../../../src/entities/preset/validation';

describe('preset.model', () => {
  describe('createPreset generates unique IDs', () => {
    it('should generate a unique ID for the preset', () => {
      const input: PresetCreateInput = {
        name: 'Test Preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
      };

      const preset1 = createPreset(input);
      const preset2 = createPreset(input);

      expect(preset1.id).toBeDefined();
      expect(preset2.id).toBeDefined();
      expect(preset1.id).not.toBe(preset2.id);
    });

    it('should generate unique IDs for all phases', () => {
      const input: PresetCreateInput = {
        name: 'Test Preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Hold', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
      };

      const preset = createPreset(input);
      const phaseIds = preset.phases.map((p) => p.id);

      expect(phaseIds).toHaveLength(3);
      expect(new Set(phaseIds).size).toBe(3); // All unique
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      const input: PresetCreateInput = {
        name: 'Test Preset',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      };

      const preset = createPreset(input);

      expect(preset.createdAt).toBe(1234567890);
      expect(preset.updatedAt).toBe(1234567890);

      mockDateNow.mockRestore();
    });

    it('should copy all input properties to the preset', () => {
      const input: PresetCreateInput = {
        name: 'Test Preset',
        description: 'A test preset',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 5,
        themeColor: '#FF0000',
      };

      const preset = createPreset(input);

      expect(preset.name).toBe('Test Preset');
      expect(preset.description).toBe('A test preset');
      expect(preset.totalCycles).toBe(5);
      expect(preset.themeColor).toBe('#FF0000');
      expect(preset.phases).toHaveLength(2);
    });
  });

  describe('updatePreset merges changes correctly', () => {
    let preset: Preset;

    beforeEach(() => {
      preset = createPreset({
        name: 'Original Preset',
        description: 'Original description',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 3,
        themeColor: '#0000FF',
      });
    });

    it('should update name when provided', () => {
      const updated = updatePreset(preset, { name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(preset.id); // ID unchanged
    });

    it('should update description when provided', () => {
      const updated = updatePreset(preset, { description: 'New description' });

      expect(updated.description).toBe('New description');
    });

    it('should update phases when provided', () => {
      const newPhases: Phase[] = [
        { id: 'p1', name: 'Hold', duration: 2, unit: 'seconds' },
        { id: 'p2', name: 'Release', duration: 2, unit: 'seconds' },
      ];

      const updated = updatePreset(preset, { phases: newPhases });

      expect(updated.phases).toEqual(newPhases);
    });

    it('should update totalCycles when provided', () => {
      const updated = updatePreset(preset, { totalCycles: 10 });

      expect(updated.totalCycles).toBe(10);
    });

    it('should update themeColor when provided', () => {
      const updated = updatePreset(preset, { themeColor: '#FF00FF' });

      expect(updated.themeColor).toBe('#FF00FF');
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = preset.updatedAt;

      vi.spyOn(Date, 'now').mockReturnValue(9999999999);
      const updated = updatePreset(preset, { name: 'Updated' });
      vi.restoreAllMocks();

      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
      expect(updated.updatedAt).toBe(9999999999);
    });

    it('should preserve unchanged properties', () => {
      const updated = updatePreset(preset, { name: 'Updated Name' });

      expect(updated.id).toBe(preset.id);
      expect(updated.description).toBe(preset.description);
      expect(updated.phases).toEqual(preset.phases);
      expect(updated.totalCycles).toBe(preset.totalCycles);
      expect(updated.themeColor).toBe(preset.themeColor);
      expect(updated.createdAt).toBe(preset.createdAt);
    });

    it('should not update optional fields when undefined is passed', () => {
      const updated = updatePreset(preset, {
        description: undefined,
        themeColor: undefined,
      });

      // updatePreset uses `!== undefined` check, so undefined means "don't update"
      // The original values should be preserved
      expect(updated.description).toBe(preset.description);
      expect(updated.themeColor).toBe(preset.themeColor);
      expect(updated.name).toBe(preset.name);
    });

    it('should throw error for invalid update data', () => {
      expect(() =>
        updatePreset(preset, { name: '' })
      ).toThrow('Invalid preset');
    });

    it('should validate updated preset before returning', () => {
      const invalidPhases: Phase[] = [
        { id: 'p1', name: '', duration: 4, unit: 'seconds' },
      ];

      expect(() =>
        updatePreset(preset, { phases: invalidPhases })
      ).toThrow('Invalid preset');
    });
  });

  describe('clonePreset creates duplicate with new IDs', () => {
    it('should create a new preset with different ID', () => {
      const original = createPreset({
        name: 'Original',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      });

      const clone = clonePreset(original);

      expect(clone.id).not.toBe(original.id);
    });

    it('should create new IDs for all phases', () => {
      const original = createPreset({
        name: 'Original',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
      });

      const clone = clonePreset(original);

      const originalPhaseIds = original.phases.map((p) => p.id);
      const clonePhaseIds = clone.phases.map((p) => p.id);

      expect(originalPhaseIds).not.toEqual(clonePhaseIds);
    });

    it('should copy all other properties', () => {
      const original = createPreset({
        name: 'Original Preset',
        description: 'Original description',
        phases: [
          { name: 'Inhale', duration: 4, unit: 'seconds' },
          { name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 5,
        themeColor: '#00FF00',
      });

      const clone = clonePreset(original);

      expect(clone.name).toBe(original.name);
      expect(clone.description).toBe(original.description);
      expect(clone.totalCycles).toBe(original.totalCycles);
      expect(clone.themeColor).toBe(original.themeColor);
      expect(clone.phases.length).toBe(original.phases.length);
      clone.phases.forEach((phase, i) => {
        expect(phase.name).toBe(original.phases[i].name);
        expect(phase.duration).toBe(original.phases[i].duration);
        expect(phase.unit).toBe(original.phases[i].unit);
      });
    });

    it('should set new timestamps for clone', () => {
      const original = createPreset({
        name: 'Original',
        phases: [{ name: 'Inhale', duration: 4, unit: 'seconds' }],
      });

      vi.spyOn(Date, 'now').mockReturnValue(9999999999);
      const clone = clonePreset(original);
      vi.restoreAllMocks();

      expect(clone.createdAt).not.toBe(original.createdAt);
      expect(clone.updatedAt).not.toBe(original.updatedAt);
      expect(clone.createdAt).toBe(9999999999);
      expect(clone.updatedAt).toBe(9999999999);
    });
  });

  describe('validatePhase accepts valid phases', () => {
    it('should validate a phase with all valid properties', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Inhale',
        duration: 4,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept "minutes" as a valid unit', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Hold',
        duration: 2,
        unit: 'minutes',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(true);
    });

    it('should accept zero duration', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Pause',
        duration: 0,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(true);
    });

    it('should accept large duration values', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Long Hold',
        duration: 3600,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(true);
    });
  });

  describe('validatePhase rejects invalid values', () => {
    it('should reject negative duration', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Inhale',
        duration: -5,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.duration')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('non-negative'))).toBe(true);
    });

    it('should reject empty name', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: '',
        duration: 4,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.name')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('cannot be empty'))).toBe(true);
    });

    it('should reject whitespace-only name', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: '   ',
        duration: 4,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.name')).toBe(true);
    });

    it('should reject invalid unit', () => {
      const phase: Phase = {
        id: 'phase-1',
        name: 'Inhale',
        duration: 4,
        unit: 'hours' as any,
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.unit')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('must be one of'))).toBe(true);
    });

    it('should reject empty id', () => {
      const phase: Phase = {
        id: '',
        name: 'Inhale',
        duration: 4,
        unit: 'seconds',
      };

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.id')).toBe(true);
    });

    it('should reject missing id', () => {
      const phase = {
        name: 'Inhale',
        duration: 4,
        unit: 'seconds',
      } as any;

      const result = validatePhase(phase);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'phase.id')).toBe(true);
    });
  });

  describe('validatePreset accepts valid presets', () => {
    it('should validate a complete preset', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: '4-7-8 Breathing',
        description: 'A calming technique',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
          { id: 'p2', name: 'Hold', duration: 7, unit: 'seconds' },
          { id: 'p3', name: 'Exhale', duration: 8, unit: 'seconds' },
        ],
        totalCycles: 4,
        themeColor: '#4A90E2',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept preset with optional fields omitted', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Simple Breathing',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
          { id: 'p2', name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: undefined, // Infinite
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(true);
    });

    it('should accept preset with totalCycles = 1', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Single Cycle',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(true);
    });

    it('should accept preset with many phases', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Complex Pattern',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
          { id: 'p2', name: 'Hold1', duration: 4, unit: 'seconds' },
          { id: 'p3', name: 'Exhale', duration: 4, unit: 'seconds' },
          { id: 'p4', name: 'Hold2', duration: 4, unit: 'seconds' },
          { id: 'p5', name: 'Inhale2', duration: 2, unit: 'seconds' },
        ],
        totalCycles: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(true);
    });
  });

  describe('validatePreset rejects invalid values', () => {
    it('should reject empty phases array', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Empty Preset',
        phases: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.phases')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('at least one phase'))).toBe(true);
    });

    it('should reject empty name', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: '',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.name')).toBe(true);
    });

    it('should reject totalCycles less than 1', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Invalid Cycles',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.totalCycles')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('>= 1'))).toBe(true);
    });

    it('should reject negative totalCycles', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Negative Cycles',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        totalCycles: -5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.totalCycles')).toBe(true);
    });

    it('should reject preset with invalid phases', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Bad Phases',
        phases: [
          { id: 'p1', name: '', duration: 4, unit: 'seconds' }, // Invalid: empty name
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('phases[0].name'))).toBe(true);
    });

    it('should reject invalid createdAt timestamp', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Bad Timestamp',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        createdAt: -1,
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.createdAt')).toBe(true);
    });

    it('should reject invalid updatedAt timestamp', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Bad Timestamp',
        phases: [
          { id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' },
        ],
        createdAt: Date.now(),
        updatedAt: -100,
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'preset.updatedAt')).toBe(true);
    });

    it('should reject preset with duplicate phase IDs', () => {
      const preset: Preset = {
        id: 'preset-1',
        name: 'Duplicate Phase IDs',
        phases: [
          { id: 'duplicate-id', name: 'Inhale', duration: 4, unit: 'seconds' },
          { id: 'duplicate-id', name: 'Exhale', duration: 4, unit: 'seconds' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validatePreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('unique'))).toBe(true);
    });
  });

  describe('validateUniquePresetIds finds duplicates', () => {
    it('should accept array with unique IDs', () => {
      const presets: Preset[] = [
        {
          id: 'preset-1',
          name: 'First',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-2',
          name: 'Second',
          phases: [{ id: 'p2', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-3',
          name: 'Third',
          phases: [{ id: 'p3', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateUniquePresetIds(presets);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should find duplicate preset IDs', () => {
      const presets: Preset[] = [
        {
          id: 'preset-1',
          name: 'First',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-1', // Duplicate
          name: 'Second',
          phases: [{ id: 'p2', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateUniquePresetIds(presets);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('preset-1');
    });

    it('should find multiple duplicate IDs', () => {
      const presets: Preset[] = [
        {
          id: 'preset-1',
          name: 'First',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-1', // Duplicate
          name: 'Second',
          phases: [{ id: 'p2', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-2',
          name: 'Third',
          phases: [{ id: 'p3', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'preset-2', // Duplicate
          name: 'Fourth',
          phases: [{ id: 'p4', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateUniquePresetIds(presets);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('preset-1');
      expect(result.errors[0].message).toContain('preset-2');
    });

    it('should handle empty array', () => {
      const result = validateUniquePresetIds([]);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single preset', () => {
      const presets: Preset[] = [
        {
          id: 'preset-1',
          name: 'Only One',
          phases: [{ id: 'p1', name: 'Inhale', duration: 4, unit: 'seconds' }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = validateUniquePresetIds(presets);

      expect(result.valid).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(1000);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate IDs with timestamp prefix', () => {
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890);
      const id = generateId();
      mockDateNow.mockRestore();

      expect(id).toContain('1234567890');
    });

    it('should generate IDs with random suffix', () => {
      const id1 = generateId();
      // Need to advance time slightly or mock to get different timestamp
      const mockDateNow = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      const id2 = generateId();
      mockDateNow.mockRestore();

      expect(id1).not.toBe(id2);
    });
  });
});
