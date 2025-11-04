import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DashboardPage } from "./dashboard-page";

vi.mock("../../api/subscriptions", () => ({
  syncCheckoutSession: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock("../../api", () => ({
  fetchDailyDashboard: vi.fn().mockResolvedValue({
    nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
    water: { totalMl: 0 },
    weight: { latest: null },
    recommendations: []
  }),
  createWaterEntry: vi.fn().mockResolvedValue({}),
  createNutritionEntry: vi.fn().mockResolvedValue({}),
  createWeightEntry: vi.fn().mockResolvedValue({})
}));

vi.mock("../../api/weight", () => ({
  fetchWeightHistory: vi.fn().mockResolvedValue([])
}));

vi.mock("../../api/quiz", () => ({
  getQuizProfile: vi.fn().mockResolvedValue({ recommendedCalories: 2000, heightCm: 175 })
}));

// Mock store to avoid null user
vi.mock("../../store/user-store", async () => {
  return {
    useUserStore: (selector: any) => selector({ profile: { tier: "FREE", name: "Test", email: "t@e.com" } })
  };
});

const renderWithProviders = (initialEntry: string) => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/app" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("DashboardPage premium sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("вызывает syncCheckoutSession при premium=success и session_id", async () => {
    const { syncCheckoutSession } = await import("../../api/subscriptions");

    renderWithProviders("/app?premium=success&session_id=cs_test_123");

    await waitFor(() => {
      expect(syncCheckoutSession).toHaveBeenCalledWith("cs_test_123");
    });
  });
});
