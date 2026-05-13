import { useState } from 'react';
import { useShowStore } from '../../store/showStore';
import CastPairTable from './CastPairTable';

interface CastStatsProps {
  showId: string;
}

export default function CastStats({ showId }: CastStatsProps) {
  const { schedules } = useShowStore();
  const [expanded, setExpanded] = useState(false);

  const castSchedules = schedules.filter(
    s => s.showId === showId && s.isConfirmed && !!s.cast
  );

  if (castSchedules.length === 0) return null;

  const castCount = castSchedules.reduce((acc, s) => {
    acc[s.cast!] = (acc[s.cast!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(castCount).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] ?? 0;
  const topCasts = sorted.filter(([, count]) => count === maxCount);
  const topLabel = topCasts.length === 1
    ? topCasts[0][0]
    : `${topCasts[0][0]} 외 ${topCasts.length - 1}명`;

  return (
    <div data-testid="cast-stats-card" className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <button
        data-testid="cast-stats-header"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">캐스트 통계</span>
          <span className="text-xs text-gray-400">최다 {topLabel} {maxCount}회</span>
        </div>
        <span className="text-gray-400 text-sm">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* 축약 미리보기 (항상 표시, 클릭 영역이 헤더 버튼 아래에 위치하도록 카드 높이 확보) */}
      {!expanded && (
        <div className="px-4 pb-4 pt-1 space-y-1.5">
          {sorted.slice(0, 2).map(([name, count]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-20 truncate">{name}</span>
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-300 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
          {/* 배우별 막대 */}
          <div className="space-y-2.5 pt-3">
            {sorted.map(([name, count]) => (
              <div key={name} data-testid="cast-bar-item" className="flex items-center gap-2">
                <p className="text-xs text-gray-700 w-24 shrink-0 truncate">{name}</p>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-gray-600 w-4 text-right shrink-0">{count}</p>
              </div>
            ))}
          </div>

          {/* B-03 페어 조합 테이블 */}
          <CastPairTable schedules={castSchedules} />
        </div>
      )}
    </div>
  );
}
