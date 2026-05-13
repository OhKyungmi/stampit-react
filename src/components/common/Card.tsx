import React from 'react';

/**
 * 스탬핏 Card 컴포넌트
 *
 * variant:
 *   surface   — 흰색 카드 (일정 카드, 도장판 카드, 혜택 현황 등 기본)
 *   highlight — 인디고 배경 (FocusCard 단독 사용)
 *   tinted    — 연한 색상 배경 (달성 혜택, 안내 배너)
 *
 * accent (surface 한정):
 *   none    — border만
 *   success — 좌측 초록 강조선 (확정 일정)
 *   warning — 좌측 amber 강조선 (날짜 경과 미확정)
 *   danger  — 좌측 red 강조선 (7일+ 경과)
 *   primary — 좌측 인디고 강조선 (오늘의 일정)
 */

type CardVariant = 'surface' | 'highlight' | 'tinted';
type CardAccent = 'none' | 'success' | 'warning' | 'danger' | 'primary';
type TintColor = 'indigo' | 'amber' | 'green' | 'red' | 'gray';

interface CardProps {
  variant?: CardVariant;
  accent?: CardAccent;
  tintColor?: TintColor;   // variant=tinted 일 때만
  padding?: 'sm' | 'md' | 'lg' | 'none';
  radius?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const accentStyles: Record<CardAccent, string> = {
  none:    '',
  success: 'border-l-[3px] border-l-emerald-500',
  warning: 'border-l-[3px] border-l-amber-400',
  danger:  'border-l-[3px] border-l-red-500',
  primary: 'border-l-[3px] border-l-indigo-600',
};

const tintStyles: Record<TintColor, string> = {
  indigo: 'bg-indigo-50 border border-indigo-200',
  amber:  'bg-amber-50 border border-amber-200',
  green:  'bg-emerald-50 border border-emerald-200',
  red:    'bg-red-50 border border-red-200',
  gray:   'bg-gray-50 border border-gray-200',
};

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

const radiusStyles = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

export default function Card({
  variant = 'surface',
  accent = 'none',
  tintColor = 'indigo',
  padding = 'md',
  radius = 'lg',
  children,
  className = '',
  onClick,
}: CardProps) {
  const base = 'overflow-hidden';

  const variantClass = {
    surface:   `bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${accentStyles[accent]}`,
    highlight: 'bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.25)]',
    tinted:    tintStyles[tintColor],
  }[variant];

  return (
    <div
      className={[
        base,
        variantClass,
        paddingStyles[padding],
        radiusStyles[radius],
        onClick ? 'cursor-pointer active:opacity-90 transition-opacity' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
