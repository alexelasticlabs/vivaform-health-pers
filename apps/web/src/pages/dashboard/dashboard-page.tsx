import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

import { fetchDailyDashboard, createWaterEntry } from "../../api";
import { fetchWeightHistory } from "../../api/weight";
import { tryGetQuizProfile } from "../../api/quiz";
import { useQuizStore } from "../../store/quiz-store";
import { syncCheckoutSession } from "../../api/subscriptions";
import { useUserStore } from "../../store/user-store";
import type { NutritionEntry } from "@vivaform/shared";

// New Widget Components
import { QuickAddModal } from "../../components/dashboard/quick-add-modal";
import { AddNutritionFormWithAutocomplete } from "../../components/dashboard/add-nutrition-form-enhanced";
import { AddWeightForm } from "../../components/dashboard/add-weight-form";
import { Droplet, Flame, TrendingUp, Activity, Scale, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { trackConversion } from "../../lib/analytics";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [modalState, setModalState] = useState<{ type: 'meal' | 'weight' | null; mealType?: string }>({ type: null });
  const [trendTab, setTrendTab] = useState<'weight'|'calories'|'hydration'|'steps'>('weight');
  const [trendRange, setTrendRange] = useState<7|30>(7);
  
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.profile);
  const isPremium = user?.tier === "PREMIUM";
  const resetQuiz = useQuizStore((s) => s.reset);

  // Handle premium activation success
  useEffect(() => {
    const handlePremiumSuccess = async () => {
      if (searchParams.get('premium') === 'success') {
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          try {
            await syncCheckoutSession(sessionId);
            toast.success('🎉 VivaForm+ activated successfully! Welcome to premium!', {
              duration: 5000,
            });
            // Refresh user data to get updated tier
            queryClient.invalidateQueries({ queryKey: ['me'] });
          } catch (error) {
            console.error('Failed to sync subscription:', error);
            toast.error('Please refresh the page to see your premium status');
          }
        } else {
          toast.success('🎉 VivaForm+ activated successfully! Welcome to premium!', {
            duration: 5000,
          });
        }
        
        // Remove the query params
        searchParams.delete('premium');
        searchParams.delete('session_id');
        setSearchParams(searchParams, { replace: true });
      }
    };
    
    handlePremiumSuccess();
  }, [searchParams, setSearchParams, queryClient]);

  // Fetch dashboard data
  const { data, isLoading, isError: isDashError, error: dashError } = useQuery({
    queryKey: ["dashboard", selectedDate],
    queryFn: () => fetchDailyDashboard(selectedDate),
    staleTime: 30_000
  });

  // Fetch quiz profile for height/goals
  const { data: quizProfile, isError: isQuizError, error: quizErr } = useQuery({
    queryKey: ["quiz-profile"],
    queryFn: tryGetQuizProfile,
    staleTime: 300_000
  });

  const needsQuiz = !quizProfile || !quizProfile.heightCm || !quizProfile.weightKg;

  // Fetch weight history for trends
  const { data: weightHistory = [], isError: isWeightError, error: weightErr } = useQuery({
    queryKey: ["weight-history", trendRange],
    queryFn: () => fetchWeightHistory({ limit: trendRange === 7 ? 14 : 30 }),
    staleTime: 60_000
  });

  // Toast errors from queries (once per mount)
  useEffect(() => {
    if (isDashError) {
      const msg = dashError instanceof Error ? dashError.message : 'Failed to load dashboard';
      toast.error(msg);
    }
  }, [isDashError, dashError]);
  useEffect(() => {
    if (isQuizError) {
      const msg = quizErr instanceof Error ? quizErr.message : 'Failed to load profile';
      toast.error(msg);
    }
  }, [isQuizError, quizErr]);
  useEffect(() => {
    if (isWeightError) {
      const msg = weightErr instanceof Error ? weightErr.message : 'Failed to load weight history';
      toast.error(msg);
    }
  }, [isWeightError, weightErr]);

  // Water mutation
  const waterMutation = useMutation({
    mutationFn: createWaterEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", selectedDate] });
      toast.success("Water logged! 💧");
    },
    onError: () => {
      toast.error("Failed to log water");
    }
  });

  const handleAddWater = (amountMl: number) => {
    waterMutation.mutate({
      date: new Date().toISOString(),
      amountMl
    });
  };

  const openMealModal = (mealType: string) => {
    setModalState({ type: 'meal', mealType });
  };

  const openWeightModal = () => {
    setModalState({ type: 'weight' });
  };

  const closeModal = () => {
    setModalState({ type: null });
  };

  // Calculate goals (получаем из API dashboard.goals либо fallback)
  const calorieGoal = data?.goals?.calories ?? 2000;
  const proteinGoal = data?.goals?.protein ?? Math.round((calorieGoal * 0.3) / 4);
  const fatGoal = data?.goals?.fat ?? Math.round((calorieGoal * 0.3) / 9);
  const carbsGoal = data?.goals?.carbs ?? Math.round((calorieGoal * 0.4) / 4);
  const waterGoal = data?.goals?.waterMl ?? 2000; // ml

  // Derived values
  const caloriesConsumed = data?.nutrition.summary.calories || 0;
  const macros = data?.nutrition.summary || { protein: 0, fat: 0, carbs: 0 };
  const waterConsumed = data?.water.totalMl || 0;
  const latestWeight = data?.weight.latest?.weightKg ?? null;
  const weightSeries = useMemo(() => weightHistory.map(w => w.weightKg), [weightHistory]);
  const streakDays =  Math.max(0, (data?.nutrition.entries?.length || 0) > 0 || (data?.water.totalMl || 0) > 0 ? 1 : 0); // minimal streak heuristic

  const mealsByType = useMemo(() => {
    const groups: Record<string, NutritionEntry[]> = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] } as any;
    (data?.nutrition.entries || []).forEach((e) => {
      const key = (e.mealType as string) || 'Other';
      if (!groups[key]) groups[key] = [] as any;
      (groups[key] as any).push(e);
    });
    return groups;
  }, [data]);

  // Lightweight line path builder
  const buildPath = (values: number[], width = 280, height = 80) => {
    if (!values || values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const norm = (v: number) => max === min ? 0.5 : (v - min) / (max - min);
    const stepX = width / Math.max(1, values.length - 1);
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(height - norm(v) * height).toFixed(1)}`)
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col gap-6 pb-24">
      {/* Hero */}
      <section className="rounded-3xl border border-border bg-gradient-to-r from-emerald-100/50 to-teal-100/40 p-6 shadow-sm dark:from-emerald-900/20 dark:to-teal-900/10" aria-label="Welcome">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
            <p className="text-sm text-muted-foreground">Stay on track: quick actions and your day at a glance.</p>
          </div>
          <button onClick={() => openMealModal('Breakfast')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Add meal</button>
        </div>
      </section>

      {/* Quiz prompt */}
      {needsQuiz && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-50" aria-label="Complete health quiz">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-sm font-medium">Complete your health quiz to personalize goals and recommendations.</p>
            <button
              onClick={() => { resetQuiz(); navigate('/quiz'); }}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Start quiz
            </button>
          </div>
        </section>
      )}

      {/* KPI Grid */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Calories */}
          <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'calories' }); navigate('/app'); }} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Calories</span>
                    <Flame size={16} className="text-emerald-600" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">{caloriesConsumed}</div>
                  <div className="text-xs text-muted-foreground">of {calorieGoal} kcal</div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (caloriesConsumed / calorieGoal) * 100)}%` }} />
                  </div>
                </button>
                {/* Macros */}
                <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'macros' }); navigate('/app'); }} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Macros</span>
                    <TrendingUp size={16} className="text-teal-600" />
                  </div>
                  <div className="mt-1 text-sm font-medium">P {Math.round(macros.protein)}/{proteinGoal} • F {Math.round(macros.fat)}/{fatGoal} • C {Math.round(macros.carbs)}/{carbsGoal}</div>
                </button>
                {/* Hydration */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Hydration</span>
                    <Droplet size={16} className="text-cyan-600" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">{waterConsumed} ml</div>
                  <div className="text-xs text-muted-foreground">goal {waterGoal} ml</div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'hydration', amount: 250 }); handleAddWater(250); }} className="rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700">+ 250 ml</button>
                    <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'hydration', amount: 500 }); handleAddWater(500); }} className="rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700">+ 500 ml</button>
                  </div>
                </div>
                {/* Steps */}
                <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'steps' }); navigate('/app/settings'); }} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Steps</span>
                    <Activity size={16} className="text-sky-600" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">—</div>
                  <div className="text-xs text-muted-foreground">Connect health app</div>
                </button>
                {/* Weight */}
                <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'weight' }); openWeightModal(); }} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Weight</span>
                    <Scale size={16} className="text-emerald-600" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">{latestWeight ? `${latestWeight.toFixed(1)} kg` : '—'}</div>
                  <svg className="mt-2 h-10 w-full" viewBox="0 0 280 80" aria-hidden>
                    <path d={buildPath(weightSeries)} stroke="currentColor" strokeWidth="2" className="text-emerald-500" fill="none" />
                  </svg>
                </button>
                {/* Streak */}
                <button onClick={() => { trackConversion('dashboard_cta', { section: 'kpi', card: 'streak' }); navigate('/app/progress'); }} className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Streak</span>
                    <Sparkles size={16} className="text-amber-600" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">{streakDays} days</div>
                  <div className="text-xs text-muted-foreground">Keep it up!</div>
                </button>
              </div>
            </section>

            {/* Today Timeline */}
            <section className="grid grid-cols-1 gap-3 xl:grid-cols-3" aria-label="Today timeline">
              <div className="xl:col-span-2 rounded-3xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Today</h2>
                  <button onClick={() => openMealModal('Breakfast')} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-card-hover">Add</button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {['Breakfast','Lunch','Dinner','Snack'].map((meal) => (
                    <div key={meal} className="rounded-2xl border border-border bg-card p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">{meal}</span>
                        <button onClick={() => openMealModal(meal)} className="text-xs text-emerald-700 hover:underline dark:text-emerald-300">Add</button>
                      </div>
                      <div className="space-y-2">
                        {(mealsByType[meal] || []).slice(-3).reverse().map((e) => (
                          <div key={e.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                            <span className="text-sm">{e.food}</span>
                            <span className="text-sm font-semibold">{e.calories} kcal</span>
                          </div>
                        ))}
                        {((mealsByType[meal] || []).length === 0) && (
                          <p className="text-xs text-muted-foreground">No {meal.toLowerCase()} yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tips */}
              <div className="rounded-3xl border border-border bg-background p-4 shadow-sm" aria-label="Tips">
                <h2 className="text-base font-semibold">Daily tips</h2>
                <div className="mt-3 space-y-2">
                  {(data?.recommendations?.slice(0,3) || []).map((r) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-sm font-medium">{r.title}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.body}</p>
                        <button onClick={() => navigate('/app/recommendations')} className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300">Learn more</button>
                      </div>
                    </div>
                  ))}
                  {(!data?.recommendations || data.recommendations.length === 0) && (
                    <>
                      <div className="rounded-2xl border border-border bg-card p-3">
                        <p className="text-sm font-medium">💧 Sip regularly</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Small sips every hour improve energy</p>
                          <button onClick={() => handleAddWater(250)} className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300">+250 ml</button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-3">
                        <p className="text-sm font-medium">🥗 Protein first</p>
                        <p className="mt-1 text-xs text-muted-foreground">Start meals with protein to stay full longer</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Trends */}
            <section className="rounded-3xl border border-border bg-background p-4 shadow-sm" aria-label="Trends">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(['weight','calories','hydration','steps'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTrendTab(t); trackConversion('dashboard_trend_tab', { tab: t }); }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${trendTab===t ? 'bg-card' : 'text-muted-foreground'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Range">
                  <button onClick={() => setTrendRange(7)} className={`rounded-full px-3 py-1.5 ${trendRange===7?'bg-card':''}`}>7d</button>
                  <button onClick={() => setTrendRange(30)} className={`rounded-full px-3 py-1.5 ${trendRange===30?'bg-card':''}`}>30d</button>
                </div>
              </div>
              <div className="mt-3">
                {(trendTab === 'weight') ? (
                  weightSeries.length > 1 ? (
                    <svg className="h-40 w-full" viewBox="0 0 600 160" role="img" aria-label="Weight trend">
                      <path d={buildPath(weightSeries.slice(- (trendRange===7?7:30)), 600, 160)} stroke="currentColor" strokeWidth="2" className="text-emerald-500" fill="none" />
                    </svg>
                  ) : (
                    <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">Not enough weight data</div>
                  )
                ) : trendTab === 'calories' ? (
                  <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">Connect more data to see calorie trends</div>
                ) : trendTab === 'hydration' ? (
                  <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">Track water daily to unlock hydration trends</div>
                ) : (
                  <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">Connect steps in Settings</div>
                )}
              </div>
            </section>

            {/* Tasks */}
            <section className="rounded-3xl border border-border bg-background p-4 shadow-sm" aria-label="Tasks">
              <h2 className="text-base font-semibold">Today’s tasks</h2>
              <ul className="mt-3 space-y-2">
                {[{ id: 't1', label: 'Log lunch' }, { id: 't2', label: 'Drink 250 ml water' }].map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-muted-foreground" aria-hidden />
                      <span className="text-sm">{t.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toast.success('Completed')} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-card-hover">Done</button>
                      <button onClick={() => toast.message('Snoozed for 1h', { description: 'We’ll remind you later.' })} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-card-hover"><Clock size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Premium strip */}
            {!isPremium && (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20" aria-label="Premium upgrade">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="text-sm font-medium">Unlock VivaForm+ for advanced insights and meal plans</p>
                  <button onClick={() => navigate('/premium')} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Upgrade</button>
                </div>
              </section>
            )}

            {/* Modals */}
            <QuickAddModal
              isOpen={modalState.type === 'meal'}
              onClose={closeModal}
              title={`Add ${modalState.mealType || 'Meal'}`}
            >
              <AddNutritionFormWithAutocomplete
                date={new Date().toISOString()}
                defaultMealType={modalState.mealType}
              />
            </QuickAddModal>

            <QuickAddModal
              isOpen={modalState.type === 'weight'}
              onClose={closeModal}
              title="Update Weight"
            >
              <AddWeightForm date={selectedDate} />
            </QuickAddModal>
    </div>
  );
};