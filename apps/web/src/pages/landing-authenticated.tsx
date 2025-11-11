import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../store/user-store";
import { useThemeStore } from "../store/theme-store";
import { motion } from "framer-motion";
import { fetchDailyDashboard } from "../api";
import { tryGetQuizProfile } from "../api";
import { useQuizStore } from "../store/quiz-store";

const useCountUp = (to: number, durationMs = 800) => {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      setVal(Math.round(to * progress));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);
  return val;
};

function initials(name?: string | null, email?: string) {
  if (name && name.trim().length > 0) {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function LandingAuthenticated() {
  const navigate = useNavigate();
  const { profile, logout } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const name = profile?.name ?? profile?.email?.split("@")[0] ?? "there";
  const isPremium = (profile?.tier ?? "FREE") === "PREMIUM";

  const today = new Date().toISOString().slice(0, 10);
  const { data: dash } = useQuery({
    queryKey: ["dashboard", today],
    queryFn: () => fetchDailyDashboard(today),
    staleTime: 30_000,
  });
  const { data: quiz } = useQuery({
    queryKey: ["quiz-profile"],
    queryFn: tryGetQuizProfile,
    staleTime: 300_000,
  });

  // Compute stats
  const latestWeightKg = dash?.weight.latest?.weightKg ?? quiz?.weightKg ?? null;
  const heightCm = quiz?.heightCm ?? null;
  const computedBmi = useMemo(() => {
    if (!latestWeightKg || !heightCm) return quiz?.bmi ?? 0;
    const h = heightCm / 100;
    return Math.round((latestWeightKg / (h * h)) * 10) / 10;
  }, [latestWeightKg, heightCm, quiz?.bmi]);

  const hydrationToday = dash?.water.totalMl ?? 0;
  const caloriesToday = dash?.nutrition.summary.calories ?? 0;
  const mealsCount = dash?.nutrition.entries.length ?? 0;
  const resetQuiz = useQuizStore((s) => s.reset);

  const bmi = useCountUp(computedBmi || 0, 700);
  const hydration = useCountUp(hydrationToday, 700);
  const calories = useCountUp(caloriesToday, 700);
  const meals = useCountUp(mealsCount, 700);
  const needsQuiz = !quiz || !quiz.heightCm || !quiz.weightKg;

  const tips = useMemo(
    () => [
      {
        title: "Protein pacing",
        body: "Aim for 25–35g protein per meal to support satiety and recovery.",
        icon: "🥚",
      },
      {
        title: "Hydration window",
        body: "Distribute water across morning and afternoon to avoid late-night intake.",
        icon: "💧",
      },
      {
        title: "Fiber boost",
        body: "Add veggies or whole grains to hit 25–30g of fiber daily.",
        icon: "🥦",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/30 bg-white/70 backdrop-blur-xl shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/app" className="inline-flex items-center gap-2" aria-label="VivaForm Home">
              <span className="text-2xl">🥗</span>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">VivaForm</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/app/my-plan" className="text-foreground/80 hover:text-foreground">My Plan</Link>
              <Link to="/app/progress" className="text-foreground/80 hover:text-foreground">Tracker</Link>
              <Link to="/app/recommendations" className="text-foreground/80 hover:text-foreground">Insights</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <Link to="/premium" className="hidden sm:inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-card-hover">Upgrade plan</Link>
            )}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-card-hover"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            <div className="relative">
              <details className="group" aria-label="User menu">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm hover:bg-card-hover">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                    {initials(profile?.name, profile?.email)}
                  </div>
                  <span className="hidden sm:inline">{profile?.name ?? profile?.email}</span>
                  {isPremium && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">⭐ Premium</span>
                  )}
                  <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 111.08 1.04l-4.25 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 text-sm shadow-lg">
                  <Link className="block rounded-lg px-3 py-2 hover:bg-card-hover" to="/app">Profile</Link>
                  <Link className="block rounded-lg px-3 py-2 hover:bg-card-hover" to="/app/settings">Account settings</Link>
                  <Link className="block rounded-lg px-3 py-2 hover:bg-card-hover" to="/premium">Billing / Subscription</Link>
                  <button
                    className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-200/40 to-teal-200/40 py-12 dark:from-emerald-900/20 dark:to-teal-800/20">
        <div className="mx-auto max-w-4xl px-4 text-center">
              {needsQuiz && (
                <button
                  onClick={() => { resetQuiz(); navigate('/quiz'); }}
                  className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-50"
                >
                  Complete health quiz
                </button>
              )}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {initials(profile?.name, profile?.email)}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl" aria-live="polite">
              Welcome back, {name}!
            </h1>
            <p className="mt-3 text-muted-foreground">
              You’re doing great — {Math.min(100, Math.round(((hydration / 2000) + (calories / 2000)) * 50))}% on track this week.
              Keep up your plan and stay hydrated 💧
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/app/my-plan"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.01] hover:shadow-xl"
                aria-label="Continue Plan"
              >
                Continue Plan →
              </Link>
              <Link to="/app" className="inline-flex items-center justify-center rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur hover:bg-white dark:bg-neutral-900/60">
                Log today’s meals
              </Link>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick stats">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="contents">
                <Link to="/app" className="block rounded-2xl border border-emerald-200/40 bg-white/70 p-4 shadow-md backdrop-blur-sm hover:shadow-lg dark:border-emerald-900/30 dark:bg-neutral-900/60" aria-label={`Weight & BMI`}>
                  <div className="text-xs text-muted-foreground">Weight & BMI</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">{(latestWeightKg ?? 0).toFixed(1)} kg</div>
                  <div className="text-sm text-muted-foreground">BMI {bmi}</div>
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              <Link to="/app" className="block rounded-2xl border border-emerald-200/40 bg-white/70 p-4 shadow-md backdrop-blur-sm hover:shadow-lg dark:border-emerald-900/30 dark:bg-neutral-900/60" aria-label={`Nutrition macros`}>
                <div className="text-xs text-muted-foreground">Nutrition</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{Math.round((dash?.nutrition.summary.protein ?? 0))} P</div>
                <div className="text-sm text-muted-foreground">{Math.round((dash?.nutrition.summary.fat ?? 0))} F · {Math.round((dash?.nutrition.summary.carbs ?? 0))} C</div>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Link to="/app" className="block rounded-2xl border border-emerald-200/40 bg-white/70 p-4 shadow-md backdrop-blur-sm hover:shadow-lg dark:border-emerald-900/30 dark:bg-neutral-900/60" aria-label={`Hydration`}>
                <div className="text-xs text-muted-foreground">Hydration</div>
                <div className="mt-1 text-2xl font-bold text-teal-600">{hydration} ml</div>
                <div className="mt-2 h-2 w-full rounded-full bg-neutral-200/70 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (hydration / 2000) * 100)}%` }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Goal 2000 ml</div>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
              <Link to="/app/progress" className="block rounded-2xl border border-emerald-200/40 bg-white/70 p-4 shadow-md backdrop-blur-sm hover:shadow-lg dark:border-emerald-900/30 dark:bg-neutral-900/60" aria-label={`Streak`}>
                <div className="text-xs text-muted-foreground">Streak</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{Math.max(1, (dash ? 4 : 4))} days</div>
                <div className="text-sm text-muted-foreground">Keep it up!</div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main content: Stats + Tips */}
      <section className="py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:gap-8 lg:px-8">
          {/* Stats cards */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-md">
              <h2 className="text-base font-semibold text-foreground">Today’s Nutrition</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Protein", value: Math.round((calories * 0.3) / 4), unit: "g" },
                  { label: "Fat", value: Math.round((calories * 0.25) / 9), unit: "g" },
                  { label: "Carbs", value: Math.max(0, Math.round((calories - ((calories * 0.3)) - ((calories * 0.25))) / 4)), unit: "g" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-emerald-200/40 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:border-emerald-900/30 dark:bg-neutral-900/60" aria-label={`${m.label} ${m.value}${m.unit}`}>
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="text-xl font-semibold text-emerald-600">{m.value}{m.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-md">
              <h2 className="text-base font-semibold text-foreground">Hydration</h2>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="text-lg font-semibold text-teal-600">{hydration} ml</div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (hydration / 2500) * 100)}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-md">
              <h2 className="text-base font-semibold text-foreground">Activity</h2>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Meals logged</div>
                <div className="text-lg font-semibold text-emerald-600">{meals}</div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (meals / 6) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Tips & Recommendations */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-md">
              <h2 className="text-base font-semibold text-foreground">Today’s Tips</h2>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {tips.slice(0, 3).map((t, i) => (
                  <div key={i} className="rounded-xl border border-emerald-200/40 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-emerald-900/30 dark:bg-neutral-900/60">
                    <div className="mb-1 text-xl">{t.icon}</div>
                    <div className="font-medium text-foreground">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {!isPremium && (
              <div className="rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-md">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-lg font-semibold">Go Premium</div>
                    <div className="text-sm text-emerald-50/90">Unlock advanced templates, macro targets, and progress insights.</div>
                  </div>
                  <Link to="/premium" className="rounded-xl bg-white/95 px-5 py-2 text-sm font-semibold text-emerald-700 shadow hover:bg-white">
                    Upgrade
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/app/settings" className="hover:text-foreground">Account</Link>
            <Link to="/articles" className="hover:text-foreground">FAQ</Link>
            <Link to="/privacy" className="hover:text-foreground">GDPR</Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-foreground">GDPR Compliant</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-foreground">Data Encrypted</span>
          </div>
          <div>© {new Date().getFullYear()} VivaForm</div>
        </div>
      </footer>
    </main>
  );
}

export default LandingAuthenticated;
