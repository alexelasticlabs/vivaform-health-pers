import { waitFor } from "@testing-library/react";
import renderWithProviders from "@/test/render-helper";
import { describe, it, expect, vi } from "vitest";
import { ProgressPage } from "@/pages/progress-page";

vi.mock("@/api", () => ({
  fetchWeightHistory: vi.fn(async () => ([
    { id: "a", date: "2025-01-01", weightKg: 80 },
    { id: "b", date: "2025-01-02", weightKg: 79.5 }
  ])),
  fetchWeightProgress: vi.fn(async () => ({ delta: -0.5 }))
}));

describe("ProgressPage", () => {
  it("renders progress cards with data", async () => {
    const { getByText } = renderWithProviders(<ProgressPage />);
    await waitFor(() => {
      expect(getByText(/Current weight/i)).toBeInTheDocument();
      expect(getByText(/Change/i)).toBeInTheDocument();
      expect(getByText(/Starting point/i)).toBeInTheDocument();
    });
  });
});
