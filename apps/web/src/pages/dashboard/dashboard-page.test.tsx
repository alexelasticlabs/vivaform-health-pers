import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { DashboardPage } from "./dashboard-page";

import * as api from "@/api";
import renderWithProviders from "@/test/render-helper";

vi.mock("@/api", () => ({
  fetchDailyDashboard: vi.fn().mockResolvedValue({
    nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
    water: { totalMl: 0 },
    weight: { latest: null },
    recommendations: [],
    goals: { calories: 2000, waterMl: 2000 }
  }),
  fetchWeightHistory: vi.fn().mockResolvedValue([]),
  tryGetQuizProfile: vi.fn().mockResolvedValue(null)
}));
vi.mock("@/api/weight", () => ({ fetchWeightHistory: vi.fn().mockResolvedValue([]) }));
vi.mock("@/api/quiz", () => ({ tryGetQuizProfile: vi.fn().mockResolvedValue(null) }));

// Mock store to avoid null user
vi.mock("../../store/user-store", async () => {
  const mockState = { profile: { tier: "FREE", name: "Test", email: "t@e.com" }, tokens: null };
  const api = {
    useUserStore: (selector: any) => selector(mockState),
  } as any;
  api.useUserStore.getState = () => ({
    ...mockState,
    setTier: (tier: string) => { mockState.profile.tier = tier; }
  });
  return api;
});

// ВАЖНО: импорт AppShell после моков, чтобы сработал мок syncCheckoutSession внутри AppShell
import { AppShell } from "@/components/layouts/app-shell";

const renderWithProvidersLocal = (initialEntry: string) => {
  return renderWithProviders(
    <Routes>
      <Route path="/app" element={<AppShell><DashboardPage /></AppShell>} />
    </Routes>,
    { router: { initialEntries: [initialEntry] } }
  );
};

describe("DashboardPage premium sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("вызывает syncCheckoutSession при premium=success и session_id", async () => {
    const spy = vi.spyOn(api, 'syncCheckoutSession');

    renderWithProvidersLocal("/app?premium=success&session_id=cs_test_123");

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("cs_test_123");
    });
  });
});

import { applyCommonMocks } from "@/test/mocks/common-mocks";
applyCommonMocks();
