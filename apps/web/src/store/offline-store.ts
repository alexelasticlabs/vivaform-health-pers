import { create } from 'zustand';

interface OfflineState {
  // true — network issues (no response at all)
  offline: boolean;
  // true — server frequently responds 5xx (error burst)
  backendDown: boolean;
  // last error (any type)
  lastErrorTs: number | null;
  // window/counter for 5xx
  error5xxCount: number;
  error5xxWindowStart: number | null;
  // actions
  setOffline: (value: boolean) => void;
  markServerError: () => void;
  clearServerErrors: () => void;
}

const FIVE_XX_WINDOW_MS = 15_000; // 15 seconds
const FIVE_XX_THRESHOLD = 3; // per window

export const useOfflineStore = create<OfflineState>((set, get) => ({
  offline: false,
  backendDown: false,
  lastErrorTs: null,
  error5xxCount: 0,
  error5xxWindowStart: null,
  setOffline: (value) => set({ offline: value, lastErrorTs: value ? Date.now() : get().lastErrorTs }),
  markServerError: () => {
    const now = Date.now();
    const { error5xxWindowStart, error5xxCount } = get();
    if (!error5xxWindowStart || now - error5xxWindowStart > FIVE_XX_WINDOW_MS) {
      // new window
      set({ error5xxWindowStart: now, error5xxCount: 1, lastErrorTs: now, backendDown: false });
    } else {
      const newCount = error5xxCount + 1;
      set({ error5xxCount: newCount, lastErrorTs: now, backendDown: newCount >= FIVE_XX_THRESHOLD });
    }
  },
  clearServerErrors: () => set({ backendDown: false, error5xxCount: 0, error5xxWindowStart: null })
}));
