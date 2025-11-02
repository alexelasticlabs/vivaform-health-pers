import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AuthTokens, AuthUser, SubscriptionTier } from "@vivaform/shared";

type UserStore = {
  profile: (AuthUser & { tier?: SubscriptionTier }) | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (profile: AuthUser & { tier?: SubscriptionTier }, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setProfile: (profile: Partial<AuthUser>) => void;
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
      setAuth: (profile, tokens) =>
        set({
          profile: { ...profile, tier: profile.tier ?? "FREE" },
          tokens,
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