export const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB
export const WARN_THRESHOLD_PCT = 80;
export const DANGER_THRESHOLD_PCT = 95;

export interface StorageInfo {
  usedBytes: number;
  limitBytes: number;
  percentage: number; // 0~100
  usedLabel: string;  // "1.2MB"
  limitLabel: string; // "5MB"
}

/** localStorage 전체 사용량 계산 (UTF-16 기준 2byte/char) */
export function getStorageInfo(): StorageInfo {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) ?? '';
    const value = localStorage.getItem(key) ?? '';
    totalBytes += (key.length + value.length) * 2;
  }
  return {
    usedBytes: totalBytes,
    limitBytes: STORAGE_LIMIT_BYTES,
    percentage: Math.min(100, (totalBytes / STORAGE_LIMIT_BYTES) * 100),
    usedLabel: formatBytes(totalBytes),
    limitLabel: formatBytes(STORAGE_LIMIT_BYTES),
  };
}

/** base64 data URL의 localStorage 점유 바이트 추정 */
export function getImageBytes(base64: string): number {
  return base64.length * 2;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
