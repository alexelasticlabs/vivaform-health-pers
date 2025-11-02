import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SupportWidget } from "./support-widget";

// Mock analytics module
vi.mock("../lib/analytics", () => ({
  trackConversion: vi.fn()
}));

describe("SupportWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders the support button in closed state", () => {
      render(<SupportWidget />);

      const button = screen.getByRole("button", { name: /open vivaform support/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("displays support icon and text", () => {
      render(<SupportWidget />);

      expect(screen.getByText("Support")).toBeInTheDocument();
      expect(screen.getByText("💬")).toBeInTheDocument();
    });

    it("does not show support channels when closed", () => {
      render(<SupportWidget />);

      expect(screen.queryByText(/need a hand/i)).not.toBeInTheDocument();
      expect(screen.queryByText("FAQ")).not.toBeInTheDocument();
    });
  });

  describe("Opening Widget", () => {
    it("opens and shows support channels when clicked", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      const button = screen.getByRole("button", { name: /open vivaform support/i });
      await user.click(button);

      expect(screen.getByText(/need a hand/i)).toBeInTheDocument();
      expect(screen.getByText(/the vivaform team will help you/i)).toBeInTheDocument();
    });

    it("displays all support channels when open", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));

      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Chat on Telegram")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("shows correct descriptions for each channel", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));

      expect(screen.getByText(/most common questions/i)).toBeInTheDocument();
      expect(screen.getByText("@vivaform_support")).toBeInTheDocument();
      expect(screen.getByText("hello@vivaform.app")).toBeInTheDocument();
    });

    it("updates aria-expanded attribute when opened", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      const button = screen.getByRole("button", { name: /open vivaform support/i });
      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Closing Widget", () => {
    it("closes widget when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      // Open widget
      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));
      expect(screen.getByText(/need a hand/i)).toBeInTheDocument();

      // Close widget
      const closeButton = screen.getByRole("button", { name: /hide support widget/i });
      await user.click(closeButton);

      expect(screen.queryByText(/need a hand/i)).not.toBeInTheDocument();
    });

    it("toggles between open and closed states", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      const openButton = screen.getByRole("button", { name: /open vivaform support/i });

      // Open
      await user.click(openButton);
      expect(screen.getByText(/need a hand/i)).toBeInTheDocument();

      // Close
      const closeButton = screen.getByRole("button", { name: /hide support widget/i });
      await user.click(closeButton);
      expect(screen.queryByText(/need a hand/i)).not.toBeInTheDocument();

      // Open again
      await user.click(openButton);
      expect(screen.getByText(/need a hand/i)).toBeInTheDocument();
    });
  });

  describe("Support Channels", () => {
    it("renders correct links for each channel", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));

      const faqLink = screen.getByRole("link", { name: /faq/i });
      expect(faqLink).toHaveAttribute("href", "https://help.vivaform.app/faq");

      const telegramLink = screen.getByRole("link", { name: /chat on telegram/i });
      expect(telegramLink).toHaveAttribute("href", "https://t.me/vivaform_support");

      const emailLink = screen.getByRole("link", { name: /email/i });
      expect(emailLink).toHaveAttribute("href", "mailto:hello@vivaform.app");
    });

    it("opens links in new tab with proper security attributes", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for buttons", () => {
      render(<SupportWidget />);

      expect(screen.getByRole("button", { name: /open vivaform support/i })).toBeInTheDocument();
    });

    it("has proper ARIA label for close button when open", async () => {
      const user = userEvent.setup();
      render(<SupportWidget />);

      await user.click(screen.getByRole("button", { name: /open vivaform support/i }));

      expect(screen.getByRole("button", { name: /hide support widget/i })).toBeInTheDocument();
    });

    it("marks emoji as decorative with aria-hidden", () => {
      const { container } = render(<SupportWidget />);

      const emoji = container.querySelector('[role="img"][aria-hidden="true"]');
      expect(emoji).toBeInTheDocument();
      expect(emoji?.textContent).toBe("💬");
    });
  });

  describe("Positioning", () => {
    it("renders widget in fixed position", () => {
      const { container } = render(<SupportWidget />);

      const widget = container.querySelector(".fixed.bottom-6.right-6");
      expect(widget).toBeInTheDocument();
    });

    it("has proper z-index for layering", () => {
      const { container } = render(<SupportWidget />);

      const widget = container.querySelector(".z-50");
      expect(widget).toBeInTheDocument();
    });
  });
});
