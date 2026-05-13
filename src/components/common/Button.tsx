import React from 'react';

/**
 * 스탬핏 Button 컴포넌트
 *
 * variant:
 *   primary  — 주요 CTA (확정하기, 저장, 시작하기)
 *   secondary — 대안 선택 (빠른 시작, outline)
 *   ghost    — 비강조 액션 (건너뛰기, 나중에, 취소)
 *   danger   — 위험 액션 (삭제, 초기화)
 *
 * size:
 *   cta  — 54px (주요 CTA, 온보딩)
 *   md   — 48px (일반 버튼)
 *   sm   — 44px (ghost, 인라인)
 */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'cta' | 'md' | 'sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-indigo-600 text-white',
    'hover:bg-indigo-700 active:bg-indigo-800',
    'disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed',
    'shadow-[0_4px_12px_rgba(79,70,229,0.25)]',
    'disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-white text-indigo-600',
    'border-[1.5px] border-indigo-600',
    'hover:bg-indigo-50 active:bg-indigo-100',
    'disabled:bg-white disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-gray-400',
    'hover:text-gray-600',
    'disabled:text-gray-300 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-red-500 text-white',
    'hover:bg-red-600 active:bg-red-700',
    'disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  cta: 'h-[54px] text-[17px] font-semibold rounded-2xl px-6',
  md:  'h-[48px] text-[16px] font-semibold rounded-xl px-5',
  sm:  'h-[44px] text-[14px] font-medium rounded-xl px-4',
};

export default function Button({
  variant = 'primary',
  size = 'cta',
  fullWidth = true,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'flex items-center justify-center',
        'transition-all duration-150',
        'select-none',
        fullWidth ? 'w-full' : '',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          처리 중...
        </span>
      ) : children}
    </button>
  );
}
