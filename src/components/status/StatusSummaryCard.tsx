import { colors } from '../../constants/tokens';

interface StatusSummaryCardProps {
  /** 현재 공연 확정 관람 횟수 */
  totalConfirmed: number;
  /** 전체 공연 확정 합산 */
  allConfirmed: number;
  /** 활성 판 중 다음 혜택까지 남은 도장 최솟값 (없으면 null) */
  nextBenefitStamps: number | null;
  /** 달성됐지만 미사용 (쿠폰형 제외) 혜택 수 */
  unusedBenefits: number;
  onTapBoards?: () => void;
  onTapBenefits?: () => void;
}

/** V-07: 현황 탭 상단 요약 카드 */
export default function StatusSummaryCard({
  totalConfirmed,
  allConfirmed,
  nextBenefitStamps,
  unusedBenefits,
  onTapBoards,
  onTapBenefits,
}: StatusSummaryCardProps) {
  const cells = [
    {
      label: '총 관람',
      value: totalConfirmed,
      unit: '회',
      color: colors.gray[900],
      onClick: undefined as (() => void) | undefined,
      testid: 'stat-total-visits',
    },
    {
      label: '확정 일정',
      value: allConfirmed,
      unit: '개',
      color: colors.gray[900],
      onClick: undefined as (() => void) | undefined,
      testid: undefined,
    },
    {
      label: '다음 혜택까지',
      value: nextBenefitStamps ?? '-',
      unit: nextBenefitStamps != null ? '개' : undefined,
      color: colors.primary[600],
      onClick: onTapBoards,
      testid: undefined,
    },
    {
      label: '미사용 혜택',
      value: unusedBenefits,
      unit: '개',
      color: unusedBenefits > 0 ? colors.accent[500] : colors.gray[300],
      onClick: onTapBenefits,
      testid: undefined,
    },
  ];

  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-2 gap-[1px]">
        {cells.map(cell => (
          <button
            key={cell.label}
            data-testid={cell.testid}
            onClick={cell.onClick}
            disabled={!cell.onClick}
            className={`bg-white px-[14px] py-[16px] text-left ${
              cell.onClick ? 'active:bg-gray-50 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="flex items-baseline gap-[3px]">
              <span
                className="text-[30px] font-bold leading-none"
                style={{ color: cell.color }}
              >
                {cell.value}
              </span>
              {cell.unit && (
                <span
                  className="text-[14px] font-medium leading-none"
                  style={{ color: cell.color }}
                >
                  {cell.unit}
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-400 mt-[6px] leading-none">{cell.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
