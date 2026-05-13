import { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

interface QuickStartBannerProps {
  hasNoSeatGrades: boolean;
  onSetupNow: () => void;
}

/** 빠른 시작 완료 후 좌석 등급 설정 유도 배너 (SC-28) */
export default function QuickStartBanner({ hasNoSeatGrades, onSetupNow }: QuickStartBannerProps) {
  const { settings } = useSettingsStore();
  const [dismissed, setDismissed] = useState(false);

  // hasCompletedQuickStart=true이고 좌석 등급이 없을 때만 표시
  // 나중에 누르면 이번 세션만 닫힘 — 앱 재실행 시 다시 표시
  if (!settings.hasCompletedQuickStart || !hasNoSeatGrades || dismissed) return null;

  return (
    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
      <p className="text-sm text-indigo-700 mb-2">
        💡 좌석 등급과 할인 권종을 설정하면 금액 계산도 할 수 있어요
      </p>
      <div className="flex gap-2">
        <button
          onClick={onSetupNow}
          className="flex-1 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg min-h-[44px] active:bg-indigo-800"
        >
          지금 설정하기
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 py-1.5 text-sm font-medium bg-white text-gray-600 border border-gray-200 rounded-lg min-h-[44px] active:bg-gray-100"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
