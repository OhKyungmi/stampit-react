import { useState, useEffect } from 'react';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import type { SeatGrade, DiscountType } from '../../types';
import { calcFinalPrice, formatMoney } from '../../utils/priceCalc';
import { calcPriceDiff } from '../../utils/priceUtils';
import { colors } from '../../constants/tokens';

interface TicketChangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  prevGrade: SeatGrade | null;
  prevDiscount: DiscountType | null;
  prevFinalPrice: number;
  seatGrades: SeatGrade[];
  discountTypes: DiscountType[];
  onSave: (gradeId: string, discountId: string, method: 'recalculate' | 'note-only') => void;
}

type DiffMethod = 'recalculate' | 'note-only';

export default function TicketChangeSheet({
  isOpen,
  onClose,
  prevGrade,
  prevDiscount,
  prevFinalPrice,
  seatGrades,
  discountTypes,
  onSave,
}: TicketChangeSheetProps) {
  const [newGradeId, setNewGradeId] = useState('');
  const [newDiscountId, setNewDiscountId] = useState('');
  const [method, setMethod] = useState<DiffMethod>('recalculate');

  const activeDiscountTypes = discountTypes.filter(d => !d.isDeleted);

  useEffect(() => {
    if (isOpen) {
      setNewGradeId(prevGrade?.id || seatGrades[0]?.id || '');
      setNewDiscountId(prevDiscount?.id || activeDiscountTypes[0]?.id || '');
      setMethod('recalculate');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const newGrade = seatGrades.find(g => g.id === newGradeId) || null;
  const newDiscount = activeDiscountTypes.find(d => d.id === newDiscountId) || null;

  const newFinalPrice = newGrade && newDiscount
    ? calcFinalPrice(newGrade, newDiscount)
    : prevFinalPrice;

  // 차액: prevFinalPrice 기준 (실제 기록 금액)
  const priceDiff = newGrade && newDiscount
    ? calcPriceDiff(prevFinalPrice, newGrade, newDiscount)
    : 0;

  const hasDiff = priceDiff !== 0;

  // 변경 후 카드에 표시할 금액 (모드에 따라 실시간 반영)
  const displayedNewPrice = method === 'recalculate' ? newFinalPrice : prevFinalPrice;

  function handleSave() {
    if (!newGrade || !newDiscount) return;
    // diff 없으면 항상 recalculate
    onSave(newGradeId, newDiscountId, hasDiff ? method : 'recalculate');
    onClose();
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="티켓 변경"
      testId="bottomsheet-ticket-change"
      footer={
        <Button
          data-testid="btn-ticket-change-save"
          onClick={handleSave}
          disabled={!newGrade || !newDiscount}
          fullWidth
        >
          변경 저장
        </Button>
      }
    >
      <div className="space-y-4">

        {/* ── 변경 전/후 비교 카드 ───────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {/* 변경 전 */}
          <div className="p-[14px] bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-medium text-gray-400 mb-2">변경 전</p>
            <p className="text-sm font-semibold text-gray-700 leading-snug">{prevGrade?.name ?? '-'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{prevDiscount?.name ?? '-'}</p>
            <p className="text-[15px] font-bold text-gray-900 mt-2">{formatMoney(prevFinalPrice)}</p>
          </div>

          {/* 변경 후 */}
          <div className="p-[14px] bg-indigo-50 rounded-xl border border-indigo-200">
            <p className="text-[11px] font-medium text-indigo-500 mb-2">변경 후</p>
            <p className="text-sm font-semibold text-indigo-700 leading-snug">{newGrade?.name ?? '-'}</p>
            <p className="text-xs text-indigo-400 mt-0.5">{newDiscount?.name ?? '-'}</p>
            <p data-testid="ticket-after-price" className="text-[15px] font-bold text-indigo-700 mt-2">{formatMoney(displayedNewPrice)}</p>
            {/* 차액 — 양수/음수 모두 red (환급 없으므로) */}
            {hasDiff && (
              <p data-testid="price-diff" className="text-[13px] font-semibold mt-0.5" style={{ color: colors.danger[500] }}>
                {priceDiff > 0 ? '+' : ''}{formatMoney(priceDiff)}
              </p>
            )}
          </div>
        </div>

        {/* ── 새 좌석 등급 ────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 좌석 등급</label>
          <select
            data-testid="select-new-grade"
            value={newGradeId}
            onChange={e => setNewGradeId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {seatGrades.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({formatMoney(g.price)})</option>
            ))}
          </select>
        </div>

        {/* ── 새 할인권종 ─────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 할인권종</label>
          <select
            data-testid="select-new-discount"
            value={newDiscountId}
            onChange={e => setNewDiscountId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {activeDiscountTypes.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* ── 차액 처리 방식 (diff !== 0 시만) ────────── */}
        {hasDiff && (
          <div data-testid="price-diff-method" className="space-y-2">
            <p className="text-[12px] font-semibold text-gray-400 tracking-[0.2px]">차액 처리 방식</p>

            {/* 금액 재계산 */}
            <label
              className="flex items-start gap-3 cursor-pointer"
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderColor: method === 'recalculate' ? colors.primary[600] : colors.gray[200],
                background: method === 'recalculate' ? colors.primary[50] : colors.white,
              }}
            >
              <input
                data-testid="radio-recalculate"
                type="radio"
                name="diffMethod"
                value="recalculate"
                checked={method === 'recalculate'}
                onChange={() => setMethod('recalculate')}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: colors.primary[600], flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: colors.gray[900] }}>금액 재계산</p>
                <p style={{ fontSize: '12px', color: colors.gray[500], marginTop: '2px' }}>
                  결제 금액을 {formatMoney(newFinalPrice)}으로 변경해요
                </p>
              </div>
            </label>

            {/* 기록만 남기기 */}
            <label
              className="flex items-start gap-3 cursor-pointer"
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderColor: method === 'note-only' ? colors.primary[600] : colors.gray[200],
                background: method === 'note-only' ? colors.primary[50] : colors.white,
              }}
            >
              <input
                data-testid="radio-note-only"
                type="radio"
                name="diffMethod"
                value="note-only"
                checked={method === 'note-only'}
                onChange={() => setMethod('note-only')}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: colors.primary[600], flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: colors.gray[900] }}>기록만 남기기</p>
                <p data-testid="radio-note-only-desc" style={{ fontSize: '12px', color: colors.gray[500], marginTop: '2px' }}>
                  {formatMoney(prevFinalPrice)} 유지, 변경 내용만 메모로 기록해요
                </p>
              </div>
            </label>
          </div>
        )}

      </div>
    </BottomSheet>
  );
}
