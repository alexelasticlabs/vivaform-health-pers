import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthTokens, AuthUser, SubscriptionTier } from "@vivaform/shared";

type UserStore = {
  profile: (AuthUser & { tier?: SubscriptionTier; mustChangePassword?: boolean }) | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (profile: AuthUser & { tier?: SubscriptionTier; mustChangePassword?: boolean }, accessToken: string, refreshToken: string) => void;
  setTokens: (tokens: AuthTokens) => void;
  setProfile: (profile: Partial<AuthUser & { mustChangePassword?: boolean }>) => void;
  setTier: (tier: SubscriptionTier) => void;
  logout: () => void;
};

const initialState = {
  profile: null,
  tokens: null,
  isAuthenticated: false
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (profile, accessToken, refreshToken) =>
        set({
          profile: { ...profile, tier: profile.tier ?? "FREE" },
          tokens: { accessToken, refreshToken },
          isAuthenticated: true
        }),
      setTokens: (tokens) =>
        set((state) =>
          state.profile
            ? {
                tokens,
                profile: state.profile,
                isAuthenticated: true
              }
            : { tokens, isAuthenticated: false, profile: null }
        ),
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
      logout: () => set({ profile: null, tokens: null, isAuthenticated: false })
    }),
    {
      name: "vivaform-auth"
    }
  )
);