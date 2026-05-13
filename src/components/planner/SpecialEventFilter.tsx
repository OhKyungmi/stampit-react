import { useShowStore } from '../../store/showStore';

interface SpecialEventFilterProps {
  showId: string;
  selectedEventId: string | null;
  onChange: (id: string | null) => void;
}

/** V-04: 특별 이벤트 필터 — "이벤트" 라벨 + 32px 칩 */
export default function SpecialEventFilter({
  showId,
  selectedEventId,
  onChange,
}: SpecialEventFilterProps) {
  const { shows, schedules } = useShowStore();
  const show = shows.find(s => s.id === showId);

  const usedIds = new Set(
    schedules
      .filter(s => s.showId === showId)
      .flatMap(s => s.specialEventIds ?? [])
  );

  const usedEvents = (show?.specialEvents ?? []).filter(
    e => !e.isDeleted && usedIds.has(e.id)
  );

  if (usedEvents.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-gray-400 flex-shrink-0 font-medium">이벤트</span>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
            selectedEventId === null
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          전체
        </button>
        {usedEvents.map(e => (
          <button
            key={e.id}
            data-testid={`event-filter-${e.id}`}
            onClick={() => onChange(selectedEventId === e.id ? null : e.id)}
            className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
              selectedEventId === e.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>
    </div>
  );
}
