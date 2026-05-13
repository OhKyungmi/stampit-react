export const KST_OFFSET = 9 * 60; // minutes

/** UTC 기준으로 KST 현재 시각을 반환합니다 */
export function nowKST(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + KST_OFFSET * 60000);
}

/** KST 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다 */
export function todayKSTString(): string {
  const d = nowKST();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2025-05-10" → "2025년 5월 10일" */
export function formatKSTDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

/** 날짜 문자열에서 월/일/요일 추출 */
export function formatMonthDay(dateStr: string): { month: string; day: number; dow: string } {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(dateStr + 'T00:00:00');
  return { month: months[d.getMonth()], day: d.getDate(), dow: dows[d.getDay()] };
}

/** 날짜가 범위 안에 있는지 확인합니다 */
export function isDateInRange(date: string, start: string, end?: string): boolean {
  if (date < start) return false;
  if (end && date > end) return false;
  return true;
}
