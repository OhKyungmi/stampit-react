import { describe, test, expect } from 'vitest';
import {
  nowKST,
  todayKSTString,
  formatKSTDate,
  formatMonthDay,
  isDateInRange,
  KST_OFFSET,
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('KST_OFFSET', () => {
    test('is 9 * 60 minutes', () => {
      expect(KST_OFFSET).toBe(540);
    });
  });

  describe('nowKST', () => {
    test('returns a Date object', () => {
      const result = nowKST();
      expect(result).toBeInstanceOf(Date);
    });

    test('returns a valid date', () => {
      const result = nowKST();
      expect(isNaN(result.getTime())).toBe(false);
    });
  });

  describe('todayKSTString', () => {
    test('returns YYYY-MM-DD format', () => {
      const result = todayKSTString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('returns valid date string', () => {
      const result = todayKSTString();
      const [y, m, d] = result.split('-').map(Number);
      expect(y).toBeGreaterThan(2020);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(12);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(31);
    });

    test('format has zero-padded month and day', () => {
      const result = todayKSTString();
      const parts = result.split('-');
      expect(parts[1].length).toBe(2);
      expect(parts[2].length).toBe(2);
    });
  });

  describe('formatKSTDate', () => {
    test('formats 2025-05-10 correctly', () => {
      const result = formatKSTDate('2025-05-10');
      expect(result).toBe('2025년 5월 10일');
    });

    test('formats single-digit month', () => {
      const result = formatKSTDate('2025-01-05');
      expect(result).toBe('2025년 1월 5일');
    });

    test('formats December 31', () => {
      const result = formatKSTDate('2024-12-31');
      expect(result).toBe('2024년 12월 31일');
    });

    test('includes 년 월 일 markers', () => {
      const result = formatKSTDate('2025-06-15');
      expect(result).toContain('년');
      expect(result).toContain('월');
      expect(result).toContain('일');
    });
  });

  describe('formatMonthDay', () => {
    test('returns correct month for January (1월)', () => {
      const result = formatMonthDay('2025-01-15');
      expect(result.month).toBe('1월');
    });

    test('returns correct month for December (12월)', () => {
      const result = formatMonthDay('2025-12-01');
      expect(result.month).toBe('12월');
    });

    test('returns correct day', () => {
      const result = formatMonthDay('2025-05-25');
      expect(result.day).toBe(25);
    });

    test('returns correct day of week (일 for Sunday)', () => {
      // 2025-01-05 is a Sunday
      const result = formatMonthDay('2025-01-05');
      expect(result.dow).toBe('일');
    });

    test('returns correct day of week (월 for Monday)', () => {
      // 2025-01-06 is a Monday
      const result = formatMonthDay('2025-01-06');
      expect(result.dow).toBe('월');
    });

    test('returns correct day of week (토 for Saturday)', () => {
      // 2025-01-04 is a Saturday
      const result = formatMonthDay('2025-01-04');
      expect(result.dow).toBe('토');
    });

    test('returns object with correct keys', () => {
      const result = formatMonthDay('2025-03-15');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('dow');
    });
  });

  describe('isDateInRange', () => {
    test('returns true for in-range date', () => {
      expect(isDateInRange('2025-05-15', '2025-05-01', '2025-05-31')).toBe(true);
    });

    test('returns false for date before start', () => {
      expect(isDateInRange('2025-04-30', '2025-05-01', '2025-05-31')).toBe(false);
    });

    test('returns false for date after end', () => {
      expect(isDateInRange('2025-06-01', '2025-05-01', '2025-05-31')).toBe(false);
    });

    test('returns true for date equal to start', () => {
      expect(isDateInRange('2025-05-01', '2025-05-01', '2025-05-31')).toBe(true);
    });

    test('returns true for date equal to end', () => {
      expect(isDateInRange('2025-05-31', '2025-05-01', '2025-05-31')).toBe(true);
    });

    test('handles open-ended range (no end date)', () => {
      expect(isDateInRange('2025-12-31', '2025-01-01')).toBe(true);
    });

    test('returns false for open-ended range when before start', () => {
      expect(isDateInRange('2024-12-31', '2025-01-01')).toBe(false);
    });

    test('returns true for exact date match on start with no end', () => {
      expect(isDateInRange('2025-01-01', '2025-01-01')).toBe(true);
    });
  });
});
