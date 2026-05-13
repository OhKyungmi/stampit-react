import { create } from 'zustand';

interface ErrorToastStore {
  message: string | null;
  show: (msg: string) => void;
  clear: () => void;
}

export const useErrorToastStore = create<ErrorToastStore>((set) => ({
  message: null,
  show: (msg) => set({ message: msg }),
  clear: () => set({ message: null }),
}));
