import { useState, useEffect } from 'react';
import BottomSheet from '../common/BottomSheet';
import type { SeatGrade } from '../../types';

interface SeatGradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  grades: SeatGrade[];
  onAdd: (grade: Omit<SeatGrade, 'id'>) => void;
  onUpdate: (id: string, data: Partial<SeatGrade>) => void;
  onDelete: (id: string) => void;
}

function formatPrice(val: string): string {
  const num = Number(val.replace(/,/g, ''));
  if (isNaN(num)) return val;
  return num.toLocaleString();
}

function parsePrice(val: string): number {
  return Number(val.replace(/,/g, ''));
}

/** 좌석 등급 관리 바텀 시트 (SC-04) */
export default function SeatGradeSheet({
  isOpen,
  onClose,
  grades,
  onAdd,
  onUpdate,
  onDelete,
}: SeatGradeSheetProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [minGradeError, setMinGradeError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewName('');
      setNewPrice('');
      setEditId(null);
      setMinGradeError(false);
    }
  }, [isOpen]);

  function handleAdd() {
    if (!newName.trim() || !newPrice) return;
    const price = parsePrice(newPrice);
    onAdd({ name: newName.trim(), price });
    setNewName('');
    setNewPrice('');
  }

  function handleDelete(id: string) {
    if (grades.length <= 1) {
      setMinGradeError(true);
      return;
    }
    setMinGradeError(false);
    onDelete(id);
  }

  function startEdit(grade: SeatGrade) {
    setEditId(grade.id);
    setEditName(grade.name);
    setEditPrice(grade.price.toLocaleString());
  }

  function saveEdit() {
    if (!editId) return;
    const price = parsePrice(editPrice);
    onUpdate(editId, { name: editName.trim(), price });
    setEditId(null);
  }

  const isDupName = newName.trim() !== '' && grades.some(g => g.name.toLowerCase() === newName.trim().toLowerCase());
  const newPriceNum = parsePrice(newPrice);
  const isZeroPrice = newPrice !== '' && newPriceNum === 0;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="좌석 등급 관리">
      <div className="space-y-3">
        {/* 기존 등급 목록 */}
        {grades.map(grade => (
          <div
            key={grade.id}
            className="relative overflow-hidden"
            data-testid={`grade-item-${grade.id}`}
          >
            {editId === grade.id ? (
              // 인라인 수정 폼
              <div className="flex gap-2 items-center">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  placeholder="등급명"
                />
                <input
                  type="text"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value.replace(/[^\d]/g, ''))}
                  onBlur={e => setEditPrice(formatPrice(e.target.value))}
                  className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  placeholder="가격"
                />
                <button
                  onClick={saveEdit}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm min-h-[44px]"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm min-h-[44px]"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-800 text-sm">{grade.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{grade.price.toLocaleString()}원</span>
                  <button
                    onClick={() => startEdit(grade)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium min-h-[32px]"
                  >
                    수정
                  </button>
                  <button
                    data-testid="swipe-delete"
                    onClick={() => handleDelete(grade.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium min-h-[32px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {minGradeError && (
          <p data-testid="error-min-grade" className="text-red-500 text-xs">등급은 최소 1개 이상이어야 합니다</p>
        )}

        {/* 새 등급 추가 폼 */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">새 등급 추가</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                data-testid="input-grade-name"
                value={newName}
                onChange={e => { setNewName(e.target.value); setMinGradeError(false); }}
                placeholder="등급명 (예: VIP)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              {isDupName && (
                <p data-testid="error-grade-dup" className="text-red-500 text-xs mt-1">이미 존재하는 등급명입니다</p>
              )}
            </div>
            <div>
              <input
                data-testid="input-grade-price"
                type="text"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value.replace(/[^\d]/g, ''))}
                onBlur={e => { if (e.target.value) setNewPrice(formatPrice(e.target.value)); }}
                placeholder="정가"
                className="w-28 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              {isZeroPrice && (
                <p data-testid="warn-zero-price" className="text-amber-500 text-xs mt-1">0원으로 설정됩니다</p>
              )}
            </div>
            <button
              data-testid="btn-add-grade"
              onClick={handleAdd}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium min-h-[44px]"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
