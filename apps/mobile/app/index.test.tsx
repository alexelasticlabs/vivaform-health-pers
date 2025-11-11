import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("expo-router", () => ({
  Link: ({ children }: any) => children,
  router: { replace: vi.fn(), push: vi.fn() }
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { nutrition: { summary: { calories: 0, protein: 0 } }, water: { totalMl: 0 }, weight: { latest: { weightKg: 0 } }, recommendations: [] }, isLoading: false })
}));

vi.mock("../src/store/user-store", () => ({
  useUserStore: (sel: any) => sel({ isAuthenticated: true, profile: { tier: "FREE" } })
}));

import HomeScreen from "./";

describe("HomeScreen", () => {
  it("отображает CTA", () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Открыть дневник/i)).toBeTruthy();
  });
});