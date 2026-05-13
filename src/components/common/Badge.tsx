import React from 'react';

/**
 * 스탬핏 Badge 컴포넌트
 *
 * 색상별 의미 고정 — 임의 색상 사용 금지
 *
 *   indigo  — 상태 표시 (재관람, 활성)
 *   amber   — 달성 혜택, 추천, 특별 이벤트
 *   green   — 완료, 성공 (확정)
 *   red     — 경고, 위험, 삭제됨
 *   gray    — 비활성, 삭제됨, 일반 정보
 *   primary — 인디고 filled (순위, 카운트)
 */

type BadgeColor = 'indigo' | 'amber' | 'green' | 'red' | 'gray' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  indigo:  'bg-indigo-50 text-indigo-600',
  amber:   'bg-amber-50 text-amber-800',
  green:   'bg-emerald-50 text-emerald-700',
  red:     'bg-red-50 text-red-700',
  gray:    'bg-gray-100 text-gray-500',
  primary: 'bg-indigo-600 text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-[12px] px-2.5 py-1',
};

export default function Badge({
  color = 'gray',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center',
        'rounded-full',
        'font-medium',
        'whitespace-nowrap',
        colorStyles[color],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
