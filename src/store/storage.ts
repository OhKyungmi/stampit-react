import { useStorageAlertStore } from './storageAlertStore';
import { useErrorToastStore } from './errorToastStore';

/** React 앱 전용 스토리지 키 (구 바닐라 앱과 분리) */
export const STORAGE_KEY = 'stampit_react_v1';

/** LocalStorage에서 데이터를 불러옵니다 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    // JSON 파싱 실패 — 기본값으로 복구하고 사용자에게 알림
    useErrorToastStore.getState().show('데이터를 불러오는 데 문제가 생겼어요. 일부 정보가 초기화될 수 있어요.');
    return defaultValue;
  }
}

/** LocalStorage에 데이터를 저장합니다 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // 저장 성공 후 임계값 체크
    useStorageAlertStore.getState().checkThreshold();
  } catch (e) {
    // QuotaExceededError 감지
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      useStorageAlertStore.getState().triggerQuotaExceeded();
    } else {
      // 기타 저장 오류
      useErrorToastStore.getState().show('데이터 저장 중 오류가 발생했어요. 변경 사항이 유지되지 않을 수 있어요.');
    }
    // 저장 실패 시 무시 (메모리 상태는 유지)
  }
}
