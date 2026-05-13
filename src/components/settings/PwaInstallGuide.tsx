import { useMemo } from 'react';

function detectOS(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

/** 4.13 PWA 홈 화면 추가 안내 */
export default function PwaInstallGuide() {
  const os = useMemo(() => detectOS(), []);
  const installed = useMemo(() => isStandalone(), []);

  if (installed) return null;

  return (
    <div data-testid="pwa-install-guide" className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📲</span>
        <p className="text-sm font-semibold text-gray-800">홈 화면에 추가</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        홈 화면에 추가하면 앱처럼 사용할 수 있어요.
      </p>

      {(os === 'ios' || os === 'other') && (
        <div data-testid="pwa-guide-ios" className="flex items-start gap-2 mb-2">
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-semibold shrink-0">iOS</span>
          <p className="text-xs text-gray-500">
            Safari → 하단 공유 버튼(<span className="font-medium">⎙</span>) → <span className="font-medium">"홈 화면에 추가"</span>
          </p>
        </div>
      )}

      {(os === 'android' || os === 'other') && (
        <div data-testid="pwa-guide-android" className="flex items-start gap-2">
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-semibold shrink-0">Android</span>
          <p className="text-xs text-gray-500">
            Chrome → 메뉴(<span className="font-medium">⋮</span>) → <span className="font-medium">"앱 설치"</span> 또는 <span className="font-medium">"홈 화면에 추가"</span>
          </p>
        </div>
      )}
    </div>
  );
}
