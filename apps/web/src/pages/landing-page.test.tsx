import renderWithProviders from "@/test/render-helper";
import { LandingPage } from "@/pages/landing-page";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

// Mock analytics module
vi.mock("../lib/analytics", () => ({
  trackConversion: vi.fn()
}));

describe("LandingPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has navigation links", () => {
    renderWithProviders(<LandingPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
