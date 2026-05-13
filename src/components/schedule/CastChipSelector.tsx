import { useState } from 'react';

interface CastChipSelectorProps {
  value: string;
  onChange: (v: string) => void;
  recentCasts: string[];
}

const CHIP_SHOW_LIMIT = 4;

/** 캐스트 칩 선택기 (B-06) */
export default function CastChipSelector({ value, onChange, recentCasts }: CastChipSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  const [directMode, setDirectMode] = useState(recentCasts.length === 0);

  const visibleCasts = showAll ? recentCasts : recentCasts.slice(0, CHIP_SHOW_LIMIT);
  const hiddenCount = recentCasts.length - CHIP_SHOW_LIMIT;

  function handleChipClick(cast: string) {
    if (value === cast) {
      // 선택 해제
      onChange('');
    } else {
      onChange(cast);
      setDirectMode(false);
    }
  }

  function handleDirectMode() {
    setDirectMode(d => !d);
    if (directMode) onChange('');
  }

  return (
    <div className="space-y-2">
      {/* 칩 목록 */}
      {recentCasts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleCasts.map(cast => {
            const selected = value === cast && !directMode;
            return (
              <button
                key={cast}
                type="button"
                onClick={() => handleChipClick(cast)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[32px] ${
                  selected
                    ? 'bg-amber-400 border-amber-400 text-white'
                    : 'bg-white border-gray-200 text-gray-700 active:border-amber-300'
                }`}
              >
                {cast}
              </button>
            );
          })}

          {/* 더보기 */}
          {!showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500 bg-white active:bg-gray-50 min-h-[32px]"
            >
              더보기 +{hiddenCount}
            </button>
          )}

          {/* 직접 입력 토글 */}
          <button
            type="button"
            onClick={handleDirectMode}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[32px] ${
              directMode
                ? 'bg-gray-700 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-500 active:border-gray-400'
            }`}
          >
            ✏️ 직접 입력
          </button>
        </div>
      )}

      {/* 직접 입력 인풋 */}
      {directMode && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="캐스트를 입력하세요 (예: 홍길동/김영희)"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          data-testid="input-cast-direct"
        />
      )}
    </div>
  );
}
