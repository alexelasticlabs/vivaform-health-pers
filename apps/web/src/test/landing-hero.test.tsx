import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../pages/landing-page";

describe("Landing Hero", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

  it("renders headline and CTAs", () => {
    setup();
    expect(screen.getByText(/Discover your perfect nutrition plan/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Take the Quiz/i })).toBeInTheDocument();
    // "Log in" removed from hero per new design
  });

  it("renders phone mockup", () => {
    setup();
    expect(screen.getByLabelText(/Phone mockup/i)).toBeInTheDocument();
    // Floating tags removed per design update
  });
});
