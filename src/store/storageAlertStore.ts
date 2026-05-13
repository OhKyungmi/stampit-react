import { create } from 'zustand';
import { getStorageInfo, WARN_THRESHOLD_PCT, DANGER_THRESHOLD_PCT } from '../utils/storageUtils';

export type StorageStatus = 'ok' | 'warning' | 'danger' | 'quota-exceeded';

interface StorageAlertStore {
  status: StorageStatus;
  manageSheetOpen: boolean;
  /** QuotaExceededError 발생 시 시트에 표시할 메시지 */
  errorMessage: string | null;
  /** 경고 배너를 이번 세션에서 닫았는지 (localStorage 저장 안 함) */
  warnDismissed: boolean;

  /** 저장 성공 후 호출 — 임계값 체크 및 상태 갱신 */
  checkThreshold: () => void;
  /** QuotaExceededError 발생 시 호출 */
  triggerQuotaExceeded: () => void;
  openManageSheet: () => void;
  /** 위험/quota-exceeded 상태에서는 닫기 불가 */
  closeManageSheet: () => void;
  dismissWarning: () => void;
}

export const useStorageAlertStore = create<StorageAlertStore>((set, get) => ({
  status: 'ok',
  manageSheetOpen: false,
  errorMessage: null,
  warnDismissed: false,

  checkThreshold: () => {
    const info = getStorageInfo();
    const pct = info.percentage;
    let status: StorageStatus = 'ok';
    if (pct >= DANGER_THRESHOLD_PCT) status = 'danger';
    else if (pct >= WARN_THRESHOLD_PCT) status = 'warning';

    set(prev => {
      const next: Partial<StorageAlertStore> = { status };
      // 위험 구간 진입 시 시트 자동 오픈 (이미 열려 있지 않을 때)
      if (status === 'danger' && !prev.manageSheetOpen) {
        next.manageSheetOpen = true;
        next.errorMessage = null;
      }
      return next;
    });
  },

  triggerQuotaExceeded: () => {
    set({
      status: 'quota-exceeded',
      manageSheetOpen: true,
      errorMessage: '저장 공간이 꽉 찼어요. 이미지를 삭제하면 저장할 수 있어요.',
    });
  },

  openManageSheet: () => set({ manageSheetOpen: true, errorMessage: null }),

  closeManageSheet: () => {
    const { status } = get();
    if (status === 'danger' || status === 'quota-exceeded') return; // 강제 오픈 상태
    set({ manageSheetOpen: false, errorMessage: null });
  },

  dismissWarning: () => set({ warnDismissed: true }),
}));
