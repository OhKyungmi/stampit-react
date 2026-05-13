import OnboardingScreen from '../components/onboarding/OnboardingScreen';

interface OnboardingScreenProps {
  onDone: () => void;
  onQuickStart?: () => void;
  onInlineQuickStart?: (name: string) => void;
}

/**
 * 온보딩 화면 — App.tsx prop 인터페이스 유지 래퍼
 * 실제 UI는 src/components/onboarding/OnboardingScreen에서 관리
 */
export default function OnboardingScreenWrapper({
  onDone,
  onQuickStart,
  onInlineQuickStart,
}: OnboardingScreenProps) {
  function handleComplete(mode: 'full' | 'quick') {
    if (mode === 'quick') {
      onQuickStart?.();
    } else {
      onDone();
    }
  }

  return (
    <OnboardingScreen
      onComplete={handleComplete}
      onSkip={onDone}
      onInlineStart={onInlineQuickStart}
    />
  );
}
