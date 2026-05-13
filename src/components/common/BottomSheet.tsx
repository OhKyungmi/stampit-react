import React, { useEffect } from 'react';

/**
 * 스탬핏 BottomSheet 컴포넌트
 *
 * 모든 바텀시트 동일 스타일 통일
 *   - border-radius: 24px (상단)
 *   - 핸들: 36px × 4px, gray-200
 *   - 헤더: 제목 17px semibold + X 버튼
 *   - footer: sticky bottom, 전체 너비
 *
 * 사용처:
 *   관람 일정 추가/수정, 공연 추가/수정,
 *   도장판 추가/수정, 확정 시트, 티켓 변경 등
 */

interface BottomSheetProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // 하단 고정 버튼 (저장, 확정 등)
  footer?: React.ReactNode;
  // 최대 높이 비율
  maxHeight?: '70vh' | '80vh' | '90vh' | '95vh';
  // 테스트 ID (하위 호환)
  testId?: string;
}

export default function BottomSheet({
  title,
  isOpen,
  onClose,
  children,
  footer,
  maxHeight = '90vh',
  testId,
}: BottomSheetProps) {
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
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        data-testid="bottom-sheet-backdrop"
      />

      {/* 시트 */}
      <div
        data-testid={testId}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] flex flex-col"
        style={{ maxHeight }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="#6B7280"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 (스크롤) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {/* 하단 고정 푸터 */}
        {footer && (
          <div className="flex-shrink-0 px-5 pt-3 pb-5 border-t border-gray-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
