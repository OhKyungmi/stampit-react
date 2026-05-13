import type { Schedule } from '../types';

const SEPARATORS = [' / ', ' & ', ', '];

/** 최근 확정 캐스트 목록 (중복 제거, 최신순) */
export function getRecentCasts(schedules: Schedule[], showId: string, limit = 5): string[] {
  return [...new Set(
    schedules
      .filter(s => s.showId === showId && s.isConfirmed && s.cast)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(s => s.cast!)
  )].slice(0, limit);
}

export function parseCastPairs(cast: string): string[] {
  for (const sep of SEPARATORS) {
    if (cast.includes(sep)) return cast.split(sep).map(s => s.trim());
  }
  return [cast.trim()];
}

export function buildPairStats(schedules: Schedule[]): Record<string, number> {
  return schedules
    .filter(s => s.isConfirmed && s.cast)
    .reduce((acc, s) => {
      const key = parseCastPairs(s.cast!).join(' / ');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}
