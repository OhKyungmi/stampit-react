import BottomSheet from '../common/BottomSheet';
import type { StampBoard } from '../../types';

const COUPON_KEYWORDS = ['할인쿠폰', '할쿠', '할인권'];

function isCouponBenefit(desc: string): boolean {
  return COUPON_KEYWORDS.some(kw => desc.includes(kw));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

interface CouponHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  boards: StampBoard[];
}

export default function CouponHistorySheet({ isOpen, onClose, boards }: CouponHistorySheetProps) {
  // 쿠폰 혜택이 있는 판만 추출
  const boardsWithCoupons = boards
    .filter(b => b.benefits.some(ben => isCouponBenefit(ben.description)))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (boardsWithCoupons.length === 0) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="쿠폰 이력">
        <p className="text-sm text-gray-400 text-center py-8">등록된 쿠폰 혜택이 없어요.</p>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="쿠폰 이력">
      <div className="space-y-4">
        {boardsWithCoupons.map(board => {
          const coupons = board.benefits
            .filter(b => isCouponBenefit(b.description))
            .sort((a, b) => a.requiredStamps - b.requiredStamps);

          const remaining = board.capacity - board.stamps.length;

          return (
            <div key={board.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* 판 헤더 */}
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{board.name}</span>
                <span className="text-xs text-gray-400">
                  {board.stamps.length} / {board.capacity}개
                </span>
              </div>

              {/* 쿠폰 목록 */}
              <div className="divide-y divide-gray-50">
                {coupons.map(coupon => {
                  const stampsNeeded = coupon.requiredStamps - board.stamps.length;
                  const isEarned = coupon.isAchieved;
                  const isUsed = coupon.isUsed;

                  return (
                    <div key={coupon.id} className="px-4 py-3 flex items-center gap-3">
                      {/* 상태 아이콘 */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isUsed
                          ? 'bg-gray-200 text-gray-400'
                          : isEarned
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-300'
                      }`}>
                        {isUsed ? '✓' : isEarned ? '🎫' : coupon.requiredStamps}
                      </div>

                      {/* 설명 + 날짜 */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isUsed ? 'text-gray-400 line-through' : isEarned ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {coupon.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isUsed && coupon.usedAt
                            ? `${formatDate(coupon.usedAt)} 사용`
                            : isEarned
                            ? '미사용'
                            : stampsNeeded > 0
                            ? `${coupon.requiredStamps}개 달성 시 획득 · ${stampsNeeded > remaining ? '완성 후 불가' : `${stampsNeeded}개 남음`}`
                            : `${coupon.requiredStamps}개 달성 시 획득`
                          }
                        </p>
                      </div>

                      {/* 상태 뱃지 */}
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        isUsed
                          ? 'bg-gray-100 text-gray-400'
                          : isEarned
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'bg-gray-50 text-gray-300'
                      }`}>
                        {isUsed ? '사용완료' : isEarned ? '미사용' : '미달성'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-gray-400 text-center pt-1">
          혜택 현황에서 쿠폰 사용 처리를 할 수 있어요.
        </p>
      </div>
    </BottomSheet>
  );
}
