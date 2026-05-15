import React, { useEffect, useState } from 'react';

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
  // 키보드 올라올 때 시트 위로 밀어올리는 오프셋
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── visualViewport 기반 키보드 감지 ──────────────────────────────────
  // iOS Safari: 키보드 올라와도 layout viewport 불변 → fixed 요소가 키보드에 가려짐
  // visualViewport.height 가 줄어든 만큼 시트를 위로 올려 입력창 노출
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function onResize() {
      const offset = Math.max(
        0,
        window.innerHeight - vv!.height - vv!.offsetTop,
      );
      setKeyboardOffset(offset);
    }

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize); // Android 일부 버전에서 scroll 이벤트로 감지
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
      setKeyboardOffset(0);
    };
  }, [isOpen]);

  // ── 입력창 포커스 시 스크롤해서 키보드 위로 노출 ─────────────────────
  function handleScrollAreaFocus(e: React.FocusEvent<HTMLDivElement>) {
    const target = e.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement)
    ) return;
    // 키보드가 완전히 올라온 뒤(~300ms) 스크롤
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        data-testid="sheet-dim"
      />

      {/* 시트 — keyboardOffset 만큼 bottom 을 올림 */}
      <div
        data-testid={testId}
        className="fixed left-0 right-0 z-50 bg-white rounded-t-[24px] flex flex-col"
        style={{
          maxHeight,
          bottom: keyboardOffset,
          transition: keyboardOffset > 0 ? 'bottom 0.15s ease-out' : 'none',
        }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div data-testid="sheet-handle" className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {title}
          </h2>
          <button
            data-testid="btn-close-sheet"
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
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          onFocus={handleScrollAreaFocus}
        >
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
