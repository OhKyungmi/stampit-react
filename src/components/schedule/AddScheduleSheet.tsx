import { useState, useEffect, useRef } from 'react';
import BottomSheet from '../common/BottomSheet';
import QuickStartBanner from '../common/QuickStartBanner';
import type { SeatGrade, DiscountType, StampBoard, BoardAllocation, StampEvent } from '../../types';
import { calcFinalPrice } from '../../utils/priceCalc';
import { allocateStamps } from '../../utils/stampAllocator';
import { todayKSTString } from '../../utils/dateUtils';
import CastAutocomplete from '../planner/CastAutocomplete';
import SpecialEventPicker from '../planner/SpecialEventPicker';
import SpecialEventSheet from '../settings/SpecialEventSheet';
import StampCountPicker from './StampCountPicker';

type WhenMode = 'today' | 'future' | null;

interface SchedulePayload {
  showId: string;
  date: string;
  time?: string;
  seatGradeId: string | null;
  discountTypeId: string | null;
  finalPrice: number;
  originalPrice: number;
  multiplier: number;
  memo?: string;
  cast?: string;
  specialEventIds: string[];
  isShare?: boolean;
}

interface AddScheduleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  showId: string;
  seatGrades: SeatGrade[];
  discountTypes: DiscountType[];
  stampBoards: StampBoard[];
  stampEvents?: StampEvent[];
  existingScheduleDates: string[];
  initialDate?: string;
  showStartDate?: string;
  showEndDate?: string;
  onGoToSettings?: () => void;
  onAdd: (data: SchedulePayload) => void;
  onAddAndConfirm?: (data: SchedulePayload) => void;
}

function FormSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-gray-400 tracking-[0.2px] mt-1 mb-0.5">{children}</p>
  );
}

/** V-12: 관람 일정 추가 바텀 시트 */
export default function AddScheduleSheet({
  isOpen,
  onClose,
  showId,
  seatGrades,
  discountTypes,
  stampBoards,
  stampEvents = [],
  existingScheduleDates,
  initialDate,
  showStartDate,
  showEndDate,
  onGoToSettings,
  onAdd,
  onAddAndConfirm,
}: AddScheduleSheetProps) {
  const [whenMode, setWhenMode] = useState<WhenMode>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [gradeId, setGradeId] = useState(seatGrades[0]?.id || '');
  const [discountId, setDiscountId] = useState(discountTypes[0]?.id || '');
  const [multiplier, setMultiplier] = useState(1);
  const [memo, setMemo] = useState('');
  const [cast, setCast] = useState('');
  const [specialEventIds, setSpecialEventIds] = useState<string[]>([]);
  const [specialEventSheetOpen, setSpecialEventSheetOpen] = useState(false);
  const [previewAllocations, setPreviewAllocations] = useState<BoardAllocation[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [activeEvents, setActiveEvents] = useState<StampEvent[]>([]);
  const [isManualMultiplier, setIsManualMultiplier] = useState(false);
  const [isShare, setIsShare] = useState(false);
  const [directAmountStr, setDirectAmountStr] = useState('');
  const [allocPreviewOpen, setAllocPreviewOpen] = useState(false);
  const directAmount = parseInt(directAmountStr.replace(/,/g, ''), 10) || 0;

  const prevDateRef = useRef('');

  const activeDiscountTypes = discountTypes.filter(d => !d.isDeleted);
  const hasGrades = seatGrades.length > 0;
  const hasDiscounts = activeDiscountTypes.length > 0;
  const isDirectMode = !hasGrades || !hasDiscounts;

  const grade = seatGrades.find(g => g.id === gradeId) || null;
  const discount = activeDiscountTypes.find(d => d.id === discountId) || null;

  const finalPrice = grade && discount ? calcFinalPrice(grade, discount) : 0;
  const savedAmount = grade ? grade.price - finalPrice : 0;
  const isOutOfPeriod = !!(date && (
    (showStartDate && date < showStartDate) ||
    (showEndDate && date > showEndDate)
  ));

  useEffect(() => {
    if (isOpen) {
      setWhenMode(null);
      setDate(initialDate ?? '');
      setDirectAmountStr('');
      setAllocPreviewOpen(false);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (whenMode === 'today') {
      setDate(todayKSTString());
    }
  }, [whenMode]);

  useEffect(() => {
    setIsDuplicate(date ? existingScheduleDates.includes(date) : false);

    if (date && stampEvents.length > 0) {
      const events = stampEvents
        .filter(ev => {
          if (date < ev.startDate) return false;
          if (ev.endDate && date > ev.endDate) return false;
          return true;
        })
        .sort((a, b) => b.multiplier - a.multiplier);

      setActiveEvents(events);

      if (events.length > 0 && !isManualMultiplier) {
        setMultiplier(events[0].multiplier);
      }
    } else {
      setActiveEvents([]);
    }
  }, [date, existingScheduleDates, stampEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isShare) {
      setPreviewAllocations([]);
      return;
    }
    const { allocations } = allocateStamps(stampBoards, multiplier);
    setPreviewAllocations(allocations);
  }, [stampBoards, multiplier, isShare]);

  function handleMultiplierChange(m: number) {
    setMultiplier(m);
    setIsManualMultiplier(true);
  }

  function handleDirectAmountChange(val: string) {
    const nums = val.replace(/[^0-9]/g, '');
    setDirectAmountStr(nums ? parseInt(nums).toLocaleString() : '');
  }

  function buildPayload(): SchedulePayload | null {
    if (!date || whenMode === null) return null;
    if (isDirectMode) {
      if (!directAmount) return null;
      return {
        showId, date,
        time: time || undefined,
        seatGradeId: null,
        discountTypeId: null,
        finalPrice: directAmount,
        originalPrice: directAmount,
        multiplier: isShare ? 0 : multiplier,
        memo: memo || undefined,
        cast: cast || undefined,
        specialEventIds,
        isShare,
      };
    }
    if (!gradeId || !discountId) return null;
    return {
      showId, date,
      time: time || undefined,
      seatGradeId: gradeId,
      discountTypeId: discountId,
      finalPrice,
      originalPrice: grade?.price || 0,
      multiplier: isShare ? 0 : multiplier,
      memo: memo || undefined,
      cast: cast || undefined,
      specialEventIds,
      isShare,
    };
  }

  function resetForm() {
    setWhenMode(null);
    setDate('');
    setTime('');
    setMultiplier(1);
    setMemo('');
    setCast('');
    setSpecialEventIds([]);
    setActiveEvents([]);
    setIsManualMultiplier(false);
    setIsShare(false);
    setDirectAmountStr('');
    setAllocPreviewOpen(false);
    prevDateRef.current = '';
  }

  function handleSubmit() {
    const payload = buildPayload();
    if (!payload) return;

    if (whenMode === 'today' && onAddAndConfirm) {
      onAddAndConfirm(payload);
    } else {
      onAdd(payload);
    }
    resetForm();
    onClose();
  }

  const canSubmit = whenMode !== null && !!date &&
    (isDirectMode ? directAmount > 0 : !!gradeId && !!discountId);

  const eventBannerText = (() => {
    if (activeEvents.length === 0) return null;
    if (isManualMultiplier) return '수동 설정됨';
    const primary = activeEvents[0];
    if (activeEvents.length === 1) return `🎉 ${primary.name} · x${primary.multiplier}`;
    return `🎉 ${primary.name} 외 ${activeEvents.length - 1}개`;
  })();

  return (
    <>
      <SpecialEventSheet
        isOpen={specialEventSheetOpen}
        onClose={() => setSpecialEventSheetOpen(false)}
        showId={showId}
      />
      <BottomSheet isOpen={isOpen} onClose={onClose} title="관람 일정 추가">
        <div className="space-y-3">

          {/* 언제 보시나요? — V-12 크기 개선 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="when-today"
              onClick={() => setWhenMode('today')}
              className={`h-[48px] rounded-[12px] text-sm font-semibold transition-colors ${
                whenMode === 'today'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              오늘 봤어요
            </button>
            <button
              type="button"
              data-testid="when-future"
              onClick={() => setWhenMode('future')}
              className={`h-[48px] rounded-[12px] text-sm font-semibold transition-colors ${
                whenMode === 'future'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              나중에 볼 예정
            </button>
          </div>

          {/* ── 관람 정보 ───────────────────────────── */}
          <FormSectionLabel>관람 정보</FormSectionLabel>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="input-schedule-date"
              type="date"
              value={date}
              onChange={e => { if (whenMode !== 'today') setDate(e.target.value); }}
              readOnly={whenMode === 'today'}
              className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm ${
                whenMode === 'today' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
              }`}
            />
            {isOutOfPeriod && (
              <div data-testid="warn-out-of-period" className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-xs">⚠️ 공연 기간 외의 날짜입니다.</p>
              </div>
            )}
            {isDuplicate && (
              <div data-testid="warn-dup-date" className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-xs">⚠️ 이미 같은 날짜의 일정이 있습니다. 계속 추가하시겠습니까?</p>
              </div>
            )}
            {eventBannerText && (
              <div data-testid="event-banner" className="mt-1 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-indigo-700 text-xs">{eventBannerText}</p>
              </div>
            )}
          </div>

          {/* 회차 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회차 (선택)</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* ── 좌석 정보 ───────────────────────────── */}
          <FormSectionLabel>좌석 정보</FormSectionLabel>

          {isDirectMode ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">⚠️ 등급이 없어요. 금액을 직접 입력해주세요.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 금액 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    data-testid="input-direct-price"
                    inputMode="numeric"
                    value={directAmountStr}
                    onChange={e => handleDirectAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
                </div>
              </div>
              {onGoToSettings && (
                <QuickStartBanner onSetupNow={() => { onClose(); onGoToSettings(); }} />
              )}
            </div>
          ) : (
            <>
              {/* 좌석 등급 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  좌석 등급 <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="select-grade"
                  value={gradeId}
                  onChange={e => setGradeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
                >
                  {seatGrades.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.price.toLocaleString()}원)</option>
                  ))}
                </select>
              </div>

              {/* 할인권종 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  할인권종 <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="select-discount"
                  value={discountId}
                  onChange={e => setDiscountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
                >
                  {activeDiscountTypes.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {discount?.isRebook && (
                  <div className="mt-1 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-700 text-xs">🎟️ 재관람표를 지참하세요!</p>
                  </div>
                )}
                {discount?.isCoupon && (
                  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-xs">🎫 쿠폰을 챙기세요!</p>
                  </div>
                )}
              </div>

              {/* 나눔 관극 — 할인권종 바로 아래 */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">나눔 관극</p>
                  <p className="text-xs text-gray-400 mt-0.5">도장이 적립되지 않아요</p>
                </div>
                <button
                  data-testid="toggle-is-share"
                  role="switch"
                  aria-checked={isShare ? 'true' : 'false'}
                  onClick={() => setIsShare(v => !v)}
                  className={`w-[44px] h-6 rounded-full transition-colors ${isShare ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${isShare ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </>
          )}

          {/* ── 배수 ────────────────────────────────── */}
          {!isShare && (
            <>
              <FormSectionLabel>배수</FormSectionLabel>
              <div data-testid="multiplier-section">
                <StampCountPicker
                  value={multiplier}
                  onChange={handleMultiplierChange}
                  label="도장 적립"
                  eventLabel={activeEvents.length > 0 && !isManualMultiplier ? '이벤트 자동 설정됨' : undefined}
                />
              </div>

              {/* 배분 미리보기 — 접기/펼치기 */}
              {previewAllocations.length > 0 && (
                <div>
                  <button
                    onClick={() => setAllocPreviewOpen(v => !v)}
                    className="flex items-center gap-1 text-[12px] text-gray-400 font-medium py-1"
                  >
                    배분 미리보기
                    <span className="text-[10px]">{allocPreviewOpen ? '▴' : '▾'}</span>
                  </button>
                  {allocPreviewOpen && (
                    <div data-testid="board-allocation-section" className="mt-1 p-3 bg-gray-50 rounded-xl space-y-2">
                      {previewAllocations.map(alloc => {
                        const board = stampBoards.find(b => b.id === alloc.boardId);
                        const current = board?.stamps.length ?? 0;
                        const capacity = board?.capacity ?? 1;
                        const after = Math.min(current + alloc.stamps, capacity);
                        return (
                          <div key={alloc.boardId} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-16 truncate flex-shrink-0">{board?.name}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(current / capacity) * 100}%` }} />
                            </div>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden -ml-2 opacity-50">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(after / capacity) * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 flex-shrink-0">+{alloc.stamps}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── 기록 (선택) ──────────────────────────── */}
          <FormSectionLabel>기록 (선택)</FormSectionLabel>

          {/* 캐스트 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">캐스트 메모</label>
            <CastAutocomplete showId={showId} value={cast} onChange={setCast} />
          </div>

          {/* 특별 이벤트 태그 */}
          <SpecialEventPicker
            showId={showId}
            selectedIds={specialEventIds}
            onChange={setSpecialEventIds}
            onOpenSheet={() => setSpecialEventSheetOpen(true)}
          />

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <input
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="자유롭게 메모하세요"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* ── 결제 정보 sticky ─────────────────────── */}
          {!isDirectMode && grade && discount && (
            <div className="sticky bottom-0 -mx-4 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <p className="text-[13px] text-gray-400 line-through">{grade.price.toLocaleString()}원</p>
              <p data-testid="price-final" className="text-[18px] font-bold text-indigo-600 leading-snug">
                {finalPrice.toLocaleString()}원
              </p>
              {savedAmount > 0 && (
                <p data-testid="price-saved" className="text-[12px] text-emerald-500 font-medium">
                  {savedAmount.toLocaleString()}원 절약
                </p>
              )}
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            data-testid="btn-save-schedule"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {whenMode === 'today' ? '추가하고 바로 확정' : '일정 추가'}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
