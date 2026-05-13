export default function Slide1Tickets() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* 뒤 티켓 (연한 인디고) */}
      <rect x="20" y="35" width="70" height="42" rx="8"
        fill="#C7D2FE" transform="rotate(-12 55 56)" />
      {/* 중간 티켓 */}
      <rect x="20" y="35" width="70" height="42" rx="8"
        fill="#818CF8" transform="rotate(-4 55 56)" />
      {/* 앞 티켓 (인디고) */}
      <rect x="20" y="35" width="70" height="42" rx="8"
        fill="#4F46E5" />
      {/* 티켓 점선 */}
      <line x1="47" y1="35" x2="47" y2="77"
        stroke="white" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      {/* 도장 원형 */}
      <circle cx="33" cy="56" r="8"
        fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
      {/* 별 */}
      <text x="30" y="61" fontSize="10" fill="white" opacity="0.8">★</text>
      {/* 바코드 라인 */}
      {[0, 3, 6, 9, 12].map(i => (
        <rect key={i} x={58 + i} y="48" width="1.5" height="16"
          fill="white" opacity="0.5" />
      ))}
    </svg>
  );
}
