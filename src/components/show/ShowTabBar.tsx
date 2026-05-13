import { useState, useRef, useEffect } from 'react';
import { colors } from '../../constants/tokens';
import type { Show } from '../../types';

interface ShowTabBarProps {
  shows: Show[];
  activeShowId: string | null;
  onSelect: (showId: string) => void;
  onAddShow: () => void;
  onEditShow: (showId: string) => void;
  onArchiveShow: (showId: string) => void;
  onDeleteShow: (showId: string) => void;
  onOpenTabOrder?: () => void;
}

/** V-01: 1줄 52px 헤더 탭바 */
export default function ShowTabBar({
  shows,
  activeShowId,
  onSelect,
  onAddShow,
  onEditShow,
  onArchiveShow,
  onDeleteShow,
  onOpenTabOrder,
}: ShowTabBarProps) {
  const [menuShowId, setMenuShowId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  // Support custom 'longpress' event from tests
  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;
    function handleCustomLongPress(e: Event) {
      const target = (e.target as HTMLElement).closest('[data-show-id]');
      if (target) {
        const showId = (target as HTMLElement).dataset.showId;
        if (showId) setMenuShowId(showId);
      }
    }
    container.addEventListener('longpress', handleCustomLongPress);
    return () => container.removeEventListener('longpress', handleCustomLongPress);
  }, []);

  // 아카이브/취소 제외 + tabOrder 기준 정렬
  const visibleShows = [...shows]
    .filter(s => !s.isArchived && !s.isCancelled)
    .sort((a, b) => (a.tabOrder ?? 0) - (b.tabOrder ?? 0));

  function handleLongPressStart(showId: string) {
    longPressTimer.current = setTimeout(() => {
      setMenuShowId(showId);
    }, 500);
  }

  function handleLongPressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <div className="relative flex items-center h-[52px] bg-white px-3 gap-2">
      {/* 공연 탭 스크롤 영역 */}
      <div
        ref={tabContainerRef}
        className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
      >
        {visibleShows.map(show => {
          const isActive = activeShowId === show.id;
          return (
            <button
              key={show.id}
              data-testid={`show-tab-${show.id}`}
              data-show-id={show.id}
              onClick={() => {
                onSelect(show.id);
                setMenuShowId(null);
              }}
              onMouseDown={() => handleLongPressStart(show.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(show.id)}
              onTouchEnd={handleLongPressEnd}
              className={`flex items-center gap-1.5 h-9 px-[14px] rounded-[18px] text-[14px] font-medium whitespace-nowrap transition-all select-none active:opacity-70 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'bg-transparent text-gray-400'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: show.color }}
              />
              {show.name}
            </button>
          );
        })}
      </div>

      {/* 공연 추가 버튼 */}
      <button
        data-testid="btn-add-show"
        onClick={onAddShow}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="공연 추가"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <line x1="10" y1="4" x2="10" y2="16" stroke={colors.primary[600]} strokeWidth="2" strokeLinecap="round"/>
          <line x1="4" y1="10" x2="16" y2="10" stroke={colors.primary[600]} strokeWidth="2" strokeLinecap="round"/>

        </svg>
      </button>

      {/* 롱프레스 컨텍스트 메뉴 */}
      {menuShowId && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuShowId(null)}
          />
          <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-lg rounded-b-xl border border-gray-100 overflow-hidden">
            <button
              data-testid="menu-edit-show"
              onClick={() => { onEditShow(menuShowId); setMenuShowId(null); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 flex items-center gap-2 min-h-[48px]"
            >
              ✏️ 수정
            </button>
            {visibleShows.length > 1 && (
              <button
                data-testid="menu-tab-reorder"
                onClick={() => { onOpenTabOrder?.(); setMenuShowId(null); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 flex items-center gap-2 min-h-[48px]"
              >
                🔀 탭 순서 변경
              </button>
            )}
            <button
              data-testid="menu-archive-show"
              onClick={() => { onArchiveShow(menuShowId); setMenuShowId(null); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 flex items-center gap-2 min-h-[48px]"
            >
              📦 보관
            </button>
            <button
              data-testid="menu-delete-show"
              onClick={() => { onDeleteShow(menuShowId); setMenuShowId(null); }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 active:bg-red-50 flex items-center gap-2 min-h-[48px]"
            >
              🗑️ 삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
