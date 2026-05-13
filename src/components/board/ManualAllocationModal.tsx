import { useState } from 'react';
import type { StampBoard, BoardAllocation, Schedule } from '../../types';

interface ManualAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: StampBoard[];
  schedule: Schedule | null;
  onApply: (allocations: BoardAllocation[]) => void;
}

/** 수동 배분 모달 (SC-11) */
export default function ManualAllocationModal({
  isOpen,
  onClose,
  boards,
  schedule,
  onApply,
}: ManualAllocationModalProps) {
  const [allocations, setAllocations] = useState<BoardAllocation[]>(
    schedule?.boardAllocations || []
  );

  if (!isOpen || !schedule) return null;

  const totalStamps = schedule.multiplier;

  function getAllocForBoard(boardId: string): number {
    return allocations.find(a => a.boardId === boardId)?.stamps || 0;
  }

  function setAllocForBoard(boardId: string, stamps: number) {
    setAllocations(prev => {
      const existing = prev.find(a => a.boardId === boardId);
      if (existing) {
        return prev.map(a => a.boardId === boardId ? { ...a, stamps } : a);
      }
      return [...prev, { boardId, stamps }];
    });
  }

  const totalAssigned = allocations.reduce((sum, a) => sum + a.stamps, 0);
  const isValid = totalAssigned === totalStamps;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">도장 배분 수정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          총 <span className="text-indigo-600 font-semibold">{totalStamps}개</span>의 도장을 배분해주세요
          {!isValid && (
            <span className="text-red-500 ml-2">
              (현재 {totalAssigned}개 배분됨)
            </span>
          )}
        </p>

        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {boards
            .filter(b => b.isActive && !b.isCompleted)
            .map(board => {
              const isConfirmed = schedule.isConfirmed;
              const currentStamps = board.stamps.filter(s => s.scheduleId === schedule.id).length;

              return (
                <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{board.name}</p>
                    <p className="text-xs text-gray-400">
                      현재 {board.stamps.length} / {board.capacity}개
                    </p>
                  </div>
                  {isConfirmed ? (
                    // 확정된 스케줄: 잠금 표시
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{currentStamps}개</span>
                      <span className="text-gray-400">🔒</span>
                    </div>
                  ) : (
                    // 미확정: 편집 가능
                    <input
                      type="number"
                      min={0}
                      max={board.capacity - board.stamps.length + getAllocForBoard(board.id)}
                      value={getAllocForBoard(board.id)}
                      onChange={e => setAllocForBoard(board.id, Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  )}
                </div>
              );
            })}
        </div>

        <button
          onClick={() => { onApply(allocations); onClose(); }}
          disabled={!isValid}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          적용
        </button>
      </div>
    </div>
  );
}
