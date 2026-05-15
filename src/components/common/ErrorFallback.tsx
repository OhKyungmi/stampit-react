import { STORAGE_KEY } from '../../store/storage';

/** 앱 크래시 시 보여주는 에러 복구 화면 */
export default function ErrorFallback() {
  function handleReload() {
    window.location.reload();
  }

  function handleExport() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? '{}';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stampit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('데이터 내보내기에 실패했어요.');
    }
  }

  return (
    <div data-testid="error-fallback" className="flex flex-col items-center justify-center h-dvh bg-gray-50 px-8 text-center">
      <div className="mb-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#fee2e2" stroke="#fca5a5" strokeWidth="2"/>
          <line x1="32" y1="18" x2="32" y2="38" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="46" r="2.5" fill="#ef4444"/>
        </svg>
      </div>
      <h1 className="text-lg font-bold text-gray-800 mb-2">앱에서 오류가 발생했어요</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        예상치 못한 문제가 생겼어요.<br />
        앱을 다시 시작하면 대부분 해결돼요.
      </p>
      <button
        onClick={handleReload}
        className="w-full max-w-xs py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-base mb-3 active:opacity-70"
      >
        앱 다시 시작하기
      </button>
      <button
        onClick={handleExport}
        className="w-full max-w-xs py-3 text-indigo-600 font-medium text-sm active:opacity-70"
      >
        데이터 내보내기
      </button>
    </div>
  );
}
