import type { StampBoard, SimulatorResult, SimulatorBoardResult } from '../types';

/** 깊은 복사 */
function cloneBoards(boards: StampBoard[]): StampBoard[] {
  return JSON.parse(JSON.stringify(boards));
}

/**
 * 최적 배분 시뮬레이터 (순수 함수 — 원본 데이터 변경 없음)
 *
 * 매 회차마다 "다음 미달성 혜택까지 남은 도장 수"가 가장 적은 판에 도장 1개 배분.
 * 동률 시 sortOrder 낮은 판 우선. 달성할 혜택이 없는 판은 후순위.
 */
export function runSimulator(
  boards: StampBoard[],
  remainingViews: number
): SimulatorResult {
  const sim = cloneBoards(boards).filter(b => b.isActive && !b.isCompleted);

  // 판별 추가 도장 수 집계
  const stampsAdded: Record<string, number> = {};
  const achievedMap: Record<string, { description: string; requiredStamps: number }[]> = {};
  for (const b of sim) {
    stampsAdded[b.id] = 0;
    achievedMap[b.id] = [];
  }

  for (let i = 0; i < remainingViews; i++) {
    const active = sim.filter(b => !b.isCompleted);
    if (active.length === 0) break;

    // 각 판의 다음 미달성 혜택까지 거리 계산
    const ranked = active
      .map(b => {
        const currentCount = b.stamps.length;
        const next = b.benefits
          .filter(ben => !ben.isAchieved)
          .sort((a, c) => a.requiredStamps - c.requiredStamps)[0];
        const distance = next ? next.requiredStamps - currentCount : Infinity;
        return { board: b, distance };
      })
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.board.sortOrder - b.board.sortOrder;
      });

    const target = ranked[0].board;

    // 도장 1개 추가
    target.stamps.push({
      id: `sim-${target.stamps.length}`,
      scheduleId: null,
      isInitial: false,
      isConfirmed: false,
      earnedAt: '',
    });
    stampsAdded[target.id] = (stampsAdded[target.id] ?? 0) + 1;

    // 혜택 달성 체크
    const newCount = target.stamps.length;
    for (const benefit of target.benefits) {
      if (!benefit.isAchieved && benefit.requiredStamps <= newCount) {
        benefit.isAchieved = true;
        achievedMap[target.id].push({
          description: benefit.description,
          requiredStamps: benefit.requiredStamps,
        });
      }
    }

    // 완성 체크
    if (newCount >= target.capacity) target.isCompleted = true;
  }

  // 결과 집계 (원본 boards 기준으로 이름·sortOrder 참조)
  const boardResults: SimulatorBoardResult[] = boards
    .filter(b => b.isActive && !b.isCompleted)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(b => ({
      boardId: b.id,
      boardName: b.name,
      stampsAdded: stampsAdded[b.id] ?? 0,
      achievedBenefits: achievedMap[b.id] ?? [],
    }));

  const totalBenefits = boardResults.reduce(
    (sum, r) => sum + r.achievedBenefits.length,
    0
  );

  return { totalBenefits, boardResults };
}
