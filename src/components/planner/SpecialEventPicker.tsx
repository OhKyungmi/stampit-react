import { useShowStore } from '../../store/showStore';

interface SpecialEventPickerProps {
  showId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onOpenSheet: () => void;
}

/** 특별 이벤트 칩 선택기 — 복수 선택 가능 */
export default function SpecialEventPicker({
  showId,
  selectedIds,
  onChange,
  onOpenSheet,
}: SpecialEventPickerProps) {
  const { shows } = useShowStore();
  const show = shows.find(s => s.id === showId);
  const events = (show?.specialEvents ?? []).filter(e => !e.isDeleted);

  if (events.length === 0) return null;

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">특별 이벤트 (선택)</label>
      <div className="flex flex-wrap gap-2">
        {events.map(e => (
          <button
            key={e.id}
            type="button"
            data-testid={`event-chip-${e.id}`}
            onClick={() => toggle(e.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedIds.includes(e.id)
                ? 'bg-amber-400 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenSheet}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
        >
          + 새 이벤트
        </button>
      </div>
    </div>
  );
}
