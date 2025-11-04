import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { ThemeToggle } from "../theme-toggle";
import { SupportWidget } from "../support-widget";
import { VivaFormLogo } from "../viva-form-logo";
import { useUserStore } from "../../store/user-store";
import { useQuizStore } from "../../store/quiz-store";
import { UserMenu } from "../user-menu";

const marketingNav = [
  { to: "#why", label: "Why VivaForm" },
  { to: "#features", label: "Features" },
  { to: "#testimonials", label: "Reviews" },
  { to: "#faq", label: "FAQ" }
];

const footerLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/dpa", label: "Data Processing Agreement" },
  { to: "/security", label: "Security" }
];

const socialLinks = [
  { 
    name: "Twitter", 
    href: "https://twitter.com/vivaform", 
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    )
  },
  { 
    name: "Instagram", 
    href: "https://instagram.com/vivaform", 
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    name: "LinkedIn", 
    href: "https://linkedin.com/company/vivaform", 
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
      </svg>
    )
  }
];

export const MarketingShell = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const isQuiz = location.pathname === "/quiz";
  const [scrolled, setScrolled] = useState(false);
  const { profile, isAuthenticated, logout } = useUserStore();
  const { reset, answers } = useQuizStore();
  const hasPremium = (profile?.tier ?? "FREE") === "PREMIUM";
  

  const initials = (name?: string | null, email?: string) => {
    const source = name || email || "?";
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={`sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <VivaFormLogo size="md" />
          {isQuiz ? (
            <div className="flex items-center gap-3">
              {/* Minimal quiz header: theme toggle optional, Support link */}
              <a href="#faq" className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-muted-foreground">Support</a>
            </div>
          ) : isLanding ? (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/app"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:translate-y-[1px]"
                  >
                    Go to Dashboard
                  </NavLink>
                  <UserMenu
                    user={{
                      name: profile?.name || profile?.email || "User",
                      email: profile?.email || undefined,
                      avatarUrl: undefined,
                      initials: initials(profile?.name, profile?.email),
                      role: profile?.role === 'ADMIN' ? 'admin' : 'user'
                    }}
                    plan={hasPremium ? 'premium' : 'free'}
                    onNavigate={(path: string) => {
                      if (path === '/quiz') reset();
                      navigate(path);
                    }}
                    onLogout={() => { logout(); navigate('/'); }}
                    source="marketing"
                  />
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="rounded-xl border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:scale-[1.01] hover:border-muted-foreground hover:shadow-md active:scale-[0.99]"
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/quiz"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:translate-y-[1px]"
                  >
                    Take the Quiz
                  </NavLink>
                </>
              )}
            </div>
          ) : (
            <>
              <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                {marketingNav.map((item) => (
                  <a
                    key={item.label}
                    href={item.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to="/app"
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.99]"
                    >
                      Go to Dashboard
                    </NavLink>
                    <UserMenu
                      user={{
                        name: profile?.name || profile?.email || "User",
                        email: profile?.email || undefined,
                        avatarUrl: undefined,
                        initials: initials(profile?.name, profile?.email),
                        role: profile?.role === 'ADMIN' ? 'admin' : 'user'
                      }}
                      plan={hasPremium ? 'premium' : 'free'}
                      onNavigate={(path: string) => {
                        if (path === '/quiz') reset();
                        navigate(path);
                      }}
                      onLogout={() => { logout(); navigate('/'); }}
                      source="marketing"
                    />
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="rounded-xl border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:scale-[1.01] hover:border-muted-foreground hover:shadow-md active:scale-[0.99]"
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.99]"
                    >
                      Get started
                    </NavLink>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      
      {children}
      
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <VivaFormLogo size="md" />
              <p className="mt-4 max-w-prose text-sm text-muted-foreground">
                Feel-good nutrition, guided by experts. Personalized plans, habit coaching, and clear progress—without selling your data.
              </p>
              <div className="mt-6 flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/premium" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Premium
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
            <span>© {new Date().getFullYear()} VivaForm. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                🔒 GDPR Compliant
              </span>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                ✓ ISO 27001
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      <SupportWidget />
    </div>
  );
};