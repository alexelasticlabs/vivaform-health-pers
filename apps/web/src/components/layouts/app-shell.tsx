import { PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ThemeToggle } from "../theme-toggle";
import { useUserStore } from "../../store/user-store";

const appNav = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/progress", label: "Progress" },
  { to: "/app/recommendations", label: "Recommendations" },
  { to: "/app/settings", label: "Settings" }
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const profile = useUserStore((state) => state.profile);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  toast.success("You have been logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold tracking-tight">VivaForm</div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex w-full items-center justify-between gap-3 overflow-x-auto text-sm font-medium md:flex-1 md:justify-center">
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
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-3 text-sm">
            <ThemeToggle />
            <div className="text-right">
              <p className="font-semibold leading-tight">{profile?.name ?? profile?.email ?? "Profile"}</p>
              <p className="text-xs uppercase text-muted-foreground">{profile?.tier === "PREMIUM" ? "VivaForm+" : "Free"}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 gap-6 px-6 py-8">
        {children}
      </main>
    </div>
  );
};