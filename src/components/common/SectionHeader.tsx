import React from 'react';

/**
 * 스탬핏 SectionHeader 컴포넌트
 *
 * 모든 섹션 헤더 동일 스타일 통일
 *   - font: 13px semibold gray-400
 *   - padding: 20px 위 / 8px 아래
 *
 * 사용처:
 *   현황 탭: "도장판", "혜택 현황"
 *   설정 탭: "공연 설정", "화면", "데이터", "앱 정보"
 */

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode; // 우측 액션 버튼 (+ 새 판 등)
  className?: string;
}

export default function SectionHeader({
  title,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={[
        'flex items-center justify-between',
        'px-4 pt-5 pb-2',
        className,
      ].join(' ')}
    >
      <span className="text-[13px] font-semibold text-gray-400 tracking-[0.3px]">
        {title}
      </span>
      {action && (
        <div className="flex items-center">
          {action}
        </div>
      )}
    </div>
  );
}
