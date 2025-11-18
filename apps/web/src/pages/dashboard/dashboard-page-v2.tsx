/**
 * Dashboard Page V2
 * Complete redesign with progressive disclosure, modern UI, and gamification
 */

import React, { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Settings, TrendingUp, Award } from 'lucide-react';
import { cn, getGreeting } from '@/lib/dashboard-utils';
import { useUserStore } from '@/store/user-store';
import { MetricCard } from '@/components/dashboard-v2/metric-card';
import { HealthScoreRing } from '@/components/dashboard-v2/health-score-ring';
import { QuickActions } from '@/components/dashboard-v2/quick-actions';
import { InsightsCard } from '@/components/dashboard-v2/insights-card';
import { StreakDisplay } from '@/components/dashboard-v2/streak-display';
import { AchievementsGrid } from '@/components/dashboard-v2/achievement-card';
import { QuickAddModal, AddNutritionFormWithAutocomplete, AddWeightForm, AddActivityForm } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import type { DailyDashboardResponse } from '@/types/dashboard.types';
import { fetchDailyDashboardV2 } from '@/api/dashboard-v2';
import { createWaterEntry } from '@/api';

// Lazy load heavy components
const WeightTrendWidget = lazy(() => import('@/components/dashboard-v2/weight-trend-widget'));
const MealTimelineWidget = lazy(() => import('@/components/dashboard-v2/meal-timeline-widget'));

// Dev-only mock data fallback (used only in development for local UX work)
const fetchDashboardDataDev = async (date: string): Promise<DailyDashboardResponse> => {
  return {
    date,
    healthScore: {
      overall: 78,
      breakdown: { nutrition: 82, hydration: 75, activity: 70, consistency: 85 },
      trend: 'improving',
    },
    metrics: {
      calories: { id: 'calories', label: 'Calories', value: 1450, target: 1800, unit: 'kcal', trend: 'stable', changePercent: 2, icon: '🔥' },
      water: { id: 'water', label: 'Water', value: 1500, target: 2000, unit: 'ml', trend: 'up', changePercent: 5, icon: '💧' },
      weight: { id: 'weight', label: 'Weight', value: 75.2, target: 72.0, unit: 'kg', trend: 'down', changePercent: 3, icon: '⚖️' },
      steps: { id: 'steps', label: 'Steps', value: 7240, target: 10000, unit: 'steps', trend: 'up', changePercent: 8, icon: '👟' },
      protein: { id: 'protein', label: 'Protein', value: 85, target: 120, unit: 'g', icon: '🥩' },
      carbs: { id: 'carbs', label: 'Carbs', value: 180, target: 200, unit: 'g', icon: '🍞' },
      fat: { id: 'fat', label: 'Fat', value: 45, target: 60, unit: 'g', icon: '🥑' },
    },
    mealTimeline: [],
    insights: [
      { id: '1', type: 'milestone', title: "You're down 0.3kg this week!", description: 'Keep up the great work! Your consistency is paying off.', priority: 'high', icon: '🎉' },
      { id: '2', type: 'tip', title: 'Try adding protein to breakfast', description: 'Studies show protein-rich breakfasts help with satiety throughout the day.', priority: 'medium', actionable: { label: 'See protein-rich recipes', action: '/recipes?filter=protein' } },
      { id: '3', type: 'achievement', title: '7-day streak unlocked!', description: "You've logged meals for 7 days straight. Amazing!", priority: 'medium', icon: '🔥' },
    ],
    streaks: [
      { current: 7, longest: 12, type: 'daily-logging', lastUpdated: new Date() },
      { current: 3, longest: 8, type: 'water-goal', lastUpdated: new Date() },
    ],
    achievements: [
      { id: '1', title: 'First Steps', description: 'Log your first meal', icon: '🌱', progress: 100, unlocked: true, category: 'nutrition', rarity: 'common' },
      { id: '2', title: 'Week Warrior', description: 'Log meals for 7 consecutive days', icon: '🔥', progress: 100, unlocked: true, category: 'consistency', rarity: 'rare' },
      { id: '3', title: 'Hydration Hero', description: 'Hit your water goal 30 days in a row', icon: '💧', progress: 10, unlocked: false, category: 'hydration', rarity: 'epic' },
      { id: '4', title: 'Data Driven', description: 'Log 100 meals', icon: '📊', progress: 45, unlocked: false, category: 'nutrition', rarity: 'rare' },
      { id: '5', title: 'Goal Crusher', description: 'Reach your target weight', icon: '🏆', progress: 60, unlocked: false, category: 'special', rarity: 'legendary', reward: { type: 'premium-trial', value: 7 } },
    ],
    goalProgress: {
      primaryGoal: { type: 'lose_weight', target: 72, current: 75.2, unit: 'kg', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), progress: 60 },
      weeklyProgress: { caloriesOnTrack: 85, waterGoalsHit: 5, mealsLogged: 18, activeStreak: 7 },
    },
  };
};

export const DashboardPageV2: React.FC = () => {
  const user = useUserStore((state) => state.profile);
  const isPremium = user?.tier === 'PREMIUM';
  const isDev = import.meta.env.DEV;
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-v2', selectedDate],
    queryFn: () => (isDev ? fetchDashboardDataDev(selectedDate) : fetchDailyDashboardV2(selectedDate)),
    staleTime: 30_000,
  });

  const queryClient = useQueryClient();
  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      const payload = { amountMl: amount, date: selectedDate } as any;
      return await createWaterEntry(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard-v2', selectedDate] });
      toast.success('Water logged! 💧');
    },
    onError: () => toast.error('Failed to log water'),
  });

  // Quick action handlers
  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate(amount);
  };

  const handleAddMeal = () => {
    setShowMealModal(true);
  };

  const handleAddWeight = () => {
    setShowWeightModal(true);
  };

  const handleAddActivity = () => {
    setShowActivityModal(true);
  };

  const handleInsightAction = (insight: any) => {
    const action = insight?.actionable?.action as string | undefined;
    if (!action) return;
    if (action.startsWith('http')) {
      window.open(action, '_blank');
    } else {
      navigate(action);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Failed to load dashboard</p>
          <p className="text-sm text-slate-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/10">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Welcome section */}
            <div>
              <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-white">
                {getGreeting()}, {user?.name || 'there'}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {data.goalProgress.primaryGoal.type === 'lose_weight' && (
                  <>
                    You're {((data.goalProgress.primaryGoal.current - data.goalProgress.primaryGoal.target) * -1).toFixed(1)}kg away from your goal
                  </>
                )}
              </p>
            </div>

            {/* Date selector and view toggle */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              >
                {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Row 1: Health Score + Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Health Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <HealthScoreRing healthScore={data.healthScore} size="md" showBreakdown={false} />
            </div>

            {/* Quick Actions + Featured Streak */}
            <div className="space-y-6 lg:col-span-2">
              <QuickActions
                onAddWater={handleAddWater}
                onAddMeal={handleAddMeal}
                onAddWeight={handleAddWeight}
                onAddActivity={handleAddActivity}
              />

              {data.streaks.length > 0 && (
                <StreakDisplay streaks={data.streaks} featured />
              )}
            </div>
          </div>

          {/* Row 2: Daily Snapshot - Key Metrics */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Today's Snapshot
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard metric={data.metrics.calories} showProgress showTrend />
              <MetricCard metric={data.metrics.water} showProgress showTrend />
              <MetricCard metric={data.metrics.weight} showProgress showTrend />
              <MetricCard metric={data.metrics.steps} showProgress showTrend />
            </div>
          </div>

          {/* Row 3: Macros (if detailed view) */}
          {viewMode === 'detailed' && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Macronutrients</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard metric={data.metrics.protein} size="sm" />
                <MetricCard metric={data.metrics.carbs} size="sm" />
                <MetricCard metric={data.metrics.fat} size="sm" />
              </div>
            </div>
          )}

          {/* Row 4: Insights */}
          <InsightsCard insights={data.insights} maxInsights={3} onActionClick={handleInsightAction} />

          {/* Row 5: Achievements */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <Award className="h-5 w-5 text-amber-600" />
                Achievements
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.achievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-all hover:shadow-md',
                    achievement.unlocked
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-3xl">{achievement.icon}</span>
                    {achievement.unlocked && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>
                  <h4 className="mb-1 font-bold text-slate-900 dark:text-white">{achievement.title}</h4>
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">{achievement.progress}% complete</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row 6: Lazy loaded widgets (if detailed view) */}
          {viewMode === 'detailed' && (
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <WeightTrendWidget userId={user?.id || ''} />
                <MealTimelineWidget date={selectedDate} meals={data.mealTimeline} />
              </div>
            </Suspense>
          )}
        </div>
      </div>

      {/* Quick add modals */}
      <QuickAddModal isOpen={showMealModal} onClose={() => setShowMealModal(false)} title="Add Meal">
        <AddNutritionFormWithAutocomplete date={selectedDate} />
      </QuickAddModal>
      <QuickAddModal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)} title="Add Weight">
        <AddWeightForm date={selectedDate} />
      </QuickAddModal>
      <QuickAddModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Add Activity">
        <AddActivityForm date={selectedDate} />
      </QuickAddModal>
    </div>
  );
};

export default DashboardPageV2;
