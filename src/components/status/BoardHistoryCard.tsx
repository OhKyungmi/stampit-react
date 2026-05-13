import type { StampBoard } from '../../types';

interface BoardHistoryCardProps {
  board: StampBoard;
  onRevive?: (boardId: string) => void;
}

/** YYYY.MM.DD 형식 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** 도장판 완성 히스토리 카드 */
export default function BoardHistoryCard({ board, onRevive }: BoardHistoryCardProps) {
  // 완성일: 마지막으로 찍힌 확정 도장의 earnedAt
  const completedAt = [...board.stamps]
    .filter(s => s.isConfirmed)
    .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt))[0]?.earnedAt;

  // 총 관람 횟수: 확정 도장에 연결된 고유 scheduleId 수
  const visitCount = new Set(
    board.stamps
      .filter(s => s.isConfirmed && s.scheduleId)
      .map(s => s.scheduleId)
  ).size;

  // 달성 혜택만 표시
  const achievedBenefits = board.benefits.filter(b => b.isAchieved);

  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800 truncate flex-1 mr-2">{board.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
            완성
          </span>
          {onRevive && (
            <button
              onClick={() => onRevive(board.id)}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium active:bg-indigo-100 min-h-[28px]"
            >
              다시 활성화
            </button>
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="flex gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-400">완성일</p>
          <p className="text-sm font-medium text-gray-700">
            {completedAt ? formatDate(completedAt) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">총 관람 횟수</p>
          <p className="text-sm font-medium text-gray-700">{visitCount}회</p>
        </div>
      </div>

      {/* 달성 혜택 목록 */}
      {achievedBenefits.length > 0 && (
        <div className="space-y-1 pt-3 border-t border-gray-100">
          {achievedBenefits.map(b => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="text-amber-400 text-xs shrink-0">★</span>
              <p className={`text-xs flex-1 ${b.isUsed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {b.description}
              </p>
              {b.isUsed && (
                <span className="text-xs text-gray-400 shrink-0">사용완료</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
