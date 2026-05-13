import { useState } from 'react';
import type { Show, Schedule } from '../../types';
import { getMonthGrid, prevMonth, nextMonth } from '../../utils/calendarUtils';
import { todayKSTString } from '../../utils/dateUtils';
import { formatMoney } from '../../utils/priceCalc';
import BottomSheet from '../common/BottomSheet';
import { colors } from '../../constants/tokens';

interface CalendarViewProps {
  show: Show;
  schedules: Schedule[];
  onConfirmSchedule: (id: string) => void;
  onAddSchedule: (date: string) => void;
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const MAX_DOTS = 3;

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dows[d.getDay()]})`;
}

/** B-01 캘린더 뷰 */
export default function CalendarView({ show, schedules, onConfirmSchedule, onAddSchedule }: CalendarViewProps) {
  const today = todayKSTString();
  const [year, setYear] = useState(parseInt(today.slice(0, 4)));
  const [month, setMonth] = useState(parseInt(today.slice(5, 7)));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeCast, setActiveCast] = useState<string | null>(null);

  const grid = getMonthGrid(year, month);

  // 캐스트 필터용 유니크 목록
  const allCasts = [...new Set(schedules.map(s => s.cast).filter(Boolean) as string[])];

  // 캐스트 필터 적용한 일정
  const filtered = activeCast ? schedules.filter(s => s.cast === activeCast) : schedules;

  // 날짜별 그룹 (필터된 일정 — 점 표시용)
  const byDate = new Map<string, Schedule[]>();
  for (const s of filtered) {
    if (!byDate.has(s.date)) byDate.set(s.date, []);
    byDate.get(s.date)!.push(s);
  }

  // 날짜별 그룹 (전체 — 탭 감지용)
  const allByDate = new Map<string, Schedule[]>();
  for (const s of schedules) {
    if (!allByDate.has(s.date)) allByDate.set(s.date, []);
    allByDate.get(s.date)!.push(s);
  }

  function handleDayTap(date: string) {
    if ((allByDate.get(date) ?? []).length > 0) {
      setSelectedDate(date);
    } else {
      onAddSchedule(date);
    }
  }

  function handlePrev() {
    const [y, m] = prevMonth(year, month);
    setYear(y); setMonth(m);
  }
  function handleNext() {
    const [y, m] = nextMonth(year, month);
    setYear(y); setMonth(m);
  }

  const selectedSchedules = selectedDate ? (allByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="flex flex-col h-full">
      {/* 캐스트 필터 칩 */}
      {allCasts.length > 0 && (
        <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveCast(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${
              activeCast === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            전체
          </button>
          {allCasts.map(cast => (
            <button
              key={cast}
              onClick={() => setActiveCast(cast === activeCast ? null : cast)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${
                activeCast === cast ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cast}
            </button>
          ))}
        </div>
      )}

      {/* 월 이동 */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button
          onClick={handlePrev}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-500 text-xl font-light"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-800">{year}년 {month}월</span>
        <button
          onClick={handleNext}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-500 text-xl font-light"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-2 shrink-0">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 px-2 pb-4 flex-1 content-start overflow-y-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
        {grid.map((cell, idx) => {
          if (!cell.date) return <div key={`pad-${idx}`} className="h-14" />;

          const date = cell.date;
          const dow = idx % 7;
          const isToday = date === today;
          const daySched = byDate.get(date) ?? [];
          const allDay = allByDate.get(date) ?? [];
          const hasSpecialEvent = allDay.some(s => s.specialEventIds && s.specialEventIds.length > 0);
          const dots = daySched.slice(0, MAX_DOTS);
          const overflow = daySched.length > MAX_DOTS ? daySched.length - MAX_DOTS : 0;

          return (
            <button
              key={date}
              onClick={() => handleDayTap(date)}
              className="flex flex-col items-center py-1 rounded-xl active:bg-gray-50 transition-colors h-14"
            >
              {/* 날짜 숫자 */}
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                isToday
                  ? 'bg-indigo-600 text-white font-bold'
                  : dow === 0 ? 'text-red-400'
                  : dow === 6 ? 'text-blue-400'
                  : 'text-gray-700'
              }`}>
                {cell.day}
              </div>

              {/* 일정 점 */}
              <div className="flex items-center gap-0.5 mt-0.5 h-3">
                {dots.map(s => {
                  const status = s.status ?? (s.isConfirmed ? 'confirmed' : 'draft');
                  const isCancelled = status === 'cancelled';
                  const isConfirmed = status === 'confirmed';
                  return (
                    <span
                      key={s.id}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={isCancelled ? { backgroundColor: colors.gray[300] } : {
                        backgroundColor: isConfirmed ? show.color : 'transparent',
                        border: `1.5px solid ${show.color}`,
                      }}
                    />
                  );
                })}
                {overflow > 0 && (
                  <span className="text-[9px] text-gray-400 leading-none font-medium">+{overflow}</span>
                )}
                {hasSpecialEvent && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0 ml-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 날짜 상세 바텀시트 */}
      <BottomSheet
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatDateLabel(selectedDate) : ''}
      >
        <div className="space-y-2">
          {selectedSchedules.map(s => {
            const grade = show.seatGrades.find(g => g.id === s.seatGradeId);
            const discount = show.discountTypes.find(d => d.id === s.discountTypeId);
            const status = s.status ?? (s.isConfirmed ? 'confirmed' : 'draft');
            const isCancelled = status === 'cancelled';
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className={`text-base ${isCancelled ? 'opacity-30' : ''}`}>
                  {status === 'confirmed' ? '✅' : isCancelled ? '❌' : '📋'}
                </span>
                <div className={`flex-1 ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                  <p className="text-sm font-medium text-gray-800">
                    {s.time && <span className="text-gray-500 mr-1">{s.time}</span>}
                    {grade?.name ?? '(등급 없음)'} · {discount?.name ?? '(할인 없음)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatMoney(s.finalPrice)}</p>
                  {s.cast && <p className="text-xs text-gray-400 mt-0.5">{s.cast}</p>}
                </div>
                {status === 'draft' && (
                  <button
                    onClick={() => { onConfirmSchedule(s.id); setSelectedDate(null); }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg min-h-[36px]"
                  >
                    확정
                  </button>
                )}
              </div>
            );
          })}

          {/* 이 날 일정 추가 버튼 */}
          <button
            onClick={() => { setSelectedDate(null); if (selectedDate) onAddSchedule(selectedDate); }}
            className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium mt-1 min-h-[44px]"
          >
            + 이 날 일정 추가
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
