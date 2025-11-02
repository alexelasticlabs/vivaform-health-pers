import { describe, it, expect, vi, beforeEach } from "vitest";
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Hero Section", () => {
    it("renders main heading and subheading", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByRole("heading", { name: /transform your health/i })).toBeInTheDocument();
      expect(screen.getByText(/no cookie-cutter diets/i)).toBeInTheDocument();
    });

    it("renders primary CTA button with correct text", () => {
      renderWithRouter(<LandingPage />);

      const ctaButton = screen.getByRole("link", { name: /get your free plan now/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute("href", "/register");
    });

    it("renders login button", () => {
      renderWithRouter(<LandingPage />);

      const loginButton = screen.getByRole("link", { name: /log in/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute("href", "/login");
    });

    it("displays social proof statistics", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText("25,000+")).toBeInTheDocument();
      expect(screen.getByText(/people who finished the quiz/i)).toBeInTheDocument();
      expect(screen.getByText("-3.4 kg in 30 days")).toBeInTheDocument();
      expect(screen.getByText("86% keep logging")).toBeInTheDocument();
    });
  });

  describe("Journey Section", () => {
    it("renders all journey steps", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/discover your personalized plan/i)).toBeInTheDocument();
      expect(screen.getByText(/see your roadmap instantly/i)).toBeInTheDocument();
      expect(screen.getByText(/build momentum daily/i)).toBeInTheDocument();
    });

    it("shows step numbers", () => {
      renderWithRouter(<LandingPage />);

      const section = screen.getByText(/discover your personalized plan/i).closest("article");
      expect(section?.textContent).toContain("1");
    });
  });

  describe("Features Section", () => {
    it("renders all feature highlights", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/your personal nutrition coach/i)).toBeInTheDocument();
      expect(screen.getByText(/habits that actually stick/i)).toBeInTheDocument();
      expect(screen.getByText(/ready-made meal plans/i)).toBeInTheDocument();
    });
  });

  describe("Platform Section", () => {
    it("renders all platform options", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/web dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/ios app/i)).toBeInTheDocument();
      expect(screen.getByText(/android app/i)).toBeInTheDocument();
    });
  });

  describe("Pricing Section", () => {
    it("renders free tier", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText("Free")).toBeInTheDocument();
      expect(screen.getByText("$0")).toBeInTheDocument();
    });

    it("renders premium tiers with pricing", () => {
      renderWithRouter(<LandingPage />);

      // Check for VivaForm+ mention (at least one premium tier)
      const vivaformPlus = screen.getAllByText(/vivaform\+/i);
      expect(vivaformPlus.length).toBeGreaterThan(0);
    });

    it("renders CTA buttons for each pricing tier", () => {
      renderWithRouter(<LandingPage />);

      const startButtons = screen.getAllByRole("link", { name: /start for free|try vivaform/i });
      expect(startButtons.length).toBeGreaterThan(0);
    });
  });

  describe("FAQ Section", () => {
    it("renders FAQ heading", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toBeInTheDocument();
    });

    it("renders FAQ questions", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/do i need a credit card/i)).toBeInTheDocument();
      expect(screen.getByText(/is there a trial/i)).toBeInTheDocument();
      expect(screen.getByText(/how does vivaform give recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/can i download my data/i)).toBeInTheDocument();
    });
  });

  describe("Final CTA Section", () => {
    it("renders final call-to-action", () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByRole("heading", { name: /your wellness journey starts today/i })).toBeInTheDocument();
    });

    it("renders final CTA buttons", () => {
      renderWithRouter(<LandingPage />);

      const finalCta = screen.getByRole("link", { name: /get your plan now/i });
      expect(finalCta).toBeInTheDocument();
      expect(finalCta).toHaveAttribute("href", "/register");
    });
  });

  describe("Navigation Links", () => {
    it("all register links point to /register", () => {
      renderWithRouter(<LandingPage />);

      const registerLinks = screen.getAllByRole("link", { name: /get your free plan now|get your plan now|start for free|try vivaform/i });
      registerLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/register");
      });
    });

    it("login links point to /login", () => {
      renderWithRouter(<LandingPage />);

      const loginLinks = screen.getAllByRole("link", { name: /log in|i already have an account/i });
      loginLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/login");
      });
    });
  });
});
