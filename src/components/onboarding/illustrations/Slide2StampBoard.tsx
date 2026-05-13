export default function Slide2StampBoard() {
  const stamps = [true, true, true, true, false, false, false, false, false, false];
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* 도장판 배경 */}
      <rect x="10" y="20" width="100" height="80" rx="10"
        fill="white" stroke="#FDE68A" strokeWidth="2" />
      {/* 도장 그리드 5×2 */}
      {stamps.map((filled, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const cx = 28 + col * 18;
        const cy = 42 + row * 22;
        return (
          <circle key={i} cx={cx} cy={cy} r="7"
            fill={filled ? '#F59E0B' : 'none'}
            stroke={filled ? '#F59E0B' : '#FDE68A'}
            strokeWidth="1.5"
          />
        );
      })}
      {/* 4번째 도장에 반짝임 */}
      <circle cx={28 + 3 * 18} cy={42} r="7"
        fill="#F59E0B" opacity="0.3" />
      <circle cx={28 + 3 * 18} cy={42} r="5"
        fill="#F59E0B" />
      {/* 혜택 뱃지 */}
      <rect x="72" y="14" width="36" height="16" rx="8"
        fill="#F59E0B" />
      <text x="82" y="26" fontSize="9"
        fill="white" fontWeight="bold">혜택!</text>
    </svg>
  );
}
