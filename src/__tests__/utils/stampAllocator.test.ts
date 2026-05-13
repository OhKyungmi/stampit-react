import { describe, test, expect } from 'vitest';
import { allocateStamps, checkBenefitsAfterAllocation } from '../../utils/stampAllocator';
import type { StampBoard, Stamp, Benefit } from '../../types';

function makeStamp(overrides: Partial<Stamp> = {}): Stamp {
  return {
    id: Math.random().toString(36).slice(2),
    scheduleId: null,
    isInitial: false,
    isConfirmed: true,
    earnedAt: '',
    ...overrides,
  };
}

function makeBenefit(requiredStamps: number, priority: number = 1, isAchieved = false): Benefit {
  return {
    id: Math.random().toString(36).slice(2),
    requiredStamps,
    description: `${requiredStamps}개 혜택`,
    priority,
    isAchieved,
    isUsed: false,
  };
}

function makeBoard(
  id: string,
  capacity: number,
  stamps: Stamp[] = [],
  benefits: Benefit[] = [],
  overrides: Partial<StampBoard> = {}
): StampBoard {
  return {
    id,
    showId: 'show1',
    name: `${id}판`,
    capacity,
    initialStamps: 0,
    stamps,
    benefits,
    isActive: true,
    isCompleted: false,
    sortOrder: 1,
    createdAt: '',
    ...overrides,
  };
}

describe('allocateStamps', () => {
  test('single active board gets all stamps', () => {
    const board = makeBoard('b1', 10);
    const { allocations, needsNewBoard } = allocateStamps([board], 5);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].boardId).toBe('b1');
    expect(allocations[0].stamps).toBe(5);
    expect(needsNewBoard).toBe(false);
  });

  test('distributes to board closest to benefit', () => {
    // board1: 7 stamps, benefit at 10 (3 more needed)
    // board2: 2 stamps, benefit at 10 (8 more needed)
    const board1 = makeBoard('b1', 10, Array(7).fill(null).map(() => makeStamp()), [makeBenefit(10)]);
    const board2 = makeBoard('b2', 10, Array(2).fill(null).map(() => makeStamp()), [makeBenefit(10)]);
    const { allocations } = allocateStamps([board1, board2], 1);
    // board1 is closer to benefit
    expect(allocations[0].boardId).toBe('b1');
    expect(allocations[0].stamps).toBe(1);
  });

  test('respects sortOrder: lower sortOrder board gets stamps first', () => {
    // board1: sortOrder=2 (lower priority)
    // board2: sortOrder=1 (higher priority — served first)
    const board1 = makeBoard('b1', 10, [], [], { sortOrder: 2 });
    const board2 = makeBoard('b2', 10, [], [], { sortOrder: 1 });
    const { allocations } = allocateStamps([board1, board2], 3);
    expect(allocations[0].boardId).toBe('b2');
  });

  test('moves to next board when first board is full', () => {
    const board1 = makeBoard('b1', 3, Array(3).fill(null).map(() => makeStamp())); // full
    const board2 = makeBoard('b2', 10);
    const { allocations } = allocateStamps([board1, board2], 5);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].boardId).toBe('b2');
    expect(allocations[0].stamps).toBe(5);
  });

  test('splits stamps across multiple boards', () => {
    const board1 = makeBoard('b1', 3, [makeStamp(), makeStamp()]); // 1 remaining
    const board2 = makeBoard('b2', 10, [], [makeBenefit(5)]);
    const { allocations } = allocateStamps([board1, board2], 5);
    const b1alloc = allocations.find(a => a.boardId === 'b1');
    const b2alloc = allocations.find(a => a.boardId === 'b2');
    expect(b1alloc?.stamps).toBe(1);
    expect(b2alloc?.stamps).toBe(4);
  });

  test('needsNewBoard=true when all boards full', () => {
    const board1 = makeBoard('b1', 2, [makeStamp(), makeStamp()]); // full
    const board2 = makeBoard('b2', 2, [makeStamp(), makeStamp()]); // full
    const { needsNewBoard } = allocateStamps([board1, board2], 3);
    expect(needsNewBoard).toBe(true);
  });

  test('needsNewBoard=false when stamps fit', () => {
    const board = makeBoard('b1', 10);
    const { needsNewBoard } = allocateStamps([board], 5);
    expect(needsNewBoard).toBe(false);
  });

  test('handles board with initialStamps (already has stamps)', () => {
    const stamps = Array(5).fill(null).map(() => makeStamp({ isInitial: true }));
    const board = makeBoard('b1', 10, stamps);
    const { allocations } = allocateStamps([board], 3);
    expect(allocations[0].stamps).toBe(3);
  });

  test('skips completed boards', () => {
    const board1 = makeBoard('b1', 5, Array(5).fill(null).map(() => makeStamp()), [], { isCompleted: true });
    const board2 = makeBoard('b2', 10);
    const { allocations } = allocateStamps([board1, board2], 3);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].boardId).toBe('b2');
  });

  test('skips inactive boards', () => {
    const board1 = makeBoard('b1', 10, [], [], { isActive: false });
    const board2 = makeBoard('b2', 10);
    const { allocations } = allocateStamps([board1, board2], 3);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].boardId).toBe('b2');
  });

  test('handles zero active boards', () => {
    const board = makeBoard('b1', 10, [], [], { isActive: false });
    const { allocations, needsNewBoard } = allocateStamps([board], 3);
    expect(allocations).toHaveLength(0);
    expect(needsNewBoard).toBe(true);
  });

  test('initial stamps already past benefit threshold', () => {
    // Board has 8 stamps, benefit at 5 (already achieved/past)
    const stamps = Array(8).fill(null).map(() => makeStamp());
    const benefit = makeBenefit(5, 1, true); // already achieved
    const board = makeBoard('b1', 10, stamps, [benefit]);
    const { allocations } = allocateStamps([board], 2);
    expect(allocations[0].stamps).toBe(2);
  });

  test('handles empty boards array', () => {
    const { allocations, needsNewBoard } = allocateStamps([], 5);
    expect(allocations).toHaveLength(0);
    expect(needsNewBoard).toBe(true);
  });

  test('allocates 0 stamps when totalStamps is 0', () => {
    const board = makeBoard('b1', 10);
    const { allocations, needsNewBoard } = allocateStamps([board], 0);
    expect(allocations).toHaveLength(0);
    expect(needsNewBoard).toBe(false);
  });

  test('does not mutate original boards', () => {
    const board = makeBoard('b1', 10);
    const originalLength = board.stamps.length;
    allocateStamps([board], 5);
    expect(board.stamps.length).toBe(originalLength);
  });
});

describe('checkBenefitsAfterAllocation', () => {
  test('returns benefits newly achieved', () => {
    const benefit = makeBenefit(5, 1, false);
    const stamps = Array(3).fill(null).map(() => makeStamp({ isConfirmed: true, scheduleId: 's1' }));
    const board = makeBoard('b1', 10, stamps, [benefit]);
    const achieved = checkBenefitsAfterAllocation(board, 2);
    // prev=3 stamps, after=5 stamps, benefit at 5 -> achieved
    expect(achieved).toHaveLength(1);
    expect(achieved[0].requiredStamps).toBe(5);
  });

  test('does not return already achieved benefits', () => {
    const benefit = makeBenefit(3, 1, true); // already achieved
    const stamps = Array(4).fill(null).map(() => makeStamp({ isConfirmed: true, scheduleId: 's1' }));
    const board = makeBoard('b1', 10, stamps, [benefit]);
    const achieved = checkBenefitsAfterAllocation(board, 1);
    expect(achieved).toHaveLength(0);
  });

  test('returns nothing if stamps not enough for next benefit', () => {
    const benefit = makeBenefit(10, 1, false);
    const stamps = Array(2).fill(null).map(() => makeStamp({ isConfirmed: true, scheduleId: 's1' }));
    const board = makeBoard('b1', 10, stamps, [benefit]);
    const achieved = checkBenefitsAfterAllocation(board, 2);
    // prev=2, after=4, benefit at 10 -> not achieved
    expect(achieved).toHaveLength(0);
  });
});
