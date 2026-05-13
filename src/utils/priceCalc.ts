import type { SeatGrade, DiscountType } from '../types';

/** 최종 가격을 계산합니다 */
export function calcFinalPrice(grade: SeatGrade, discount: DiscountType): number {
  switch (discount.method) {
    case 'rate':
      return Math.floor(grade.price * (1 - discount.value / 100));
    case 'amount':
      return Math.max(0, grade.price - discount.value);
    case 'direct':
      return discount.value;
  }
}

/** 두 가격 조합 간의 차액을 계산합니다 (양수=추가 비용) */
export function calcPriceDiff(
  prev: { grade: SeatGrade; discount: DiscountType },
  next: { grade: SeatGrade; discount: DiscountType }
): number {
  return calcFinalPrice(next.grade, next.discount) - calcFinalPrice(prev.grade, prev.discount);
}

/** 금액을 한국 원화 형식으로 포맷합니다 */
export function formatMoney(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}
