import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthTokens, AuthUser, SubscriptionTier } from "@vivaform/shared";

import { setSessionTokens } from "../session/tokens";

export type MobileUserProfile = AuthUser & {
  tier?: SubscriptionTier;
};

type UserState = {
  profile: MobileUserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setSession: (profile: MobileUserProfile, tokens: AuthTokens) => void;
  updateProfile: (profile: Partial<MobileUserProfile>) => void;
  setTier: (tier: SubscriptionTier) => void;
  clearSession: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      tokens: null,
      isAuthenticated: false,
      setSession: (profile, tokens) => {
        set({
          profile: { ...profile, tier: profile.tier ?? "FREE" },
          tokens,
          isAuthenticated: true
        });
        setSessionTokens(tokens);
      },
      updateProfile: (profile) =>
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
      clearSession: () => {
        set({ profile: null, tokens: null, isAuthenticated: false });
        setSessionTokens(null);
      }
    }),
    {
      name: "vivaform-mobile-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.tokens) {
          setSessionTokens(state.tokens);
        }
      }
    }
  )
);