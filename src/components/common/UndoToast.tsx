import { useEffect, useRef } from 'react';
import { useUndoStore } from '../../store/undoStore';

interface UndoToastProps {
  onUndo: () => void;
}

/** 실행 취소 토스트 (SC-33) - 3초 프로그레스 바 포함 */
export default function UndoToast({ onUndo }: UndoToastProps) {
  const { action, clearAction } = useUndoStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!action) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      clearAction();
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [action, clearAction]);

  if (!action) return null;

  function handleUndo() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onUndo();
    clearAction();
  }

  return (
    <div
      className="fixed left-4 right-4 z-[70] bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden animate-fade-in"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">{action.message}</span>
        <button
          onClick={handleUndo}
          className="text-sm font-semibold text-indigo-300 active:text-indigo-200 ml-4 min-h-[44px] px-2"
        >
          실행 취소
        </button>
      </div>
      {/* 3초 프로그레스 바 */}
      <div className="h-1 bg-white/20 relative">
        <div
          className="absolute left-0 top-0 bottom-0 bg-white animate-progress-bar"
          style={{ animationDuration: '3s', animationTimingFunction: 'linear', animationFillMode: 'forwards' }}
        />
      </div>
      <style>{`
        @keyframes progress-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-bar {
          animation-name: progress-bar;
        }
      `}</style>
    </div>
  );
}
