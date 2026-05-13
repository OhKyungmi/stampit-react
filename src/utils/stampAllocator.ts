import type { StampBoard, BoardAllocation, Benefit, Stamp } from '../types';

export interface AllocationResult {
  allocations: BoardAllocation[];
  needsNewBoard: boolean;
}

/** 활성화된 (완성되지 않은) 보드 목록을 반환합니다 */
function getActiveBoards(boards: StampBoard[]): StampBoard[] {
  return boards.filter(b => b.isActive && !b.isCompleted);
}

/** 보드의 현재 도장 수를 반환합니다 */
function currentStampCount(board: StampBoard): number {
  return board.stamps.length;
}


/** 주어진 보드들에 totalStamps 개의 도장을 자동 배분합니다 */
export function allocateStamps(boards: StampBoard[], totalStamps: number): AllocationResult {
  // 깊은 복사하여 원본 데이터를 수정하지 않음
  const cloned = JSON.parse(JSON.stringify(boards)) as StampBoard[];
  const active = getActiveBoards(cloned).sort((a, b) => a.sortOrder - b.sortOrder);

  const allocations: BoardAllocation[] = [];
  let remaining = totalStamps;

  for (const board of active) {
    if (remaining <= 0) break;
    const canTake = board.capacity - currentStampCount(board);
    if (canTake <= 0) continue;
    const give = Math.min(remaining, canTake);
    allocations.push({ boardId: board.id, stamps: give });
    // 다음 반복을 위해 복제된 보드 업데이트
    for (let i = 0; i < give; i++) {
      const stamp: Stamp = {
        id: `tmp-${i}`,
        scheduleId: null,
        isInitial: false,
        isConfirmed: false,
        earnedAt: '',
      };
      board.stamps.push(stamp);
    }
    remaining -= give;
  }

  const needsNewBoard = remaining > 0;
  return { allocations, needsNewBoard };
}

/** 배분 후 달성된 혜택 목록을 반환합니다 */
export function checkBenefitsAfterAllocation(
  board: StampBoard,
  addedStamps: number
): Benefit[] {
  const prevCount = board.stamps.filter(s => s.isConfirmed || s.scheduleId !== null).length;
  const newCount = prevCount + addedStamps;
  return board.benefits.filter(
    b => !b.isAchieved && b.requiredStamps > prevCount && b.requiredStamps <= newCount
  );
}
