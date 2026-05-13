import type { StampBoard } from '../../types';

interface RecommendBannerProps {
  boards: StampBoard[];
  onScrollToBoard?: (boardId: string) => void;
}

/** 추천 배너 컴포넌트 (SC-18) */
export default function RecommendBanner({ boards, onScrollToBoard }: RecommendBannerProps) {
  // 활성 보드 중 가장 가까운 혜택 찾기
  const recommendations = boards
    .filter(b => b.isActive && !b.isCompleted)
    .flatMap(board => {
      const stampCount = board.stamps.length;
      const nextBenefit = board.benefits
        .filter(b => !b.isAchieved && b.requiredStamps > stampCount)
        .sort((a, b) => a.requiredStamps - b.requiredStamps)[0];
      if (!nextBenefit) return [];
      return [{
        boardId: board.id,
        boardName: board.name,
        remaining: nextBenefit.requiredStamps - stampCount,
        benefitDesc: nextBenefit.description,
      }];
    })
    .sort((a, b) => a.remaining - b.remaining);

  if (recommendations.length === 0) return null;

  const top = recommendations[0];

  return (
    <button
      onClick={() => onScrollToBoard?.(top.boardId)}
      className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-left"
      data-testid="recommend-banner"
    >
      <p className="text-sm text-indigo-800">
        💡 <span className="font-semibold">{top.boardName}</span>에{' '}
        <span className="font-bold text-indigo-600">{top.remaining}개</span>만 더 찍으면{' '}
        <span className="font-semibold">{top.benefitDesc}</span>이에요!
      </p>
    </button>
  );
}
