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
    const quizLinks = screen.getAllByRole("link", { name: /Take the Quiz|Continue quiz|Go to Dashboard|Open my plan/i });
    expect(quizLinks.length).toBeGreaterThan(0);
    // Check for any login/sign-in link presence
    expect(screen.getAllByRole("link").some(l => /Log in|Sign in/i.test(l.textContent || ""))).toBe(true);
  });

  it("renders phone mockup", () => {
    setup();
    expect(screen.getByLabelText(/Phone mockup/i)).toBeInTheDocument();
    // Floating tags removed per design update
  });
});
