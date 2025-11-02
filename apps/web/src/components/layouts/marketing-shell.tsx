import { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";

import { ThemeToggle } from "../theme-toggle";
import { SupportWidget } from "../support-widget";

const marketingNav = [
  { to: "#journey", label: "How it works" },
  { to: "#features", label: "Features" },
  { to: "#app", label: "Apps" },
  { to: "#pricing", label: "Pricing" },
  { to: "#faq", label: "FAQ" }
];

export const MarketingShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-surface text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            VivaForm
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {marketingNav.map((item) => (
              <a key={item.label} href={item.to} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink to="/login" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-muted">
              Log in
            </NavLink>
            <NavLink to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow">
              Get started
            </NavLink>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-border/50 bg-background/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} VivaForm. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
      <SupportWidget />
    </div>
  );
};