import { useState, useEffect } from 'react';
import BottomSheet from '../common/BottomSheet';
import type { Show, SeatGrade, DiscountType } from '../../types';
import { todayKSTString } from '../../utils/dateUtils';
import { calcFinalPrice, formatMoney } from '../../utils/priceCalc';

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show;
  lastUsedSeatGradeId?: string;
  lastUsedDiscountTypeId?: string;
  /** "이대로 추가" → 미확정 일정 즉시 생성 */
  onQuickAdd: (date: string, seatGradeId: string, discountTypeId: string, finalPrice: number, originalPrice: number) => void;
  /** "처음부터 입력" → 일반 바텀시트로 전환 */
  onFullAdd: () => void;
}

/** SC-36 FAB 롱프레스 빠른 추가 시트 */
export default function QuickAddSheet({
  isOpen,
  onClose,
  show,
  lastUsedSeatGradeId,
  lastUsedDiscountTypeId,
  onQuickAdd,
  onFullAdd,
}: QuickAddSheetProps) {
  const [date, setDate] = useState(todayKSTString());

  // 시트 열릴 때 날짜 오늘로 초기화
  useEffect(() => {
    if (isOpen) setDate(todayKSTString());
  }, [isOpen]);

  // lastUsed 기준 등급/권종 찾기
  const grade: SeatGrade | null =
    show.seatGrades.find(g => g.id === lastUsedSeatGradeId) ??
    show.seatGrades[0] ??
    null;
  const discount: DiscountType | null =
    show.discountTypes.find(d => d.id === lastUsedDiscountTypeId && !d.isDeleted) ??
    show.discountTypes.find(d => !d.isDeleted) ??
    null;

  const hasLastUsed = !!grade && !!discount;
  const finalPrice = grade && discount ? calcFinalPrice(grade, discount) : 0;

  function handleQuickAdd() {
    if (!grade || !discount || !date) return;
    onQuickAdd(date, grade.id, discount.id, finalPrice, grade.price);
    onClose();
  }

  function handleFullAdd() {
    onClose();
    onFullAdd();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="⚡ 빠른 추가">
      <div className="space-y-4">
        {/* 공연명 */}
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl">
          <span className="text-lg">🎭</span>
          <div>
            <p className="text-xs text-gray-500">공연</p>
            <p className="text-sm font-semibold text-gray-800">{show.name}</p>
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📅 날짜 <span className="text-xs text-indigo-500 font-normal">(수정 가능)</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
        </div>

        {/* 등급 / 권종 / 가격 */}
        {hasLastUsed && grade && discount ? (
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <p className="text-xs text-gray-500 mb-2">💺 최근 사용 조합</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">좌석 등급</span>
              <span className="font-medium text-gray-800">{grade.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">할인권종</span>
              <span className="font-medium text-gray-800">{discount.name}</span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-gray-200 mt-1">
              <span className="text-gray-600">결제금액</span>
              <span className="font-bold text-indigo-700">{formatMoney(finalPrice)}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700">
              최근 사용 내역이 없어요. 처음부터 입력해주세요.
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleFullAdd}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium min-h-[44px]"
          >
            처음부터 입력
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={!hasLastUsed || !date}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="quick-add-btn"
          >
            이대로 추가
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
