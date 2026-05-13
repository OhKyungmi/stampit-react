import { useState } from 'react';
import type { Schedule } from '../../types';

interface PendingAlertBannerProps {
  schedules: Schedule[];
  today: string;
  onConfirm: () => void;
}

/** 미확정 일정 복귀 안내 배너 (U-11) */
export default function PendingAlertBanner({ schedules, today, onConfirm }: PendingAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const pendingSchedules = schedules.filter(s =>
    !s.isConfirmed &&
    s.isShare !== true &&
    (s.status ?? 'draft') !== 'cancelled' &&
    s.date < today
  );

  if (dismissed || pendingSchedules.length < 2) return null;

  return (
    <div
      className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
      data-testid="pending-alert-banner"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          ⏰ 확정 안 한 관람이 {pendingSchedules.length}개 있어요
        </p>
        <p className="text-xs text-amber-600 mt-0.5">지금 확정하면 도장이 적립돼요</p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="shrink-0 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold active:bg-amber-600 min-h-[36px] whitespace-nowrap"
        data-testid="btn-pending-confirm"
      >
        지금 확정하기 →
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-400 active:text-amber-600 text-lg leading-none px-1 min-h-[36px] flex items-center"
        aria-label="닫기"
        data-testid="btn-pending-dismiss"
      >
        ×
      </button>
    </div>
  );
}
