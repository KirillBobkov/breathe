import { describe, it, expect } from 'vitest';
import { pluralize, MINUTES_FORMS, SECONDS_FORMS, CYCLES_FORMS } from './pluralize';

describe('pluralize', () => {
  describe('form1 (1)', () => {
    it('handles 1', () => {
      expect(pluralize(1, MINUTES_FORMS)).toBe('минута');
      expect(pluralize(1, SECONDS_FORMS)).toBe('секунда');
      expect(pluralize(1, CYCLES_FORMS)).toBe('цикл');
    });

    it('handles 21, 31, 41...', () => {
      expect(pluralize(21, MINUTES_FORMS)).toBe('минута');
      expect(pluralize(31, MINUTES_FORMS)).toBe('минута');
      expect(pluralize(101, MINUTES_FORMS)).toBe('минута');
    });
  });

  describe('form2 (2-4)', () => {
    it('handles 2-4', () => {
      expect(pluralize(2, MINUTES_FORMS)).toBe('минуты');
      expect(pluralize(3, MINUTES_FORMS)).toBe('минуты');
      expect(pluralize(4, MINUTES_FORMS)).toBe('минуты');
    });

    it('handles 22-24, 32-34...', () => {
      expect(pluralize(22, MINUTES_FORMS)).toBe('минуты');
      expect(pluralize(23, MINUTES_FORMS)).toBe('минуты');
      expect(pluralize(24, MINUTES_FORMS)).toBe('минуты');
      expect(pluralize(102, MINUTES_FORMS)).toBe('минуты');
    });
  });

  describe('form5 (5+, except 11-14)', () => {
    it('handles 5-10', () => {
      expect(pluralize(5, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(8, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(10, MINUTES_FORMS)).toBe('минут');
    });

    it('handles 25-30, 35-40...', () => {
      expect(pluralize(25, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(30, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(100, MINUTES_FORMS)).toBe('минут');
    });
  });

  describe('exception 11-14', () => {
    it('handles 11-14 with form5', () => {
      expect(pluralize(11, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(12, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(13, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(14, MINUTES_FORMS)).toBe('минут');
    });

    it('handles 111-114 with form5', () => {
      expect(pluralize(111, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(114, MINUTES_FORMS)).toBe('минут');
    });
  });

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(pluralize(0, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(0, CYCLES_FORMS)).toBe('циклов');
    });

    it('handles large numbers', () => {
      expect(pluralize(1000, MINUTES_FORMS)).toBe('минут');
      expect(pluralize(1001, MINUTES_FORMS)).toBe('минута');
      expect(pluralize(1002, MINUTES_FORMS)).toBe('минуты');
    });
  });
});
