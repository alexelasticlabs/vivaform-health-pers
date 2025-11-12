import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import * as api from "@/api";
import renderWithProviders from "@/test/render-helper";

vi.mock("@/api", async () => {
  const actual: any = await vi.importActual("@/api");
  return {
    ...actual,
    fetchDailyDashboard: vi.fn().mockResolvedValue({
      nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
      water: { totalMl: 0 },
      weight: { latest: null },
      recommendations: [],
      goals: { calories: 2000, waterMl: 2000 }
    }),
    fetchWeightHistory: vi.fn().mockResolvedValue([]),
    tryGetQuizProfile: vi.fn().mockResolvedValue(null),
    syncCheckoutSession: vi.fn().mockResolvedValue({ success: true, message: "ok" }),
    createWaterEntry: vi.fn().mockResolvedValue({ id: 'w1', amountMl: 250, date: new Date().toISOString() })
  };
});
vi.mock("@/api/weight", () => ({ fetchWeightHistory: vi.fn().mockResolvedValue([]) }));
vi.mock("@/api/quiz", () => ({ tryGetQuizProfile: vi.fn().mockResolvedValue(null) }));

vi.mock("../../store/user-store", async () => {
  const mockState = { profile: { tier: "FREE", name: "Test", email: "t@e.com" }, accessToken: null };
  const api = {
    useUserStore: (selector: any) => selector(mockState),
  } as any;
  api.useUserStore.getState = () => ({
    ...mockState,
    setTier: (tier: string) => { mockState.profile.tier = tier; }
  });
  return api;
});

// Переносим импорты компонентов после всех моков
import { AppShell } from "@/components/layouts/app-shell";
import { DashboardPage } from "./dashboard-page";

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
