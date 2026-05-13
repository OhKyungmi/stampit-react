import React, { forwardRef } from 'react';

/**
 * 스탬핏 Input 컴포넌트
 *
 * 모든 입력 필드 동일 스타일 통일
 * - height: 48px
 * - border: 1.5px solid gray-200
 * - border-radius: 12px (rounded-xl)
 * - focus: indigo border + ring
 * - error: red border + ring
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode; // 우측 아이콘/버튼
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  required,
  error,
  hint,
  rightElement,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* 레이블 */}
      {label && (
        <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && (
            <span className="text-red-500 text-[13px]">*</span>
          )}
        </label>
      )}

      {/* 입력 필드 컨테이너 */}
      <div className="relative flex items-center">
        <input
          ref={ref}
          className={[
            'w-full h-12',                         // 48px
            'px-3.5',
            'text-[16px] text-gray-900',
            'placeholder:text-gray-300',
            'bg-white',
            'border-[1.5px] rounded-xl',           // 12px radius
            'outline-none',
            'transition-all duration-150',
            error
              ? 'border-red-500 ring-[3px] ring-red-50'
              : 'border-gray-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-50',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            rightElement ? 'pr-10' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {/* 우측 요소 (클리어 버튼, 아이콘 등) */}
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-[12px] text-red-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}

      {/* 힌트 */}
      {hint && !error && (
        <p className="text-[12px] text-gray-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
