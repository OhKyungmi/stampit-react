import { create } from 'zustand';
import type { UndoAction } from '../types';

interface UndoStore {
  action: UndoAction | null;
  setAction: (action: UndoAction) => void;
  clearAction: () => void;
}

export const useUndoStore = create<UndoStore>((set) => ({
  action: null,
  setAction: (action) => set({ action }),
  clearAction: () => set({ action: null }),
}));
