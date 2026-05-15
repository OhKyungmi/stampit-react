import { useState } from 'react';
import type { Benefit, StampBoard } from '../../types';
import { useShowStore } from '../../store/showStore';

interface BenefitAchievedModalProps {
  isOpen: boolean;
  showId: string;
  boardId: string;
  boardName: string;
  board?: StampBoard | null;
  totalBoardCount?: number;
  benefit: Benefit | null;
  stampCount: number;
  isLastBenefit: boolean;
  onContinue: () => void;
  /** "직접 설정하기" → AddBoardSheet 오픈 (PlannerTab이 완성 처리 + 시트 오픈) */
  onNewBoard: () => void;
  onGoToStatus?: (benefitId: string) => void;
}

/** 혜택 달성 모달 (SC-09 / U-09) */
export default function BenefitAchievedModal({
  isOpen,
  showId,
  boardId,
  boardName,
  board,
  totalBoardCount = 1,
  benefit,
  stampCount,
  isLastBenefit,
  onContinue,
  onNewBoard,
  onGoToStatus,
}: BenefitAchievedModalProps) {
  const { updateBenefitNote, createNextBoard, updateStampBoard } = useShowStore();
  const [usageNote, setUsageNote] = useState('');
  const [boardNameInput, setBoardNameInput] = useState('');
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  if (!isOpen || !benefit) return null;

  const defaultName = `${totalBoardCount + 1}판`;

  function saveNote() {
    if (usageNote.trim() && benefit) {
      updateBenefitNote(showId, boardId, benefit.id, usageNote.trim());
    }
  }

  function handleGoToStatus() {
    saveNote();
    onGoToStatus?.(benefit!.id);
  }

  // "새 판 시작하기" — 이전 판 설정 복사, 즉시 생성
  function handleQuickNewBoard() {
    saveNote();
    createNextBoard({
      showId,
      name: boardNameInput.trim() || defaultName,
      capacity: board?.capacity ?? 10,
      sourceBenefits: board?.benefits ?? [],
      stampColor: board?.stampColor,
    });
    updateStampBoard(showId, boardId, { isCompleted: true, isActive: false });
    onContinue();
  }

  // "직접 설정하기" — AddBoardSheet 오픈 (PlannerTab이 처리)
  function handleCustomNewBoard() {
    saveNote();
    onNewBoard();
  }

  // "계속 이어서 찍기" — 모달만 닫기
  function handleContinue() {
    saveNote();
    onContinue();
  }

  // 중간 혜택(마지막 아님)에서 새 판 추가 (완성 처리 없이)
  function handleAddBoardOnly() {
    saveNote();
    onNewBoard();
  }

  const sortedBenefits = board
    ? [...board.benefits].sort((a, b) => a.requiredStamps - b.requiredStamps)
    : [];

  return (
    <div data-testid="benefit-achieved-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* 헤더 */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">혜택 달성!</h2>
            <p className="text-sm text-gray-500">{boardName}</p>
            <p className="text-indigo-600 font-semibold mt-1.5">★ {benefit.description}</p>
          </div>

          <hr className="border-gray-100 mb-4" />

          {/* 사용 방법 메모 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1.5">
              사용 방법 메모 <span className="text-gray-400 font-normal">(선택)</span>
            </p>
            <textarea
              value={usageNote}
              onChange={e => setUsageNote(e.target.value)}
              maxLength={100}
              rows={2}
              placeholder="예: 예매처 마이페이지 → 쿠폰함"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 resize-none"
              data-testid="input-usage-note"
            />
          </div>

          <hr className="border-gray-100 mb-4" />

          {isLastBenefit ? (
            /* ── 마지막 혜택: 새 판 시작 UI ── */
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 text-center">다음 도장판을 시작할까요?</p>

              {/* 이전 판 설정 카드 */}
              {board && (
                <button
                  type="button"
                  onClick={() => setSettingsExpanded(v => !v)}
                  className="w-full text-left p-3 bg-indigo-50 border border-indigo-100 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 text-sm font-medium">✓ 이전 판과 동일하게 시작</span>
                    </div>
                    <span className="text-xs text-indigo-400">{settingsExpanded ? '▲' : '▼'}</span>
                  </div>
                  {!settingsExpanded && (
                    <p className="text-xs text-indigo-400 mt-0.5">
                      {board.capacity}칸 · 혜택 {board.benefits.length}개
                    </p>
                  )}
                  {settingsExpanded && (
                    <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-10 shrink-0">칸 수</span>
                        <span className="font-medium">{board.capacity}칸</span>
                      </div>
                      {sortedBenefits.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-10 shrink-0">혜택</span>
                          <div className="space-y-0.5">
                            {sortedBenefits.map(b => (
                              <p key={b.id} className="font-medium">
                                {b.requiredStamps}개 → {b.description}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {board.stampColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-10 shrink-0">색상</span>
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: board.stampColor }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )}

              {/* 판 이름 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">판 이름 <span className="text-gray-400">(선택)</span></p>
                <input
                  type="text"
                  value={boardNameInput}
                  onChange={e => setBoardNameInput(e.target.value)}
                  placeholder={defaultName}
                  maxLength={20}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
                  data-testid="input-next-board-name"
                />
              </div>

              {/* 버튼 */}
              <button
                data-testid="btn-quick-new-board"
                onClick={handleQuickNewBoard}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 min-h-[44px]"
              >
                새 판 시작하기
              </button>
              <button
                data-testid="btn-custom-new-board"
                onClick={handleCustomNewBoard}
                className="w-full py-2.5 text-indigo-500 text-sm font-medium active:text-indigo-700 min-h-[44px]"
              >
                직접 설정하기
              </button>
              <button
                data-testid="btn-benefit-continue"
                onClick={handleContinue}
                className="w-full py-2.5 text-gray-400 text-sm font-medium active:text-gray-600 min-h-[44px]"
              >
                계속 이어서 찍기
              </button>
            </div>
          ) : (
            /* ── 중간 혜택: 간단 UI ── */
            <div className="space-y-2">
              {onGoToStatus && (
                <button
                  data-testid="btn-go-to-status"
                  onClick={handleGoToStatus}
                  className="w-full py-3 border-2 border-indigo-500 text-indigo-600 rounded-xl font-semibold text-sm active:bg-indigo-50 min-h-[44px]"
                >
                  현황에서 확인하기
                </button>
              )}
              <button
                data-testid="btn-benefit-continue"
                onClick={handleContinue}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 min-h-[44px]"
              >
                계속하기
              </button>
              <button
                data-testid="btn-benefit-new-board"
                onClick={handleAddBoardOnly}
                className="w-full py-2.5 text-gray-500 text-sm font-medium active:text-gray-700 min-h-[44px]"
              >
                새 도장판 만들기
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">
            {boardName} {stampCount}개 달성
          </p>
        </div>
      </div>
    </div>
  );
}
