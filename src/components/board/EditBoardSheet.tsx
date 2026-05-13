import { useState, useEffect } from 'react';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Input from '../common/Input';
import type { StampBoard, Benefit } from '../../types';
import { STAMP_COLOR_PRESETS, DEFAULT_STAMP_COLOR } from '../../constants/stampColors';

interface EditBoardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  board: StampBoard | null;
  onSave: (boardId: string, updates: {
    name: string;
    capacity: number;
    stampColor: string;
    benefits: Benefit[];
  }) => void;
}

type LocalBenefit = Benefit & { _isNew?: boolean };

/** 도장판 수정 바텀시트 — 이름·용량·색상·혜택 편집 */
export default function EditBoardSheet({ isOpen, onClose, board, onSave }: EditBoardSheetProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [stampColor, setStampColor] = useState(DEFAULT_STAMP_COLOR);
  const [benefits, setBenefits] = useState<LocalBenefit[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStamps, setEditStamps] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [newStamps, setNewStamps] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [nameError, setNameError] = useState('');

  // 시트 열릴 때 보드 데이터로 초기화
  useEffect(() => {
    if (isOpen && board) {
      setName(board.name);
      setCapacity(board.capacity);
      setStampColor(board.stampColor ?? DEFAULT_STAMP_COLOR);
      setBenefits(board.benefits.map(b => ({ ...b })));
      setEditingId(null);
      setNewStamps('');
      setNewDesc('');
      setNameError('');
    }
  }, [isOpen, board]);

  if (!board) return null;

  const minCapacity = Math.max(1, board.stamps.length);

  // ── 혜택 편집 ────────────────────────────────────────────────────────────────

  function startEdit(b: LocalBenefit) {
    setEditingId(b.id);
    setEditStamps(String(b.requiredStamps));
    setEditDesc(b.description);
  }

  function commitEdit(id: string) {
    if (!editStamps || !editDesc.trim()) return;
    setBenefits(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, requiredStamps: Number(editStamps), description: editDesc.trim() }
          : b
      )
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function removeBenefit(id: string) {
    setBenefits(prev => prev.filter(b => b.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function moveBenefit(id: string, dir: 'up' | 'down') {
    setBenefits(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((b, i) => ({ ...b, priority: i + 1 }));
    });
  }

  function addBenefit() {
    if (!newStamps || !newDesc.trim()) return;
    const tempId = `new_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setBenefits(prev => [
      ...prev,
      {
        id: tempId,
        requiredStamps: Number(newStamps),
        description: newDesc.trim(),
        priority: prev.length + 1,
        isAchieved: false,
        isUsed: false,
        _isNew: true,
      },
    ]);
    setNewStamps('');
    setNewDesc('');
  }

  // ── 저장 ─────────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!board) return;
    if (!name.trim()) {
      setNameError('판 이름을 입력해주세요');
      return;
    }
    setNameError('');

    const finalBenefits: Benefit[] = benefits.map((b, i) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _isNew, ...rest } = b;
      return { ...rest, priority: i + 1 };
    });

    onSave(board.id, {
      name: name.trim(),
      capacity,
      stampColor,
      benefits: finalBenefits,
    });
    onClose();
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="도장판 수정"
      footer={<Button onClick={handleSave} fullWidth>저장</Button>}
    >
      <div className="space-y-5">

        {/* 판 이름 */}
        <Input
          label="판 이름"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(''); }}
          error={nameError}
        />

        {/* 도장 색상 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">도장 색상</label>
          <div className="grid grid-cols-6 gap-2">
            {STAMP_COLOR_PRESETS.map(preset => (
              <button
                key={preset.hex}
                onClick={() => setStampColor(preset.hex)}
                className="relative aspect-square rounded-full transition-transform active:scale-90"
                style={{ backgroundColor: preset.hex }}
                aria-label={preset.label}
                title={preset.label}
              >
                {stampColor === preset.hex && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 도장 칸 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            도장 칸 수
            {minCapacity > 0 && (
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (최소 {minCapacity}개 — 기존 도장)
              </span>
            )}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCapacity(c => Math.max(minCapacity, c - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 flex items-center justify-center"
              disabled={capacity <= minCapacity}
            >
              -
            </button>
            <span className="text-2xl font-bold text-indigo-600 w-10 text-center">{capacity}</span>
            <button
              onClick={() => setCapacity(c => Math.min(50, c + 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* 혜택 목록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            혜택 설정
            <span className="ml-1 text-xs text-gray-400 font-normal">
              ({benefits.length}개)
            </span>
          </label>

          <div className="space-y-2 mb-3">
            {benefits.length === 0 && (
              <p className="text-xs text-gray-400 py-2 text-center">혜택이 없어요. 아래에서 추가해보세요.</p>
            )}

            {benefits.map(b => (
              <div key={b.id}>
                {editingId === b.id ? (
                  <div className="p-2.5 bg-indigo-50 rounded-xl space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editStamps}
                        onChange={e => setEditStamps(e.target.value)}
                        placeholder="N개"
                        className="w-16 px-2 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-center"
                      />
                      <input
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        placeholder="혜택 내용"
                        className="flex-1 px-2 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => commitEdit(b.id)}
                        className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 p-2.5 bg-gray-50 rounded-xl">
                    <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                      {benefits.indexOf(b) + 1}
                    </span>
                    <span className="w-7 h-7 bg-gray-200 text-gray-600 rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                      {b.requiredStamps}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{b.description}</span>
                    {b.isAchieved && (
                      <span className="text-xs text-emerald-600 font-medium shrink-0">달성 ✓</span>
                    )}
                    <div className="flex flex-col shrink-0">
                      <button
                        onClick={() => moveBenefit(b.id, 'up')}
                        disabled={benefits.indexOf(b) === 0}
                        className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 text-xs leading-none py-0.5"
                        aria-label="우선순위 올리기"
                      >▲</button>
                      <button
                        onClick={() => moveBenefit(b.id, 'down')}
                        disabled={benefits.indexOf(b) === benefits.length - 1}
                        className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 text-xs leading-none py-0.5"
                        aria-label="우선순위 내리기"
                      >▼</button>
                    </div>
                    {!b.isAchieved && (
                      <button
                        onClick={() => startEdit(b)}
                        className="text-indigo-400 text-sm hover:text-indigo-600 px-0.5 shrink-0"
                        aria-label="혜택 수정"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => removeBenefit(b.id)}
                      className="text-red-400 text-sm hover:text-red-600 px-0.5 shrink-0"
                      aria-label="혜택 삭제"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={newStamps}
              onChange={e => setNewStamps(e.target.value)}
              placeholder="N개"
              className="w-16 px-2 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-center"
            />
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBenefit()}
              placeholder="혜택 내용 입력"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <button
              onClick={addBenefit}
              disabled={!newStamps || !newDesc.trim()}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium min-h-[44px] disabled:opacity-40"
            >
              추가
            </button>
          </div>
        </div>

      </div>
    </BottomSheet>
  );
}
