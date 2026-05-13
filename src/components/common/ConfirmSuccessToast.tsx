import { useEffect, useState } from 'react';

interface ConfirmSuccessToastProps {
  stampCount: number;
  boardName: string | null;
  onClose: () => void;
}

/** 원탭 확정 완료 피드백 토스트 */
export default function ConfirmSuccessToast({ stampCount, boardName, onClose }: ConfirmSuccessToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      data-testid="confirm-success-toast"
      role="alert"
    >
      <div className="bg-indigo-600 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2.5 whitespace-nowrap">
        <span className="text-lg">✅</span>
        <div>
          <p className="text-sm font-bold leading-snug">관람 확정 완료!</p>
          {boardName && (
            <p className="text-xs opacity-80 mt-0.5">
              {boardName}에 도장 +{stampCount}개
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
