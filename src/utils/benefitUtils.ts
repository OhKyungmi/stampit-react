export const NO_USE_KEYWORDS = [
  '대본집', '스토리북', '폴라로이드', '폴라', '포토북',
  '메모리북', '히스토리 노트', 'OST', '실황 OST', '미니 OST',
  '오슷', '가사집',
];

/** 수집형 혜택 여부 — "사용완료" 버튼 미노출 대상 */
export function isNoUseBenefit(desc: string): boolean {
  return NO_USE_KEYWORDS.some(kw => desc.includes(kw));
}

export const COUPON_KEYWORDS = ['쿠폰', '할쿠', '할인권'];

/** 할인권/쿠폰형 혜택 여부 */
export function isCouponBenefit(desc: string): boolean {
  return COUPON_KEYWORDS.some(kw => desc.includes(kw));
}
