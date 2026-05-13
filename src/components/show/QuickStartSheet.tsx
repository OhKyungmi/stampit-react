import { useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Input from '../common/Input';

interface BenefitDraft {
  requiredStamps: number;
  description: string;
  priority: number;
}

export interface QuickStartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    showName: string;
    capacity: number;
    benefits: BenefitDraft[];
    initialStamps: number;
  }) => void;
}

/** 빠른 시작 바텀 시트 (SC-28) */
export default function QuickStartSheet({ isOpen, onClose, onSubmit }: QuickStartSheetProps) {
  const [showName, setShowName] = useState('');
  const [capacity, setCapacity] = useState(7);
  const [benefits, setBenefits] = useState<BenefitDraft[]>([]);
  const [newStamps, setNewStamps] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [initialEnabled, setInitialEnabled] = useState(false);
  const [initialStamps, setInitialStamps] = useState(0);

  function addBenefit() {
    if (!newStamps || !newDesc.trim()) return;
    setBenefits(prev => [
      ...prev,
      {
        requiredStamps: Number(newStamps),
        description: newDesc.trim(),
        priority: prev.length + 1,
      },
    ]);
    setNewStamps('');
    setNewDesc('');
  }

  function removeBenefit(idx: number) {
    setBenefits(prev => prev.filter((_, i) => i !== idx).map((b, i) => ({ ...b, priority: i + 1 })));
  }

  function moveBenefit(idx: number, dir: 'up' | 'down') {
    setBenefits(prev => {
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((b, i) => ({ ...b, priority: i + 1 }));
    });
  }

  function handleSubmit() {
    if (!showName.trim()) return;
    onSubmit({
      showName: showName.trim(),
      capacity,
      benefits,
      initialStamps: initialEnabled ? Math.min(initialStamps, capacity - 1) : 0,
    });
    // 폼 초기화
    setShowName('');
    setCapacity(7);
    setBenefits([]);
    setNewStamps('');
    setNewDesc('');
    setInitialEnabled(false);
    setInitialStamps(0);
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="빠른 시작"
      footer={
        <Button
          data-testid="btn-quick-start-submit"
          onClick={handleSubmit}
          disabled={!showName.trim()}
          fullWidth
        >
          시작하기
        </Button>
      }
    >
      <div className="space-y-5">
        {/* 공연명 */}
        <Input
          data-testid="input-show-name"
          label="공연명"
          required
          value={showName}
          onChange={e => setShowName(e.target.value.slice(0, 30))}
          placeholder="예: 모차르트!, 레미제라블"
          maxLength={30}
        />

        {/* 도장판 칸수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">도장판 칸수</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCapacity(c => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-xl flex items-center justify-center hover:bg-gray-200 min-h-[44px]"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-12 text-center">{capacity}</span>
            <button
              onClick={() => setCapacity(c => Math.min(50, c + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-xl flex items-center justify-center hover:bg-gray-200 min-h-[44px]"
            >
              +
            </button>
          </div>
        </div>

        {/* 혜택 설정 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            혜택 설정
            <span className="ml-1 text-xs text-gray-400 font-normal">({benefits.length}개)</span>
          </label>

          {/* 혜택 목록 */}
          {benefits.length > 0 && (
            <div className="space-y-2 mb-3">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-2.5 bg-gray-50 rounded-xl">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="w-7 h-7 bg-gray-200 text-gray-600 rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                    {b.requiredStamps}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{b.description}</span>
                  <div className="flex flex-col shrink-0">
                    <button
                      onClick={() => moveBenefit(idx, 'up')}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 text-xs leading-none py-0.5"
                      aria-label="우선순위 올리기"
                    >▲</button>
                    <button
                      onClick={() => moveBenefit(idx, 'down')}
                      disabled={idx === benefits.length - 1}
                      className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 text-xs leading-none py-0.5"
                      aria-label="우선순위 내리기"
                    >▼</button>
                  </div>
                  <button
                    onClick={() => removeBenefit(idx)}
                    className="text-red-400 text-sm hover:text-red-600 shrink-0 px-1"
                    aria-label="혜택 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 새 혜택 입력 */}
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

        {/* 이미 찍힌 도장 수 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">이미 찍힌 도장 있음</label>
            <button
              onClick={() => setInitialEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${initialEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${initialEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {initialEnabled && (
            <input
              type="number"
              value={initialStamps}
              onChange={e => setInitialStamps(Math.max(0, Math.min(capacity - 1, Number(e.target.value))))}
              min={0}
              max={capacity - 1}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="도장 수"
            />
          )}
        </div>

      </div>
    </BottomSheet>
  );
}
