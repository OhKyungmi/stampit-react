import { useState } from 'react';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';

interface CancelScheduleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason?: string, refundAmount?: number) => void;
}

const REASONS = ['공연취소', '개인사정', '캐스팅변경', '기타'] as const;

/** 일정 취소(불참) 바텀 시트 (SC-30) */
export default function CancelScheduleSheet({ isOpen, onClose, onCancel }: CancelScheduleSheetProps) {
  const [reason, setReason] = useState<string>('');
  const [refundEnabled, setRefundEnabled] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');

  function handleCancel() {
    onCancel(
      reason || undefined,
      refundEnabled && refundAmount ? Number(refundAmount) : undefined,
    );
    setReason('');
    setRefundEnabled(false);
    setRefundAmount('');
    onClose();
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="일정 취소"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} fullWidth>닫기</Button>
          <Button variant="danger" onClick={handleCancel} fullWidth>취소 처리하기</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 사유 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">취소 사유 (선택)</label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button
                key={r}
                onClick={() => setReason(prev => prev === r ? '' : r)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[44px] ${
                  reason === r
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 환불 여부 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">환불 받음</label>
            <button
              onClick={() => setRefundEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${refundEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${refundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {refundEnabled && (
            <input
              type="number"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              placeholder="환불 금액 (원)"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          )}
        </div>

      </div>
    </BottomSheet>
  );
}
