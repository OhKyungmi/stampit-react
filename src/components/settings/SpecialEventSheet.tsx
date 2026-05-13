import { useState } from 'react';
import type { SpecialEvent } from '../../types';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { useShowStore } from '../../store/showStore';

interface SpecialEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  showId: string;
}

/** 특별 이벤트 관리 시트 */
export default function SpecialEventSheet({ isOpen, onClose, showId }: SpecialEventSheetProps) {
  const { shows, schedules, addSpecialEvent, updateSpecialEvent, deleteSpecialEvent } = useShowStore();
  const show = shows.find(s => s.id === showId);
  const events = (show?.specialEvents ?? []).filter(e => !e.isDeleted);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');

  const [addMode, setAddMode] = useState(false);
  const [addName, setAddName] = useState('');
  const [addError, setAddError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<SpecialEvent | null>(null);

  function isInUse(eventId: string) {
    return schedules.some(s => s.showId === showId && s.specialEventIds?.includes(eventId));
  }

  function validateName(name: string, excludeId?: string): string {
    if (!name.trim()) return '이름을 입력하세요';
    if (name.trim().length > 20) return '최대 20자까지 입력할 수 있어요';
    const dup = events.some(e => e.name === name.trim() && e.id !== excludeId);
    if (dup) return '이미 같은 이름의 이벤트가 있어요';
    return '';
  }

  function startEdit(event: SpecialEvent) {
    setEditingId(event.id);
    setEditingName(event.name);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
    setEditError('');
  }

  function saveEdit() {
    const err = validateName(editingName, editingId ?? undefined);
    if (err) { setEditError(err); return; }
    if (editingId) updateSpecialEvent(showId, editingId, editingName.trim());
    cancelEdit();
  }

  function cancelAdd() {
    setAddMode(false);
    setAddName('');
    setAddError('');
  }

  function saveAdd() {
    const err = validateName(addName);
    if (err) { setAddError(err); return; }
    addSpecialEvent(showId, addName.trim());
    cancelAdd();
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteSpecialEvent(showId, deleteTarget.id);
    }
    setDeleteTarget(null);
    onClose();
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="특별 이벤트 관리">
        <div className="space-y-3">
          {events.length === 0 && !addMode && (
            <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">
              등록된 특별 이벤트가 없어요
            </p>
          )}

          {events.map(event => (
            <div
              key={event.id}
              data-testid={`special-event-item-${event.id}`}
              className="flex items-center gap-2"
            >
              <div
                data-testid="special-event-item"
                className="flex items-center gap-2 flex-1"
              >
                {editingId === event.id ? (
                  <>
                    <div className="flex-1">
                      <input
                        value={editingName}
                        onChange={e => { setEditingName(e.target.value.slice(0, 20)); setEditError(''); }}
                        maxLength={20}
                        autoFocus
                        className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                      />
                      {editError && <p className="text-xs text-red-500 mt-1">{editError}</p>}
                    </div>
                    <button
                      onClick={saveEdit}
                      className="shrink-0 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium min-h-[44px]"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="shrink-0 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm min-h-[44px]"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(event)}
                      className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 text-left hover:bg-gray-100 min-h-[44px]"
                    >
                      {event.name}
                      {event.isPreset && (
                        <span className="ml-1.5 text-xs text-gray-400">기본</span>
                      )}
                    </button>
                    <button
                      data-testid="btn-delete-event"
                      onClick={() => setDeleteTarget(event)}
                      className="shrink-0 w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 rounded-lg"
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* 추가 폼 */}
          {addMode ? (
            <div>
              <input
                data-testid="input-special-event-name"
                value={addName}
                onChange={e => { setAddName(e.target.value.slice(0, 20)); setAddError(''); }}
                maxLength={20}
                autoFocus
                placeholder="이벤트 이름 (최대 20자)"
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm mb-1"
              />
              {addError && <p className="text-xs text-red-500 mb-2">{addError}</p>}
              <div className="flex gap-2">
                <button
                  data-testid="btn-save-special-event"
                  onClick={saveAdd}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold min-h-[44px]"
                >
                  추가
                </button>
                <button
                  onClick={cancelAdd}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm min-h-[44px]"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              data-testid="btn-add-special-event"
              onClick={() => { setAddMode(true); cancelEdit(); }}
              className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 min-h-[44px]"
            >
              + 추가
            </button>
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="이벤트 삭제"
        message={
          deleteTarget && isInUse(deleteTarget.id)
            ? `"${deleteTarget.name}"은 일정에 사용 중이에요.\n삭제하면 목록에서 숨겨지고, 기존 일정 태그에는 "(삭제됨)"으로 표시됩니다.`
            : `"${deleteTarget?.name}"을 삭제할까요?`
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        confirmDestructive
        confirmTestId="btn-delete-confirm"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
