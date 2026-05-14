import { useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import type { StampBoard } from '../../types';
import { runSimulator, planNewBoards, planWithGuarantee } from '../../utils/simulator';
import type { NewBoardPlan, GuaranteedPlanResult } from '../../utils/simulator';

// ─── 신규 도장판 플랜 비교 섹션 ───────────────────────────────────────────────

interface NewBoardPlansSectionProps {
  boards: StampBoard[];
  leftoverViews: number;
}

function NewBoardPlansSection({ boards, leftoverViews }: NewBoardPlansSectionProps) {
  const templateBoard = boards
    .filter(b => b.isActive && !b.isCompleted && !b.isHidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

  // 템플릿 판이 없거나 혜택이 없는 경우 → 단순 안내
  if (!templateBoard || templateBoard.benefits.length === 0) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
        <span className="text-lg shrink-0">🆕</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">새 도장판이 필요해요</p>
          <p className="text-xs text-amber-700 mt-0.5">
            현재 도장판이 꽉 차서{' '}
            <span className="font-bold">{leftoverViews}회</span>{' '}
            관람분을 적립할 곳이 없어요.
          </p>
        </div>
      </div>
    );
  }

  const plans = planNewBoards(templateBoard, leftoverViews);

  // 관람 횟수가 너무 적어 어떤 판도 완성 불가
  if (plans.length === 0) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
        <span className="text-lg shrink-0">🆕</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">새 도장판이 필요해요</p>
          <p className="text-xs text-amber-700 mt-0.5">
            남은 <span className="font-bold">{leftoverViews}회</span>로는
            새 도장판 혜택을 달성하기 어려워요.
          </p>
        </div>
      </div>
    );
  }

  const recommended = plans.find(p => p.isRecommended)!;

  // 추천 플랜보다 혜택 종류가 더 많은 플랜들 (하위 우선순위 혜택 포함)
  const upgradePlans = plans.filter(
    p => !p.isRecommended && p.benefitsPerBoard.length > recommended.benefitsPerBoard.length,
  );

  return (
    <div className="space-y-3">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-base">🆕</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">새 도장판을 추가하면?</p>
          <p className="text-xs text-gray-400">남은 {leftoverViews}회로 가능한 플랜이에요</p>
        </div>
      </div>

      {/* 플랜 카드 목록 */}
      {plans.map(plan => (
        <PlanCard key={plan.targetThreshold} plan={plan} />
      ))}

      {/* 보장 시나리오 카드 — 추천 플랜에 없는 혜택을 1개 받으려는 경우 */}
      {upgradePlans.map(altPlan => {
        const extraBenefits = altPlan.benefitsPerBoard.filter(
          b => !recommended.benefitsPerBoard.some(r => r.requiredStamps === b.requiredStamps),
        );
        if (extraBenefits.length === 0) return null;
        const gr = planWithGuarantee(templateBoard, leftoverViews, altPlan.targetThreshold);
        if (!gr) return null;
        return (
          <GuaranteeScenarioCard
            key={altPlan.targetThreshold}
            extraBenefitNames={extraBenefits.map(b => b.description)}
            result={gr}
          />
        );
      })}

      <p className="text-xs text-gray-400 text-center">
        실제 도장판 추가는 플래너에서 직접 해주세요.
      </p>
    </div>
  );
}

function PlanCard({ plan }: { plan: NewBoardPlan }) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-sm ${
        plan.isRecommended
          ? 'border-indigo-300 bg-indigo-50'
          : 'border-gray-100 bg-white'
      }`}
    >
      {/* 카드 헤더 */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          plan.isRecommended
            ? 'bg-indigo-100 border-indigo-200'
            : 'bg-gray-50 border-gray-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {plan.isRecommended && (
            <span className="text-[10px] font-bold text-white bg-indigo-500 rounded-full px-2 py-0.5 leading-none">
              추천
            </span>
          )}
          <span className="text-sm font-semibold text-gray-800">
            {plan.targetThreshold}회 달성 플랜
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {plan.newBoardsCount}개 판 · 잔여 {plan.leftoverAfter}회
        </span>
      </div>

      {/* 혜택 목록 */}
      <div className="px-4 py-3">
        <p className="text-[11px] text-gray-400 mb-1.5">
          판당 달성 혜택 ({plan.benefitsPerBoard.length}가지)
        </p>
        <div className="space-y-1">
          {plan.benefitsPerBoard.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-amber-400 text-xs shrink-0">★</span>
              <span className="text-sm text-gray-700 flex-1">{b.description}</span>
              <span className="text-[11px] text-gray-400 shrink-0">{b.requiredStamps}회째</span>
            </div>
          ))}
        </div>
        <p className={`text-xs font-semibold mt-2 ${plan.isRecommended ? 'text-indigo-600' : 'text-gray-500'}`}>
          → 총 혜택 {plan.totalNewBenefits}개 달성
        </p>
      </div>
    </div>
  );
}

interface GuaranteeScenarioCardProps {
  extraBenefitNames: string[];   // 추천 플랜에 없는 혜택 이름들 (보장 대상)
  result: GuaranteedPlanResult;
}

/** "만약 X를 1개 받으려면?" 시나리오 카드 */
function GuaranteeScenarioCard({ extraBenefitNames, result }: GuaranteeScenarioCardProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-2.5 bg-amber-100 border-b border-amber-200">
        <p className="text-sm font-semibold text-amber-900">
          💬 만약 {extraBenefitNames.join(', ')}을 1개 받으려면?
        </p>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* 배분 세그먼트 */}
        <div className="space-y-1.5">
          {result.segments.map((seg, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[11px] font-bold text-amber-700 shrink-0 w-8 text-right">
                {seg.count}개
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-700">{seg.threshold}회 도장판</span>
                <span className="text-xs text-gray-400">
                  {' '}· {seg.benefitsPerBoard.map(b => b.description).join(' + ')}
                </span>
              </div>
            </div>
          ))}
          {result.leftoverAfter > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 shrink-0 w-8 text-right">잔여</span>
              <span className="text-xs text-gray-400">{result.leftoverAfter}회 (혜택 없음)</span>
            </div>
          )}
        </div>

        {/* 최종 달성 혜택 */}
        <div className="pt-2 border-t border-amber-200">
          <p className="text-[11px] text-amber-700 font-semibold mb-1.5">최종 달성 혜택</p>
          <div className="flex flex-wrap gap-1.5">
            {result.benefitSummary.map((b, i) => (
              <span
                key={i}
                className="text-xs bg-amber-200 text-amber-900 rounded-full px-2.5 py-0.5 font-medium"
              >
                {b.description} {b.total}개
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SimulatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  boards: StampBoard[];
}

export default function SimulatorSheet({ isOpen, onClose, boards }: SimulatorSheetProps) {
  const [views, setViews] = useState(5);

  const targetBoards = boards.filter(b => b.isActive && !b.isCompleted && !b.isHidden);
  const result = views > 0 && targetBoards.length > 0
    ? runSimulator(boards, views)
    : null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="배분 시뮬레이터" testId="simulator-sheet">
      <div className="space-y-5">
        {/* 입력 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">남은 관람 횟수</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViews(v => Math.max(1, v - 1))}
              disabled={views <= 1}
              className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center active:bg-gray-200 disabled:opacity-30"
            >
              −
            </button>
            <input
              data-testid="simulator-input"
              type="number"
              value={views}
              onChange={e => setViews(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
              className="w-14 text-center text-lg font-bold text-gray-900 border border-gray-200 rounded-xl px-1 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              min={1}
              max={99}
            />
            <button
              onClick={() => setViews(v => Math.min(99, v + 1))}
              disabled={views >= 99}
              className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg flex items-center justify-center active:bg-gray-200 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {/* 빈 상태: 활성 판 없음 또는 결과 없음 */}
        {targetBoards.length === 0 && (
          <p data-testid="simulator-empty" className="text-sm text-gray-400 text-center py-6">
            활성화된 도장판이 없어요.<br />새 판을 추가해 보세요.
          </p>
        )}
        {targetBoards.length > 0 && result && result.boardResults.length === 0 && (
          <p data-testid="simulator-empty" className="text-sm text-gray-400 text-center py-6">
            시뮬레이션 결과가 없어요.
          </p>
        )}

        {/* 결과 */}
        {result && result.boardResults.length > 0 && (
          <div className="space-y-3">
            {/* 결과 헤더 */}
            <div className="px-4 py-3 bg-indigo-50 rounded-2xl text-center">
              <p className="text-sm text-indigo-700">
                <span className="font-bold text-indigo-900">{views}회</span> 관람 시{' '}
                혜택 총{' '}
                <span className="font-bold text-indigo-600 text-base">{result.totalBenefits}개</span>{' '}
                달성 가능
              </p>
            </div>

            {/* 신규 도장판 플랜 — 도장판이 꽉 차 잔여 관람이 남은 경우 */}
            {result.leftoverViews > 0 && (
              <NewBoardPlansSection
                boards={boards}
                leftoverViews={result.leftoverViews}
              />
            )}

            {/* 도장판별 결과 카드 */}
            {result.boardResults.map(r => {
              const board = boards.find(b => b.id === r.boardId);
              const currentStamps = board?.stamps.length ?? 0;
              const capacity = board?.capacity ?? 0;

              return (
                <div
                  key={r.boardId}
                  data-testid={`simulator-result-${r.boardId}`}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* 헤더 */}
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{r.boardName}</span>
                    <span className="text-xs text-gray-400">
                      +{r.stampsAdded}개 → 총 {currentStamps + r.stampsAdded} / {capacity}
                    </span>
                  </div>

                  {/* 달성 혜택 */}
                  <div className="px-4 py-3">
                    {r.achievedBenefits.length === 0 ? (
                      <p className="text-xs text-gray-400">이번 관람으로 달성되는 혜택이 없어요</p>
                    ) : (
                      <div className="space-y-1.5">
                        {r.achievedBenefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-amber-400 text-xs shrink-0">★</span>
                            <span className="text-sm text-amber-700 font-medium">{b.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 안내 문구 */}
        <p data-testid="simulator-notice" className="text-xs text-gray-400 text-center pt-1">
          시뮬레이션 결과는 실제 데이터에 영향을 주지 않아요.
        </p>
      </div>
    </BottomSheet>
  );
}
