import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from './storage';
import type { AppSettings } from '../types';

interface SettingsStore {
  settings: AppSettings;
  setShowRealCost: (v: boolean) => void;
  setOnboardingDone: () => void;
  setQuickStartDone: () => void;
  setSeenConfirmTip: () => void;
  setLastUsed: (showId: string, seatGradeId: string, discountTypeId: string) => void;
}

const SETTINGS_KEY = 'stampit_settings';

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: loadFromStorage<AppSettings>(SETTINGS_KEY, { showRealCost: true, onboardingDone: false }),
  setShowRealCost: (v) =>
    set(state => {
      const next = { ...state.settings, showRealCost: v };
      saveToStorage(SETTINGS_KEY, next);
      return { settings: next };
    }),
  setOnboardingDone: () =>
    set(state => {
      const next = { ...state.settings, onboardingDone: true };
      saveToStorage(SETTINGS_KEY, next);
      return { settings: next };
    }),
  setQuickStartDone: () =>
    set(state => {
      const next = { ...state.settings, hasCompletedQuickStart: true };
      saveToStorage(SETTINGS_KEY, next);
      return { settings: next };
    }),
  setSeenConfirmTip: () =>
    set(state => {
      const next = { ...state.settings, hasSeenConfirmTip: true };
      saveToStorage(SETTINGS_KEY, next);
      return { settings: next };
    }),
  setLastUsed: (showId, seatGradeId, discountTypeId) =>
    set(state => {
      const next = {
        ...state.settings,
        lastUsedShowId: showId,
        lastUsedSeatGradeId: seatGradeId,
        lastUsedDiscountTypeId: discountTypeId,
      };
      saveToStorage(SETTINGS_KEY, next);
      return { settings: next };
    }),
}));
