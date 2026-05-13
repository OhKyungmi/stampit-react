export interface CalendarDay {
  date: string | null; // YYYY-MM-DD, null = 패딩
  day: number | null;
}

/** 주어진 연/월의 7×N 달력 그리드 반환 (일요일 시작) */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month, 0).getDate();
  const grid: CalendarDay[] = [];

  for (let i = 0; i < firstDow; i++) grid.push({ date: null, day: null });

  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
    });
  }

  while (grid.length % 7 !== 0) grid.push({ date: null, day: null });

  return grid;
}

export function prevMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

export function nextMonth(year: number, month: number): [number, number] {
  return month === 12 ? [year + 1, 1] : [year, month + 1];
}
