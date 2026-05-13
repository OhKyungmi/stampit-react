import type { Benefit } from '../../types';
import { colors } from '../../constants/tokens';

interface ProgressBarProps {
  current: number;
  capacity: number;
  benefits?: Benefit[];
}

/** 진행 상황 표시 바 컴포넌트 */
export default function ProgressBar({ current, capacity, benefits = [] }: ProgressBarProps) {
  const percentage = capacity > 0 ? Math.min(100, (current / capacity) * 100) : 0;

  return (
    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-visible" data-testid="progress-bar">
      {/* 진행 바 */}
      <div
        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
        data-testid="progress-fill"
      />
      {/* 혜택 마커 */}
      {benefits.map(benefit => {
        const pos = capacity > 0 ? (benefit.requiredStamps / capacity) * 100 : 0;
        if (pos > 100) return null;
        return (
          <div
            key={benefit.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white z-10"
            style={{
              left: `${pos}%`,
              backgroundColor: benefit.isAchieved ? colors.accent[500] : colors.gray[300],
            }}
            title={benefit.description}
            data-testid={`benefit-marker-progress-${benefit.id}`}
          />
        );
      })}
    </div>
  );
}
