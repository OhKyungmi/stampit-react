interface QuickStartBannerProps {
  onSetupNow: () => void;
}

/** 등급·권종 미설정 시 설정 유도 배너 */
export default function QuickStartBanner({ onSetupNow }: QuickStartBannerProps) {
  return (
    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
      <p className="text-sm text-indigo-700 mb-1.5">
        💡 등급·권종을 설정하면 자동 계산돼요
      </p>
      <button
        type="button"
        onClick={onSetupNow}
        className="text-sm font-semibold text-indigo-600 flex items-center gap-1"
      >
        → 지금 설정하기
      </button>
    </div>
  );
}
