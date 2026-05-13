export default function Slide3CostCard() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* 카드 배경 */}
      <rect x="10" y="15" width="100" height="70" rx="12"
        fill="white" stroke="#A7F3D0" strokeWidth="2" />
      {/* 총 지출 */}
      <text x="20" y="38" fontSize="8"
        fill="#9CA3AF">총 지출</text>
      <text x="20" y="52" fontSize="12"
        fontWeight="bold" fill="#111827">325,000원</text>
      {/* 구분선 */}
      <line x1="20" y1="60" x2="100" y2="60"
        stroke="#F3F4F6" strokeWidth="1" />
      {/* 절약 금액 */}
      <text x="20" y="73" fontSize="8"
        fill="#9CA3AF">절약</text>
      <text x="20" y="83" fontSize="12"
        fontWeight="bold" fill="#059669">117,000원 ✓</text>
      {/* 막대 그래프 */}
      <rect x="20" y="96" width="20" height="10" rx="3" fill="#D1FAE5" />
      <rect x="45" y="90" width="20" height="16" rx="3" fill="#6EE7B7" />
      <rect x="70" y="84" width="20" height="22" rx="3" fill="#059669" />
    </svg>
  );
}
