import type { SeatGrade, DiscountType } from '../types';
import { calcFinalPrice } from './priceCalc';

/**
 * 이전 실제 결제 금액(prevFinalPrice)과 새 등급/권종 조합의 차액을 계산한다.
 *
 * 전제:
 * - prevFinalPrice: 일정에 기록된 실제 금액 (재계산 값이 아님)
 * - 반환값 양수 = 추가 결제 발생, 음수 = 가격 하락, 0 = 동일
 * - 환급 여부는 앱이 판단하지 않음
 */
export function calcPriceDiff(
  prevFinalPrice: number,
  newGrade: SeatGrade,
  newDiscount: DiscountType
): number {
  return calcFinalPrice(newGrade, newDiscount) - prevFinalPrice;
}
