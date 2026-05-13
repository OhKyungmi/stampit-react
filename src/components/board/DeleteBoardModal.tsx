interface DeleteBoardModalProps {
  isOpen: boolean;
  boardName: string;
  confirmedStampCount: number;
  onCancel: () => void;
  onHide: () => void;
}

/**
 * Case C 도장판 삭제 경고 모달
 * 확정 도장이 있는 판 삭제 시 → 소프트 딜리트(숨기기) 유도
 */
export default function DeleteBoardModal({
  isOpen,
  boardName,
  confirmedStampCount,
  onCancel,
  onHide,
}: DeleteBoardModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onCancel}
    >
      {/* 딤 처리 */}
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full max-w-md bg-white rounded-t-2xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* 경고 아이콘 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-800">확정된 관람 기록이 있어요</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-1">
          <span className="font-semibold text-gray-800">"{boardName}"</span>에는 확정된 도장{' '}
          <span className="font-bold text-amber-600">{confirmedStampCount}개</span>가 연결되어 있어요.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          삭제하면 도장판은 숨겨지지만 관람 기록은 유지돼요.
          설정에서 복구하거나 완전히 삭제할 수 있어요.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm min-h-[44px]"
          >
            취소
          </button>
          <button
            onClick={onHide}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm min-h-[44px]"
          >
            숨기기
          </button>
        </div>
      </div>
    </div>
  );
}
