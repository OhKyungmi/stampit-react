import { describe, test, expect } from 'vitest';
import { calcFinalPrice, calcPriceDiff, formatMoney } from '../../utils/priceCalc';
import type { SeatGrade, DiscountType } from '../../types';

function makeGrade(price: number): SeatGrade {
  return { id: 'g1', name: 'VIP', price };
}

function makeDiscount(method: DiscountType['method'], value: number): DiscountType {
  return { id: 'd1', name: '할인', method, value, isRebook: false, isCoupon: false };
}

describe('calcFinalPrice', () => {
  // rate method
  test('rate 30% discount', () => {
    expect(calcFinalPrice(makeGrade(100000), makeDiscount('rate', 30))).toBe(70000);
  });

  test('rate 0% no discount', () => {
    expect(calcFinalPrice(makeGrade(50000), makeDiscount('rate', 0))).toBe(50000);
  });

  test('rate 99% near-free', () => {
    expect(calcFinalPrice(makeGrade(100000), makeDiscount('rate', 99))).toBe(1000);
  });

  test('rate floors result', () => {
    // 99000 * (1 - 0.30) = 69300 (already integer, but test with non-round)
    expect(calcFinalPrice(makeGrade(99999), makeDiscount('rate', 30))).toBe(69999);
  });

  test('rate floors fractional result', () => {
    // 10000 * 0.7 = 7000, but 10001 * 0.7 = 7000.7 -> 7000
    expect(calcFinalPrice(makeGrade(10001), makeDiscount('rate', 30))).toBe(7000);
  });

  // amount method
  test('amount discount', () => {
    expect(calcFinalPrice(makeGrade(50000), makeDiscount('amount', 10000))).toBe(40000);
  });

  test('amount discount does not go below 0', () => {
    expect(calcFinalPrice(makeGrade(5000), makeDiscount('amount', 10000))).toBe(0);
  });

  test('amount discount exact zero', () => {
    expect(calcFinalPrice(makeGrade(10000), makeDiscount('amount', 10000))).toBe(0);
  });

  // direct method
  test('direct returns value as-is', () => {
    expect(calcFinalPrice(makeGrade(100000), makeDiscount('direct', 45000))).toBe(45000);
  });

  test('direct ignores grade price', () => {
    expect(calcFinalPrice(makeGrade(999), makeDiscount('direct', 50000))).toBe(50000);
  });
});

describe('calcPriceDiff', () => {
  test('positive diff when upgrading to more expensive', () => {
    const prev = { grade: makeGrade(50000), discount: makeDiscount('rate', 0) };
    const next = { grade: makeGrade(80000), discount: makeDiscount('rate', 0) };
    expect(calcPriceDiff(prev, next)).toBe(30000);
  });

  test('negative diff when downgrading', () => {
    const prev = { grade: makeGrade(80000), discount: makeDiscount('rate', 0) };
    const next = { grade: makeGrade(50000), discount: makeDiscount('rate', 0) };
    expect(calcPriceDiff(prev, next)).toBe(-30000);
  });

  test('zero when same price', () => {
    const prev = { grade: makeGrade(50000), discount: makeDiscount('rate', 0) };
    const next = { grade: makeGrade(50000), discount: makeDiscount('rate', 0) };
    expect(calcPriceDiff(prev, next)).toBe(0);
  });

  test('diff with discount applied', () => {
    const prev = { grade: makeGrade(100000), discount: makeDiscount('rate', 50) }; // 50000
    const next = { grade: makeGrade(100000), discount: makeDiscount('amount', 10000) }; // 90000
    expect(calcPriceDiff(prev, next)).toBe(40000);
  });
});

describe('formatMoney', () => {
  test('formats with Korean 원 suffix', () => {
    expect(formatMoney(50000)).toContain('원');
  });

  test('formats with comma separator for large numbers', () => {
    expect(formatMoney(1000000)).toBe('1,000,000원');
  });

  test('formats small number', () => {
    expect(formatMoney(0)).toBe('0원');
  });

  test('formats thousands', () => {
    expect(formatMoney(50000)).toBe('50,000원');
  });
});
