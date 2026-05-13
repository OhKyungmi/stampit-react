interface StampCountPickerProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  disabled?: boolean;
  eventLabel?: string; // 이벤트 자동 설정 시 표시할 문구
}

const DOT_COUNT = [1, 2, 3] as const;

/** 도장 개수 선택기 — 스탬프 아이콘으로 직관적 표현 */
export default function StampCountPicker({
  value,
  onChange,
  label = '도장 적립',
  disabled = false,
  eventLabel,
}: StampCountPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {eventLabel && (
          <span className="ml-1 text-xs text-indigo-500 font-normal">{eventLabel}</span>
        )}
      </label>
      <div className="flex gap-2">
        {DOT_COUNT.map(count => {
          const selected = value === count;
          return (
            <button
              key={count}
              type="button"
              data-testid={`multiplier-${count}`}
              aria-selected={value === count ? 'true' : 'false'}
              disabled={disabled}
              onClick={() => onChange(count)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl min-h-[64px] transition-colors border-2 ${
                selected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-transparent bg-gray-100 active:bg-gray-200'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* 도장 도트 */}
              <div className="flex gap-1 justify-center">
                {Array.from({ length: count }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      selected ? 'bg-indigo-500' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              {/* 개수 텍스트 */}
              <span className={`text-xs font-semibold ${
                selected ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {count}개
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
