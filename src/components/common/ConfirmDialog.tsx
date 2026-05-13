import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmTestId?: string;
}

/** 중앙 확인 다이얼로그 (위험 동작 전 재확인용) */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDestructive = false,
  onConfirm,
  onCancel,
  confirmTestId,
}: ConfirmDialogProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  // 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
        data-testid="confirm-dialog-backdrop"
      />
      {/* 다이얼로그 본체 */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 animate-fade-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        data-testid="confirm-dialog"
      >
        <h2
          id="confirm-dialog-title"
          className="text-base font-bold text-gray-900 text-center"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="text-sm text-gray-500 text-center leading-relaxed"
        >
          {message}
        </p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm min-h-[44px] active:bg-gray-200 transition-colors"
            data-testid="confirm-dialog-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm min-h-[44px] transition-colors ${
              confirmDestructive
                ? 'bg-red-600 text-white active:bg-red-700'
                : 'bg-indigo-600 text-white active:bg-indigo-700'
            }`}
            data-testid={confirmTestId || "confirm-dialog-confirm"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
