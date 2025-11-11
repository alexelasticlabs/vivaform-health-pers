import { create } from 'zustand';

interface OfflineState {
  offline: boolean;
  lastErrorTs: number | null;
  setOffline: (value: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  offline: false,
  lastErrorTs: null,
  setOffline: (value) => set({ offline: value, lastErrorTs: value ? Date.now() : null })
}));

