import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AuthUser, SubscriptionTier } from "@vivaform/shared";

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

// Dynamic storage: переключается на лету по флагу rememberMe в localStorage
const getEffectiveStorage = (): Storage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    } as unknown as Storage;
  }
  try {
    const remember = localStorage.getItem('rememberMe');
    return remember === 'true' ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

const dynamicStorage = {
  getItem: (name: string) => getEffectiveStorage().getItem(name),
  setItem: (name: string, value: string) => getEffectiveStorage().setItem(name, value),
  removeItem: (name: string) => getEffectiveStorage().removeItem(name)
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
      logout: () => set({ profile: null, accessToken: null, isAuthenticated: false })
    }),
    {
      name: "vivaform-auth",
      storage: createJSONStorage(() => dynamicStorage),
      partialize: (state) => ({ accessToken: state.accessToken, profile: state.profile, isAuthenticated: state.isAuthenticated }) as Pick<UserStore, 'accessToken' | 'profile' | 'isAuthenticated'>
    }
  )
);