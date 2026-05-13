import { useState } from 'react';
import { todayKSTString } from '../../utils/dateUtils';
import Button from '../common/Button';

interface ManualStampSheetProps {
  boardName: string;
  maxAdd: number; // 남은 칸 수
  initialType?: 'exchange' | 'share' | 'etc'; // B-04 퀵버튼에서 자동 선택
  onSave: (data: { stampType: 'exchange' | 'share' | 'etc'; count: number; memo?: string; earnedAt: string }) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: 'exchange' | 'share' | 'etc'; label: string; emoji: string; desc: string }[] = [
  { value: 'exchange', label: '교환', emoji: '🔄', desc: '다른 공연 도장과 교환' },
  { value: 'share', label: '나눔', emoji: '🎁', desc: '나눔 이벤트 참여' },
  { value: 'etc', label: '기타', emoji: '✏️', desc: '그 외 경로' },
];

/** 4.15 수동 도장 추가 시트 */
export default function ManualStampSheet({ boardName, maxAdd, initialType, onSave, onClose }: ManualStampSheetProps) {
  const [stampType, setStampType] = useState<'exchange' | 'share' | 'etc'>(initialType ?? 'exchange');
  const [count, setCount] = useState(1);
  const [memo, setMemo] = useState('');
  const [earnedAt, setEarnedAt] = useState(todayKSTString());

  const safeMax = Math.max(1, maxAdd);

  function handleSave() {
    onSave({ stampType, count, memo: memo.trim() || undefined, earnedAt });
    onClose();
  }

  return (
    <div data-testid="manual-stamp-sheet" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 space-y-5"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">도장 추가</h2>
          <button onClick={onClose} className="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 text-xl">×</button>
        </div>
        <p className="text-xs text-gray-400 -mt-4">{boardName}</p>

        {/* 취득 경로 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">취득 경로</p>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                data-testid={`chip-${opt.value}`}
                aria-selected={stampType === opt.value ? 'true' : 'false'}
                onClick={() => setStampType(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-colors ${
                  stampType === opt.value
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className={`text-xs font-semibold ${stampType === opt.value ? 'text-indigo-700' : 'text-gray-600'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight px-1">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 도장 수 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">도장 수</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount(c => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-xl font-bold flex items-center justify-center active:bg-gray-200"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900 w-8 text-center">{count}</span>
            <button
              onClick={() => setCount(c => Math.min(safeMax, c + 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-xl font-bold flex items-center justify-center active:bg-gray-200"
              disabled={count >= safeMax}
            >
              +
            </button>
            <span className="text-xs text-gray-400 ml-1">최대 {safeMax}개</span>
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">날짜</p>
          <input
            type="date"
            value={earnedAt}
            onChange={e => setEarnedAt(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* 메모 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">메모 <span className="font-normal text-gray-300">(선택)</span></p>
          <input
            type="text"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="예: 2회차 교환"
            maxLength={50}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* 저장 */}
        <Button data-testid="btn-save-manual-stamp" onClick={handleSave} fullWidth>
          도장 {count}개 추가
        </Button>
      </div>
    </div>
  );
}
