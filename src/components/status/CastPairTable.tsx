import { useState } from 'react';
import type { Schedule } from '../../types';
import { parseCastPairs, buildPairStats } from '../../utils/castUtils';

interface CastPairTableProps {
  schedules: Schedule[];
}

const FOLD_THRESHOLD = 3;

/** B-03 캐스트 조합 통계 테이블 */
export default function CastPairTable({ schedules }: CastPairTableProps) {
  const [showAll, setShowAll] = useState(false);

  // 구분자로 분리되는 일정만 (멤버 2명 이상)
  const pairSchedules = schedules.filter(
    s => s.isConfirmed && s.cast && parseCastPairs(s.cast).length >= 2
  );

  if (pairSchedules.length === 0) return null;

  const stats = buildPairStats(pairSchedules);
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  const visible = showAll ? sorted : sorted.slice(0, FOLD_THRESHOLD);
  const hiddenCount = sorted.length - FOLD_THRESHOLD;

  return (
    <div className="border-t border-gray-50 pt-3 space-y-1">
      <p className="text-xs font-medium text-gray-500 mb-2">페어 조합</p>
      {visible.map(([combo, count]) => (
        <div key={combo} className="flex items-center justify-between py-0.5">
          <p className="text-xs text-gray-700 flex-1 truncate mr-2">{combo}</p>
          <span className="text-xs font-semibold text-indigo-500 shrink-0">{count}회</span>
        </div>
      ))}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-gray-400 pt-1 hover:text-gray-600 transition-colors"
        >
          더보기 ({hiddenCount}개) ▾
        </button>
      )}
      {showAll && sorted.length > FOLD_THRESHOLD && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-gray-400 pt-1 hover:text-gray-600 transition-colors"
        >
          접기 ▴
        </button>
      )}
    </div>
  );
}
