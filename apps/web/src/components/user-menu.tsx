import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logUserMenuItemClicked, logUserMenuOpened } from "../lib/analytics";

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

export type UserMenuProps = {
  user: { name: string; email?: string; avatarUrl?: string; initials: string; role: "user" | "admin" };
  plan: "premium" | "trial" | "free";
  unreadCount?: number;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  source?: "marketing" | "app";
};

export const UserMenu: React.FC<UserMenuProps> = ({ user, plan, unreadCount = 0, onNavigate, onLogout, source = "app" }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const planPill = useMemo(() => {
    if (plan === "premium") return { label: "⭐ Premium", tooltip: "Manage subscription" };
    if (plan === "trial") return { label: "⏳ Trial", tooltip: "Manage subscription" };
    return { label: "Free", tooltip: "Upgrade to Premium" };
  }, [plan]);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = itemsRef.current.filter(Boolean);
        if (items.length === 0) return;
        const active = document.activeElement as HTMLElement | null;
        const idx = items.findIndex((el) => el === active);
        let next = 0;
        if (e.key === "ArrowDown") next = idx < 0 ? 0 : Math.min(items.length - 1, idx + 1);
        else next = idx < 0 ? items.length - 1 : Math.max(0, idx - 1);
        items[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) logUserMenuOpened(source);
  }, [open, source]);

  const setItemRef = (idx: number) => (el: HTMLButtonElement | null) => {
    itemsRef.current[idx] = el;
  };

  const identityLabel = user.name || user.email || "User";

  const navigate = (path: string, item: string) => {
    logUserMenuItemClicked(source, item);
    onNavigate(path);
    closeMenu();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-sm text-foreground shadow-sm hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          open && "ring-1 ring-emerald-400/60"
        )}
      >
        <span className="relative inline-flex">
          <img
            src={user.avatarUrl || ""}
            alt=""
            className={cx("h-8 w-8 rounded-full object-cover", !user.avatarUrl && "hidden")}
          />
          {!user.avatarUrl && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
              {user.initials}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" aria-hidden />
          )}
        </span>
        <span className="hidden shrink-0 text-left md:block">
          <span className="block whitespace-nowrap text-xs font-semibold leading-tight">{identityLabel}{user.role === 'admin' && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-800 align-middle dark:bg-amber-900/30 dark:text-amber-200">Admin</span>}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">{plan === 'premium' ? 'VivaForm+' : plan === 'trial' ? 'Trial' : 'Free'}</span>
        </span>
        <span
          title={planPill.tooltip}
          className={cx("hidden rounded-full px-2 py-0.5 text-[10px] font-medium md:inline", plan === 'premium' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" : plan === 'trial' ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200" : "bg-muted text-foreground/70")}
        >
          {planPill.label}
        </span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 111.08 1.04l-4.25 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card p-1 text-sm shadow-xl shadow-black/10"
        >
          {/* Group 0: Admin panel */}
          {user.role === 'admin' && (
            <button ref={setItemRef(0)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/app/admin', 'admin')}>Admin panel</button>
          )}
          {/* Group 1 */}
          <button ref={setItemRef(1)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/app', 'dashboard')}>Dashboard</button>
          <button ref={setItemRef(2)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/app', 'profile')}>Profile</button>
          <button ref={setItemRef(3)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/app/settings', 'settings')}>Account settings</button>
          <div className="my-1 border-t border-border/60" />
          {/* Group 2 */}
          <button ref={setItemRef(4)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/quiz', 'retake_quiz')}>Re-run health quiz</button>
          <div className="my-1 border-t border-border/60" />
          {/* Group 3 */}
          {plan === 'premium' || plan === 'trial' ? (
            <button ref={setItemRef(5)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/premium', 'manage_subscription')}>Manage subscription</button>
          ) : (
            <button ref={setItemRef(5)} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover" onClick={() => navigate('/premium', 'upgrade')}>Upgrade to Premium</button>
          )}
          <div className="my-1 border-t border-border/60" />
          {/* Destructive */}
          <button
            ref={setItemRef(6)}
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => {
              logUserMenuItemClicked(source, 'logout');
              onLogout();
              closeMenu();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
