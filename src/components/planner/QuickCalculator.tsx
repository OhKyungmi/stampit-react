import { useState } from 'react';
import type { SeatGrade, DiscountType } from '../../types';
import { calcFinalPrice, formatMoney } from '../../utils/priceCalc';

interface QuickCalculatorProps {
  seatGrades: SeatGrade[];
  discountTypes: DiscountType[];
}

/** V-03: 빠른 가격 계산기 */
export default function QuickCalculator({ seatGrades, discountTypes }: QuickCalculatorProps) {
  const [gradeId, setGradeId] = useState(seatGrades[0]?.id || '');
  const [discountId, setDiscountId] = useState(discountTypes[0]?.id || '');

  const grade = seatGrades.find(g => g.id === gradeId) || null;
  const discount = discountTypes.find(d => d.id === discountId) || null;

  const finalPrice = grade && discount ? calcFinalPrice(grade, discount) : 0;
  const savings = grade ? grade.price - finalPrice : 0;

  if (!seatGrades.length || !discountTypes.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-2">좌석 등급과 할인 종류를 먼저 설정해주세요</p>
    );
  }

  return (
    <div data-testid="quick-calc-content">
      {/* 드롭다운 */}
      <div className="flex gap-2">
        <select
          data-testid="calc-select-grade"
          value={gradeId}
          onChange={e => setGradeId(e.target.value)}
          className="flex-1 h-[44px] px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-700"
        >
          {seatGrades.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select
          data-testid="calc-select-discount"
          value={discountId}
          onChange={e => setDiscountId(e.target.value)}
          className="flex-1 h-[44px] px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-700"
        >
          {discountTypes.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* 결과 */}
      {grade && discount && (
        <div className="mt-3 bg-gray-50 rounded-lg px-[14px] py-3 space-y-0.5">
          <p className="text-[13px] text-gray-400 line-through">{formatMoney(grade.price)}</p>
          <p
            data-testid="calc-price-final"
            className="text-[22px] font-bold text-indigo-600 leading-tight"
          >
            {formatMoney(finalPrice)}
          </p>
          {savings > 0 && (
            <p className="text-[13px] text-emerald-500 font-medium">{formatMoney(savings)} 절약</p>
          )}
        </div>
      )}
    </div>
  );
}
