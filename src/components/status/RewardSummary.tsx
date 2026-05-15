import { useState } from 'react';
import type { StampBoard } from '../../types';
import { useShowStore } from '../../store/showStore';
import ConfirmDialog from '../common/ConfirmDialog';
import Toast from '../common/Toast';
import { isNoUseBenefit } from '../../utils/benefitUtils';

interface RewardSummaryProps {
  showId: string;
  boards: StampBoard[];
}

interface ConfirmTarget {
  showId: string;
  boardId: string;
  benefitId: string;
  description: string;
  isCollectible: boolean;
}

function formatUsedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 혜택 행 인라인 노트 편집 */
function NoteField({
  showId,
  boardId,
  benefitId,
  initialNote,
}: {
  showId: string;
  boardId: string;
  benefitId: string;
  initialNote?: string;
}) {
  const { updateBenefitNote } = useShowStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNote ?? '');

  function handleBlur() {
    updateBenefitNote(showId, boardId, benefitId, value.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        maxLength={100}
        placeholder="사용 방법 메모"
        className="mt-0.5 w-full text-xs text-gray-600 border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400"
        data-testid="input-note-edit"
      />
    );
  }

  if (value) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-0.5 text-left text-[12px] text-gray-400 leading-snug"
        data-testid="note-display"
      >
        📝 {value}
      </button>
    );
  }

  return null;
}


/** V-09: 혜택 현황 */
export default function RewardSummary({ showId, boards }: RewardSummaryProps) {
  const { useBenefit, unuseBenefit } = useShowStore();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeBoards = boards.filter(b => !b.isCompleted);
  const hasAnyBenefit = boards.some(b => b.benefits.length > 0);

  function handleUseBenefit() {
    if (!confirmTarget) return;
    useBenefit(confirmTarget.showId, confirmTarget.boardId, confirmTarget.benefitId);
    setConfirmTarget(null);
  }

  if (!hasAnyBenefit) {
    return <p className="text-sm text-gray-400 text-center py-4">설정된 혜택이 없습니다</p>;
  }

  return (
    <>
      <div className="space-y-3" data-testid="benefit-section">
        {activeBoards.map(board => {
          const sorted = [...board.benefits].sort((a, b) => a.requiredStamps - b.requiredStamps);
          if (sorted.length === 0) return null;
          const stampCount = board.stamps.length;

          return (
            <div key={board.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* 판 헤더 */}
              <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">{board.name}</span>
                <span className="text-xs text-gray-400">{stampCount} / {board.capacity}개</span>
              </div>

              {/* 혜택 목록 */}
              <div className="divide-y divide-gray-50">
                {sorted.map(benefit => {
                  const isAchieved = benefit.isAchieved;
                  const isUsed = benefit.isUsed;
                  const remaining = benefit.requiredStamps - stampCount;
                  const isCollectible = isNoUseBenefit(benefit.description);
                  const canUse = isAchieved && !isUsed;

                  // 행 스타일 3가지 케이스
                  const rowClass = isUsed
                    ? 'opacity-[0.55] px-4 py-2.5 flex items-start gap-3'
                    : canUse
                    ? 'bg-amber-50 border-l-[3px] border-l-amber-500 pl-[13px] pr-4 py-2.5 flex items-start gap-3'
                    : 'px-4 py-2.5 flex items-start gap-3';

                  return (
                    <div
                      key={benefit.id}
                      data-benefit-id={benefit.id}
                      className={rowClass}
                      data-testid={`benefit-row-${benefit.id}`}
                    >
                      {/* 상태 아이콘 */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                        isUsed ? 'bg-gray-300 text-white'
                        : isAchieved ? 'bg-amber-400 text-white'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isAchieved ? '★' : benefit.requiredStamps}
                      </div>

                      {/* 텍스트 */}
                      <div className="flex-1 min-w-0">
                        <p data-testid="benefit-name" className={`text-sm ${
                          isUsed
                            ? 'line-through text-gray-400'
                            : isAchieved
                            ? 'text-gray-800 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {benefit.description}
                        </p>
                        {!isAchieved && remaining > 0 && (
                          <p className="text-xs text-gray-400">{remaining}개 남음</p>
                        )}
                        {isUsed && benefit.usedAt && (
                          <p className="text-xs text-gray-400">
                            {formatUsedAt(benefit.usedAt)} {isCollectible ? '수령' : '사용'}
                          </p>
                        )}
                        {isAchieved && !isUsed && (
                          <NoteField
                            showId={showId}
                            boardId={board.id}
                            benefitId={benefit.id}
                            initialNote={benefit.usageNote}
                          />
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      {canUse && (
                        <button
                          data-testid="btn-use-benefit"
                          onClick={() => setConfirmTarget({ showId, boardId: board.id, benefitId: benefit.id, description: benefit.description, isCollectible })}
                          className="shrink-0 px-3 bg-amber-500 text-white rounded-lg text-xs font-semibold active:bg-amber-600 h-[32px] flex items-center"
                        >
                          {isCollectible ? '수령' : '사용'}
                        </button>
                      )}
                      {isUsed && (
                        <button
                          data-testid="btn-unuse-benefit"
                          onClick={() => {
                            unuseBenefit(showId, board.id, benefit.id);
                            setToastMessage(isCollectible ? '수령 완료가 취소되었습니다' : '사용 완료가 취소되었습니다');
                          }}
                          className="shrink-0 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs active:bg-gray-200 min-h-[32px]"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget?.isCollectible ? '수령 완료' : '혜택 사용 완료'}
        message={
          confirmTarget?.isCollectible
            ? `"${confirmTarget.description}" 혜택을 수령 완료 처리할까요?`
            : `"${confirmTarget?.description}" 혜택을 사용 완료 처리할까요?`
        }
        confirmLabel={confirmTarget?.isCollectible ? '수령 완료' : '사용 완료'}
        cancelLabel="취소"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleUseBenefit}
        confirmTestId="btn-use-confirm"
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}
