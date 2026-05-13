import { useStorageAlertStore } from '../../store/storageAlertStore';

/** 설정 탭 상단 — 경고 구간(80~95%) 1회 노출 배너 */
export default function StorageBanner() {
  const { status, warnDismissed, openManageSheet, dismissWarning } = useStorageAlertStore();

  // warning 구간 && 아직 닫지 않음
  if (status !== 'warning' || warnDismissed) return null;

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
      <p className="text-sm text-amber-800 font-medium mb-0.5">⚠️ 저장 공간이 거의 찼어요</p>
      <p className="text-xs text-amber-700 mb-3">배너 이미지를 정리하면 공간을 확보할 수 있어요.</p>
      <div className="flex gap-2">
        <button
          onClick={openManageSheet}
          className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold min-h-[44px] active:bg-amber-600"
        >
          지금 정리하기
        </button>
        <button
          onClick={dismissWarning}
          className="flex-1 py-2 bg-white text-amber-700 border border-amber-200 rounded-xl text-sm font-medium min-h-[44px] active:bg-amber-50"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
