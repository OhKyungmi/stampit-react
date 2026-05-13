import { useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import type { DiscountType, SeatGrade, Schedule } from '../../types';
import { calcFinalPrice, formatMoney } from '../../utils/priceCalc';

interface DiscountTypeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  discountTypes: DiscountType[];
  seatGrades: SeatGrade[];
  schedules: Schedule[];
  onAdd: (data: Omit<DiscountType, 'id'>) => void;
  onUpdate: (id: string, data: Partial<DiscountType>) => void;
  onDelete: (id: string) => void;
  onSoftDelete: (id: string) => void;
}

/** 할인 종류 관리 바텀 시트 (SC-05, SC-32) */
export default function DiscountTypeSheet({
  isOpen,
  onClose,
  discountTypes,
  seatGrades,
  schedules,
  onAdd,
  onUpdate,
  onDelete,
  onSoftDelete,
}: DiscountTypeSheetProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'rate' | 'amount' | 'direct'>('rate');
  const [value, setValue] = useState('');
  const [isRebook, setIsRebook] = useState(false);
  const [isCoupon, setIsCoupon] = useState(false);

  // SC-32: 삭제 확인 모달
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteStats, setPendingDeleteStats] = useState<{ draftCount: number; confirmedCount: number } | null>(null);

  function resetForm() {
    setEditId(null);
    setName('');
    setMethod('rate');
    setValue('');
    setIsRebook(false);
    setIsCoupon(false);
  }

  function startEdit(dt: DiscountType) {
    setEditId(dt.id);
    setName(dt.name);
    setMethod(dt.method);
    setValue(String(dt.value));
    setIsRebook(dt.isRebook);
    setIsCoupon(dt.isCoupon);
  }

  const numValue = Number(value);
  const isRateError = method === 'rate' && value !== '' && numValue >= 100;

  function validate(): boolean {
    if (!name.trim()) return false;
    if (isRateError) return false;
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;
    const data: Omit<DiscountType, 'id'> = {
      name: name.trim(),
      method,
      value: numValue,
      isRebook,
      isCoupon,
    };
    if (editId) {
      onUpdate(editId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleValueChange(v: string) {
    if (method === 'rate') {
      const num = Number(v);
      if (!isNaN(num)) {
        setValue(String(Math.min(num, 100)));
        return;
      }
    }
    setValue(v);
  }

  function handleDeleteRequest(dtId: string) {
    const refs = schedules.filter(s => s.discountTypeId === dtId);
    const confirmedRefs = refs.filter(s => s.isConfirmed);
    const draftRefs = refs.filter(s => !s.isConfirmed && s.status !== 'cancelled');

    if (refs.length === 0) {
      onDelete(dtId);
    } else {
      setPendingDeleteId(dtId);
      setPendingDeleteStats({ draftCount: draftRefs.length, confirmedCount: confirmedRefs.length });
    }
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    onSoftDelete(pendingDeleteId);
    setPendingDeleteId(null);
    setPendingDeleteStats(null);
  }

  function handleCancelDelete() {
    setPendingDeleteId(null);
    setPendingDeleteStats(null);
  }

  const activeDiscountTypes = discountTypes.filter(d => !d.isDeleted);

  const deleteDialogMessage = pendingDeleteStats
    ? pendingDeleteStats.confirmedCount > 0
      ? `이 권종이 적용된 확정 일정 ${pendingDeleteStats.confirmedCount}개가 있어요. 확정 일정의 금액 기록은 유지되지만, 권종명은 '(삭제된 권종)'으로 표시돼요.`
      : `이 권종이 적용된 미확정 일정 ${pendingDeleteStats.draftCount}개가 있어요. 삭제 시 해당 일정의 권종이 '미지정'으로 변경돼요.`
    : '';

  // 현재 폼 기준 미리보기용 가상 DiscountType
  const previewDiscount: DiscountType = {
    id: '_preview',
    name: name || '미리보기',
    method,
    value: numValue || 0,
    isRebook: false,
    isCoupon: false,
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="할인 종류 관리">
        <div className="space-y-4">
          {/* 기존 할인 목록 */}
          {activeDiscountTypes.map(dt => (
            <div
              key={dt.id}
              className="p-3 bg-gray-50 rounded-xl"
              data-testid={`discount-item-${dt.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{dt.name}</span>
                  {dt.isRebook && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">재관람</span>}
                  {dt.isCoupon && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">쿠폰</span>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(dt)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg min-h-[44px] active:bg-blue-100"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(dt.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg min-h-[44px] active:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {seatGrades.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {seatGrades.map(grade => (
                    <span key={grade.id} className="text-xs text-gray-500">
                      {grade.name}: {formatMoney(calcFinalPrice(grade, dt))}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 추가/수정 폼 */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-2">{editId ? '할인 수정' : '새 할인 추가'}</p>

            <div className="space-y-3">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="할인명 (예: 재관람)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />

              {/* 라디오 방식 선택 */}
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    data-testid="radio-method-rate"
                    name="discount-method"
                    value="rate"
                    checked={method === 'rate'}
                    onChange={() => setMethod('rate')}
                    className="accent-indigo-600"
                  />
                  % 할인
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    data-testid="radio-method-amount"
                    name="discount-method"
                    value="amount"
                    checked={method === 'amount'}
                    onChange={() => setMethod('amount')}
                    className="accent-indigo-600"
                  />
                  금액 할인
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    data-testid="radio-method-direct"
                    name="discount-method"
                    value="direct"
                    checked={method === 'direct'}
                    onChange={() => setMethod('direct')}
                    className="accent-indigo-600"
                  />
                  정액
                </label>
              </div>

              <input
                data-testid="input-discount-value"
                type="number"
                value={value}
                onChange={e => handleValueChange(e.target.value)}
                placeholder={method === 'rate' ? '할인율 (%)' : '금액 (원)'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />

              {isRateError && (
                <p data-testid="error-discount-rate" className="text-red-500 text-xs">할인율은 100% 미만이어야 합니다</p>
              )}

              {/* 등급별 가격 미리보기 (폼 내부) */}
              {seatGrades.length > 0 && value !== '' && !isRateError && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl">
                  {seatGrades.map(grade => {
                    const gradeKey = grade.name.replace(/[^a-zA-Z0-9]/g, '');
                    return (
                      <span
                        key={grade.id}
                        data-testid={`preview-grade-${gradeKey}`}
                        className="text-xs text-gray-600"
                      >
                        {grade.name}: {formatMoney(calcFinalPrice(grade, previewDiscount))}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRebook}
                    onChange={e => setIsRebook(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  재관람표 지참 필요
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCoupon}
                    onChange={e => setIsCoupon(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  쿠폰 필요
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isRateError || !name.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium min-h-[44px] disabled:opacity-50"
                >
                  {editId ? '수정 저장' : '추가'}
                </button>
                {editId && (
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm min-h-[44px]"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        title="권종 삭제"
        message={deleteDialogMessage}
        confirmLabel="삭제"
        confirmDestructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
