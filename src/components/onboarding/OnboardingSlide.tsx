import type { ReactNode } from 'react';

export interface SlideData {
  illustration: ReactNode;
  bgColor: string;
  title: string;
  subtitle: string;
}

export default function OnboardingSlide({ slide }: { slide: SlideData }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center pt-12">
      {/* 일러스트 카드 */}
      <div
        className="w-48 h-48 rounded-3xl flex items-center justify-center mb-7 shadow-sm"
        style={{ backgroundColor: slide.bgColor }}
      >
        {slide.illustration}
      </div>

      {/* 타이틀 */}
      <h2 className="text-2xl font-extrabold text-gray-900 text-center leading-tight whitespace-pre-line">
        {slide.title}
      </h2>

      {/* 서브텍스트 */}
      <p className="text-sm text-gray-500 text-center leading-relaxed mt-3 whitespace-pre-line">
        {slide.subtitle}
      </p>
    </div>
  );
}
