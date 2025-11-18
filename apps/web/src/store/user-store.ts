import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AuthUser, SubscriptionTier } from "@vivaform/shared";
import { cleanupAnalyticsIdentifiers } from '@/lib/analytics-cleanup';

export type UserStore = {
  profile: (AuthUser & { tier?: SubscriptionTier; mustChangePassword?: boolean }) | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (profile: AuthUser & { tier?: SubscriptionTier; mustChangePassword?: boolean }, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setProfile: (profile: Partial<AuthUser & { mustChangePassword?: boolean }>) => void;
  setTier: (tier: SubscriptionTier) => void;
  logout: () => void;
};

const initialState = {
  profile: null,
  accessToken: null,
  isAuthenticated: false
};

const memoryStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {}
};

const getSafeSessionStorage = (): Storage => {
  if (typeof window === "undefined") {
    return memoryStorage;
  }
  try {
    return window.sessionStorage;
  } catch {
    return memoryStorage;
  }
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (profile, accessToken) =>
        set({
          profile: { ...profile, tier: profile.tier ?? "FREE" },
          accessToken,
          isAuthenticated: true
        }),
      setAccessToken: (accessToken) =>
        set((state) => ({
          accessToken,
          isAuthenticated: !!state.profile && !!accessToken
        })),
      setProfile: (profile) =>
        set((state) =>
          state.profile
            ? {
                profile: { ...state.profile, ...profile }
              }
            : state
        ),
      setTier: (tier) =>
        set((state) =>
          state.profile
            ? {
                profile: { ...state.profile, tier }
              }
            : state
        ),
      logout: () => {
        cleanupAnalyticsIdentifiers();
        set({ profile: null, accessToken: null, isAuthenticated: false });
      }
    }),
    {
      name: "vivaform-auth",
      storage: createJSONStorage(() => getSafeSessionStorage()),
      partialize: (state) => ({ profile: state.profile }) as Pick<UserStore, "profile">,
      onRehydrateStorage: () => (state) => {
        // Always reset accessToken after reload to avoid storing it in web storage
        if (state) {
          state.accessToken = null;
          state.isAuthenticated = false;
        }
      }
    }
  )
);