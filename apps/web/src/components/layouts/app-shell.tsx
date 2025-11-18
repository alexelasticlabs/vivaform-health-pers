import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ThemeToggle } from "../theme-toggle";
import { VivaFormLogo } from "../viva-form-logo";
import { useUserStore } from "@/store/user-store";
import { useQuizStore } from "@/store/quiz-store";
import { useOfflineStore } from "@/store/offline-store";
import { useQueryClient } from "@tanstack/react-query";
import { syncCheckoutSession } from "@/api";
import { Bell, Menu, X } from "lucide-react";
import { UserMenu } from "../user-menu";

const appNav = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/progress", label: "Progress" },
  { to: "/app/meal-planner", label: "Meal Planner", premium: true },
  { to: "/app/recommendations", label: "Recommendations" },
  { to: "/app/settings", label: "Settings" }
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const profile = useUserStore((state) => state.profile);
  const logout = useUserStore((state) => state.logout);
  // Avoid destructuring setTier from the store to prevent missing method in tests
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useQuizStore();
  const offline = useOfflineStore((s) => s.offline);
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasPremium = (profile?.tier ?? "FREE") === "PREMIUM";

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/login");
  };

  useEffect(() => {
    // Close mobile sheet on route change
    setMobileOpen(false);

    // Show success toast after premium activation
    const params = new URLSearchParams(location.search);
    if (params.get('premium') === 'success') {
      const sessionId = params.get('session_id');
      const finish = () => {
        params.delete('premium');
        params.delete('session_id');
        const clean = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        if (clean !== `${location.pathname}${location.search}`) {
          window.history.replaceState(null, '', clean);
        }
      };
      (async () => {
        try {
          if (sessionId) {
            await syncCheckoutSession(sessionId);
            // Update local store since it is the source of truth for tier
            const setTierFn = (useUserStore.getState() as any).setTier;
            if (typeof setTierFn === 'function') {
              setTierFn('PREMIUM');
            }
            // Invalidate relevant query keys to re-render widgets
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
              queryClient.invalidateQueries({ queryKey: ['quiz-profile'] }),
              queryClient.invalidateQueries({ queryKey: ['weight-history'] })
            ]);
          }
          toast.success('VivaForm+ activated! Enjoy premium features.');
        } catch (e) {
          console.error('Failed to sync subscription:', e);
          toast.error('Please refresh the page to see your premium status');
        } finally {
          finish();
        }
      })();
    }
  }, [location.pathname, location.search, queryClient]);

  // Avatars initials helper
  const initials = useMemo(() => {
    const source = profile?.name || profile?.email || "?";
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }, [profile]);

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        {offline && (
          <div className="w-full bg-amber-500 text-white text-center text-xs py-1">Backend is unavailable. In dev, requests go through /api proxy → http://localhost:4000. Make sure the backend is running.</div>
        )}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-xl border border-border p-2 md:hidden"
              aria-label="Open navigation menu"
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <VivaFormLogo size="sm" />
            {hasPremium && (
              <span data-testid="app-premium-badge" className="hidden md:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                <span aria-hidden>🌟</span> VivaForm+
              </span>
            )}
          </div>

          {/* Center tabs (desktop) */}
          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {appNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.label}
                {"premium" in item && item.premium && profile?.tier !== "PREMIUM" && (
                  <span className="ml-1 text-xs">✨</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex items-center justify-center rounded-xl border border-border p-2 text-muted-foreground transition hover:text-foreground"
              onClick={() => toast.message("No new notifications")}
            >
              <Bell size={18} />
            </button>
            <UserMenu
              user={{
                name: profile?.name || profile?.email || "User",
                email: profile?.email || undefined,
                avatarUrl: undefined,
                initials,
                role: profile?.role === 'ADMIN' ? 'admin' : 'user',
              }}
              plan={hasPremium ? 'premium' : 'free'}
              onNavigate={(path) => { if (path === '/quiz') { reset(); } navigate(path); }}
              onLogout={handleLogout}
              source="app"
            />
          </div>
        </div>

        {/* Mobile sheet */}
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-nav-title"
          className={`md:hidden fixed inset-0 z-40 ${mobileOpen ? '' : 'pointer-events-none'}`}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileOpen(false)}
          />
          <div className={`absolute left-0 top-0 h-full w-72 transform bg-background/95 backdrop-blur-xl transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-border/40`}>
            <div className="flex items-center justify-between px-4 py-3">
              <h2 id="mobile-nav-title" className="text-sm font-semibold">Navigation</h2>
              <button aria-label="Close menu" className="rounded-xl border border-border p-2" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-2 pb-4 text-sm">
              {appNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-card'}`
                  }
                >
                  {item.label}
                  {"premium" in item && item.premium && profile?.tier !== "PREMIUM" && (
                    <span className="ml-1 text-xs">✨</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 gap-6 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
};