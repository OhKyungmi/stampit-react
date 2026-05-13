import { useEffect } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

/** 스플래시 화면 */
export default function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-col items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">✦</div>
        <h1 className="text-4xl font-bold mb-2">스탬핏</h1>
        <p className="text-indigo-200 text-sm">도장판 관리 앱</p>
      </div>
    </div>
  );
}
