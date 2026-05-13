import { useState, useEffect, useRef } from 'react';
import type { Show } from '../../types';
import BottomSheet from '../common/BottomSheet';

interface TabOrderSheetProps {
  isOpen: boolean;
  /** 아카이브/취소 제외한 활성 공연 목록 */
  shows: Show[];
  onClose: () => void;
  onSave: (orderedIds: string[]) => void;
}

const ITEM_H = 60; // 행 높이 (px)

/** 4.16 공연 탭 순서 변경 시트 — 드래그 핸들로 순서 조정 */
export default function TabOrderSheet({ isOpen, shows, onClose, onSave }: TabOrderSheetProps) {
  const [items, setItems] = useState<Show[]>([]);

  // 드래그 상태 (ref로 관리해 불필요한 리렌더 방지)
  const drag = useRef<{
    idx: number;        // 현재 드래그 중인 행 인덱스
    startY: number;     // 드래그 시작 Y (clientY)
    baseY: number;      // 인덱스 교체 후 재기준 Y
  } | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0); // 드래그 중인 아이템의 시각적 오프셋

  // 시트가 열릴 때마다 tabOrder 기준으로 정렬한 복사본 사용
  useEffect(() => {
    if (isOpen) {
      setItems([...shows].sort((a, b) => (a.tabOrder ?? 0) - (b.tabOrder ?? 0)));
      drag.current = null;
      setDraggingIdx(null);
      setOffsetY(0);
    }
  }, [isOpen, shows]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, idx: number) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { idx, startY: e.clientY, baseY: e.clientY };
    setDraggingIdx(idx);
    setOffsetY(0);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const delta = e.clientY - drag.current.baseY;
    setOffsetY(delta);

    // 몇 칸 이동했는지 계산
    const steps = Math.round(delta / ITEM_H);
    if (steps === 0) return;

    const from = drag.current.idx;
    const to = Math.max(0, Math.min(items.length - 1, from + steps));
    if (to === from) return;

    // 실제 배열 재정렬
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    // 드래그 기준점을 새 위치로 갱신 (오프셋 리셋)
    drag.current = {
      idx: to,
      startY: drag.current.startY,
      baseY: drag.current.baseY + steps * ITEM_H,
    };
    setDraggingIdx(to);
    setOffsetY(delta - steps * ITEM_H);
    setItems(next);
  }

  function handlePointerUp() {
    drag.current = null;
    setDraggingIdx(null);
    setOffsetY(0);
  }

  function handleSave() {
    onSave(items.map(s => s.id));
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="공연 탭 순서" testId="tab-order-sheet">
      <p className="text-xs text-gray-400 mb-3">드래그하여 순서를 변경하세요</p>

      {/* 드래그 영역 — onPointerMove/Up을 컨테이너에 걸어야 핸들 밖에서도 추적 가능 */}
      <div
        className="space-y-1 touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {items.map((show, idx) => {
          const isDragging = draggingIdx === idx;
          return (
            <div
              key={show.id}
              data-testid={`tab-order-item-${show.id}`}
              style={{
                height: ITEM_H,
                transform: isDragging ? `translateY(${offsetY}px)` : 'none',
                transition: isDragging ? 'none' : 'transform 0.15s ease',
                zIndex: isDragging ? 20 : 0,
                position: 'relative',
                boxShadow: isDragging ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
              }}
              className={`flex items-center gap-3 px-3 bg-white rounded-xl border ${
                isDragging ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100'
              }`}
            >
              {/* 드래그 핸들 */}
              <div
                onPointerDown={(e) => handlePointerDown(e, idx)}
                className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing px-1 py-3 touch-none select-none"
                aria-label="드래그 핸들"
              >
                <span className="block w-4 h-0.5 bg-gray-300 rounded" />
                <span className="block w-4 h-0.5 bg-gray-300 rounded" />
                <span className="block w-4 h-0.5 bg-gray-300 rounded" />
              </div>

              {/* 공연 색상 dot */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: show.color }}
              />

              {/* 공연명 */}
              <span className="text-sm font-medium text-gray-800 flex-1 truncate">{show.name}</span>

              {/* 순번 뱃지 */}
              <span className="text-xs text-gray-300 font-medium w-5 text-right">{idx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium min-h-[44px]"
        >
          취소
        </button>
        <button
          data-testid="btn-tab-order-save"
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold min-h-[44px]"
        >
          저장
        </button>
      </div>
    </BottomSheet>
  );
}
