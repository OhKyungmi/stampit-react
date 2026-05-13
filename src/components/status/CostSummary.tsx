import type { Schedule } from '../../types';
import { formatMoney } from '../../utils/priceCalc';

interface CostSummaryProps {
  schedules: Schedule[];
  showRealCost: boolean;
  showAmount?: boolean; // 블러 해제 여부 (기본 false = 블러)
}

/** 비용 요약 컴포넌트 (SC-13) */
export default function CostSummary({ schedules, showRealCost, showAmount = false }: CostSummaryProps) {
  // 나눔 관극 제외 (isShare=true 스케줄은 비용에서 제외)
  const confirmed = schedules.filter(s => s.isConfirmed && !s.isShare);

  if (!showRealCost) {
    return (
      <div data-testid="cost-summary-hidden" className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
        <p className="text-sm text-gray-400">실 지출 표시가 꺼져 있어요.</p>
      </div>
    );
  }

  const totalOriginal = confirmed.reduce((sum, s) => sum + s.originalPrice, 0);
  const totalDiscount = confirmed.reduce((sum, s) => sum + (s.originalPrice - s.finalPrice), 0);
  const totalActual = confirmed.reduce((sum, s) => sum + s.finalPrice, 0);

  return (
    <div className="relative p-4 bg-white rounded-2xl border border-gray-100 shadow-sm" data-testid="cost-summary">
      {/* 블러 마스크 오버레이 */}
      {!showAmount && (
        <div
          data-testid="cost-blur-mask"
          className="absolute inset-0 rounded-2xl backdrop-blur-sm bg-white/30 z-10 flex items-center justify-center"
        >
          <span className="text-xs text-gray-400">👁 탭하여 보기</span>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">총 정가</span>
          <span className="text-gray-700">{formatMoney(totalOriginal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">총 할인</span>
          <span className="text-emerald-600">-{formatMoney(totalDiscount)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
          <span className="text-gray-800">실 지출</span>
          <span data-testid="cost-total" className="text-indigo-600">{formatMoney(totalActual)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">확정된 {confirmed.length}회 기준 (나눔 관극 제외)</p>
    </div>
  );
}
