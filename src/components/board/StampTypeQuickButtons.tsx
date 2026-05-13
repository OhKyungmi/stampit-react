interface StampTypeQuickButtonsProps {
  onSelect: (type: 'exchange' | 'share' | 'etc') => void;
}

const TYPES = [
  { value: 'exchange' as const, label: '+ 교환', emoji: '🔄' },
  { value: 'share' as const, label: '+ 나눔', emoji: '🎁' },
  { value: 'etc' as const, label: '+ 기타', emoji: '✏️' },
];

/** B-04 취득 경로 인라인 퀵버튼 */
export default function StampTypeQuickButtons({ onSelect }: StampTypeQuickButtonsProps) {
  return (
    <div className="flex gap-1.5 pt-2 border-t border-gray-100 mt-2">
      {TYPES.map(t => (
        <button
          key={t.value}
          data-testid={`btn-stamp-${t.value}`}
          onClick={e => { e.stopPropagation(); onSelect(t.value); }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-medium active:bg-gray-100 transition-colors min-h-[44px]"
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
