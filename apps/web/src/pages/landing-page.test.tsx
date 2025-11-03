import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LandingPage } from "./landing-page";

// Mock analytics module
vi.mock("../lib/analytics", () => ({
  trackConversion: vi.fn()
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LandingPage", () => {
  it("renders without crashing", () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has navigation links", () => {
    renderWithRouter(<LandingPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
