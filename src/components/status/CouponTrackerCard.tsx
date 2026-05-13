import type { StampBoard } from '../../types';

const COUPON_KEYWORDS = ['할인쿠폰', '할쿠'];

function isCouponBenefit(desc: string): boolean {
  return COUPON_KEYWORDS.some(kw => desc.includes(kw));
}

export function getCouponStats(boards: StampBoard[]) {
  let total = 0;
  let used = 0;
  for (const board of boards) {
    for (const benefit of board.benefits) {
      if (isCouponBenefit(benefit.description) && benefit.isAchieved) {
        total++;
        if (benefit.isUsed) used++;
      }
    }
  }
  return { total, used, remaining: total - used };
}

interface CouponTrackerCardProps {
  boards: StampBoard[];
  onTap?: () => void;
  showAmount?: boolean;
}

export default function CouponTrackerCard({ boards, onTap, showAmount = false }: CouponTrackerCardProps) {
  const { total, used, remaining } = getCouponStats(boards);
  if (total === 0) return null;

  const blurCls = showAmount ? '' : 'blur-sm select-none';

  return (
    <button
      onClick={onTap}
      className="w-full px-4 py-3 bg-indigo-50 rounded-xl active:bg-indigo-100 text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎫</span>
          <span className="text-sm font-semibold text-indigo-800">할인쿠폰</span>
        </div>
        <span className="text-xs text-indigo-300">이력 보기 ›</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-400 mb-0.5">보유</p>
          <p className={`text-base font-bold text-indigo-600 ${blurCls}`}>{remaining}개</p>
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-400 mb-0.5">사용</p>
          <p className={`text-base font-bold text-gray-500 ${blurCls}`}>{used}개</p>
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-400 mb-0.5">총</p>
          <p className={`text-base font-bold text-gray-700 ${blurCls}`}>{total}개</p>
        </div>
      </div>
    </button>
  );
}
