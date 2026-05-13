import { useShowStore } from '../../store/showStore';
import { useStorageAlertStore } from '../../store/storageAlertStore';
import { getStorageInfo, getImageBytes, formatBytes } from '../../utils/storageUtils';

interface StorageManageSheetProps {
  isOpen: boolean;
}

/** localStorage 이미지 관리 시트 */
export default function StorageManageSheet({ isOpen }: StorageManageSheetProps) {
  const { shows, updateShow, exportData } = useShowStore();
  const { status, errorMessage, closeManageSheet, checkThreshold } = useStorageAlertStore();

  if (!isOpen) return null;

  const info = getStorageInfo();
  const isForced = status === 'danger' || status === 'quota-exceeded';

  // 이미지 있는 공연만
  const showsWithImage = shows.filter(s => !!s.headerImageUrl);

  const pctColor =
    info.percentage >= 95 ? 'bg-red-500' :
    info.percentage >= 80 ? 'bg-amber-500' :
    'bg-indigo-500';

  function handleDeleteImage(showId: string) {
    updateShow(showId, { headerImageUrl: undefined });
    checkThreshold();
  }

  function handleDeleindigol() {
    showsWithImage.forEach(s => updateShow(s.id, { headerImageUrl: undefined }));
    checkThreshold();
  }

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stampit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    /* 모달 오버레이 (BottomSheet 대신 풀스크린 오버레이 — 강제 오픈 시 닫기 차단 용이) */
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40">
      <div className="mt-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <h2 className="text-base font-bold text-gray-800">저장 공간 관리</h2>
          {!isForced && (
            <button
              onClick={closeManageSheet}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">🚫 {errorMessage}</p>
            </div>
          )}

          {/* 사용량 프로그레스 바 */}
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">전체 사용량</span>
              <span className="text-gray-500 font-medium">
                {info.usedLabel} / {info.limitLabel}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pctColor}`}
                style={{ width: `${info.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {info.percentage.toFixed(1)}% 사용 중
            </p>
          </div>

          {/* 이미지 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                공연 배너 이미지
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  ({showsWithImage.length}개)
                </span>
              </p>
              {showsWithImage.length > 1 && (
                <button
                  onClick={handleDeleindigol}
                  className="text-sm text-red-500 active:text-red-700 font-medium min-h-[44px] px-2"
                >
                  이미지 전체 삭제
                </button>
              )}
            </div>

            {showsWithImage.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">
                등록된 배너 이미지가 없어요
              </p>
            ) : (
              <div className="space-y-2">
                {showsWithImage.map(show => {
                  const imgBytes = getImageBytes(show.headerImageUrl!);
                  return (
                    <div
                      key={show.id}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                    >
                      {/* 썸네일 */}
                      <img
                        src={show.headerImageUrl}
                        alt={show.name}
                        className="w-14 h-10 object-cover rounded-lg shrink-0"
                      />
                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{show.name}</p>
                        <p className="text-xs text-gray-400">{formatBytes(imgBytes)}</p>
                      </div>
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDeleteImage(show.id)}
                        className="shrink-0 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium active:bg-red-100 min-h-[44px]"
                      >
                        삭제
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 이미지 외 데이터 초과 안내 */}
          {showsWithImage.length === 0 && isForced && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-600">
                이미지가 없어도 공간이 부족한 경우, 데이터를 내보낸 후 전체 초기화를 진행해 주세요.
              </p>
            </div>
          )}

          {/* JSON 내보내기 */}
          <button
            onClick={handleExport}
            className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 min-h-[44px]"
          >
            📦 JSON으로 내보내기 (백업 권장)
          </button>
        </div>
      </div>
    </div>
  );
}
