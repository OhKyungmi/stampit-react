import { useState, useRef, useEffect } from 'react';
import { useShowStore } from '../../store/showStore';

interface CastAutocompleteProps {
  showId: string;
  value: string;
  onChange: (value: string) => void;
}

/** 캐스트 자동완성 — 동일 showId 확정 일정에서 앞글자 일치 5개 제안 */
export default function CastAutocomplete({ showId, value, onChange }: CastAutocompleteProps) {
  const { schedules } = useShowStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 해당 showId 확정 일정에서 중복 제거된 cast 목록
  const allCasts = [...new Set(
    schedules
      .filter(s => s.showId === showId && s.isConfirmed && !!s.cast)
      .map(s => s.cast!)
  )];

  // 입력값 앞글자 일치 항목 최대 5개 (빈 값 제외)
  const suggestions = value.trim()
    ? allCasts.filter(c => c.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5)
    : allCasts.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <input
        data-testid="input-cast"
        value={value}
        onChange={e => { onChange(e.target.value.slice(0, 100)); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="예: 김OO(주역), 이OO(상대역)"
        maxLength={100}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              data-testid="autocomplete-item"
              onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-gray-700 text-left hover:bg-indigo-50 truncate"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
