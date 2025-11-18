/**
 * Dashboard Utilities
 * Helper functions for dashboard calculations and formatting
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HealthScore, Achievement } from '@/types/dashboard.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate health score based on multiple factors
 */
export function calculateHealthScore(metrics: {
  caloriesPercent: number;
  waterPercent: number;
  activityPercent: number;
  mealsLogged: number;
  targetMeals: number;
}): HealthScore {
  const nutrition = Math.min(100, (metrics.caloriesPercent + (metrics.mealsLogged / metrics.targetMeals * 100)) / 2);
  const hydration = Math.min(100, metrics.waterPercent);
  const activity = Math.min(100, metrics.activityPercent);
  const consistency = Math.min(100, (metrics.mealsLogged / metrics.targetMeals) * 100);

  const overall = Math.round((nutrition + hydration + activity + consistency) / 4);

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (overall >= 80) trend = 'improving';
  else if (overall < 60) trend = 'declining';

  return {
    overall,
    breakdown: {
      nutrition: Math.round(nutrition),
      hydration: Math.round(hydration),
      activity: Math.round(activity),
      consistency: Math.round(consistency),
    },
    trend,
  };
}

/**
 * Format metric value with unit
 */
export function formatMetricValue(value: number, unit: string, decimals = 0): string {
  const formatted = value.toFixed(decimals);

  switch (unit) {
    case 'kcal':
      return `${formatted} cal`;
    case 'ml':
      return value >= 1000 ? `${(value / 1000).toFixed(1)}L` : `${formatted}ml`;
    case 'kg':
      return `${formatted}kg`;
    case 'steps':
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : formatted;
    case 'g':
      return `${formatted}g`;
    case '%':
      return `${formatted}%`;
    default:
      return `${formatted} ${unit}`;
  }
}

/**
 * Calculate percentage of target achieved
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Get color class based on progress percentage
 */
export function getProgressColor(progress: number): string {
  if (progress >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
  if (progress >= 70) return 'text-green-600 bg-green-50 dark:bg-green-950/30';
  if (progress >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30';
  return 'text-red-600 bg-red-50 dark:bg-red-950/30';
}

/**
 * Get trend icon and color
 */
export function getTrendIndicator(trend?: 'up' | 'down' | 'stable', changePercent?: number): {
  icon: string;
  color: string;
  text: string;
} {
  if (!trend || !changePercent) {
    return { icon: '➖', color: 'text-slate-500', text: 'No change' };
  }

  const absChange = Math.abs(changePercent);

  if (trend === 'up') {
    return {
      icon: '📈',
      color: 'text-emerald-600',
      text: `+${absChange}%`,
    };
  }

  if (trend === 'down') {
    return {
      icon: '📉',
      color: 'text-red-600',
      text: `-${absChange}%`,
    };
  }

  return { icon: '➖', color: 'text-slate-500', text: 'Stable' };
}

/**
 * Get achievement rarity color
 */
export function getAchievementColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'from-slate-500 to-slate-600';
    case 'rare':
      return 'from-blue-500 to-blue-600';
    case 'epic':
      return 'from-purple-500 to-purple-600';
    case 'legendary':
      return 'from-amber-500 to-amber-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
}

/**
 * Get streak emoji based on count
 */
export function getStreakEmoji(streakCount: number): string {
  if (streakCount >= 30) return '🏆';
  if (streakCount >= 14) return '💪';
  if (streakCount >= 7) return '🔥';
  if (streakCount >= 3) return '⭐';
  return '✨';
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 5) return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

/**
 * Get motivational message based on health score
 */
export function getMotivationalMessage(score: number): string {
  if (score >= 90) return "You're crushing it! Keep up the amazing work! 🌟";
  if (score >= 80) return "Excellent progress! You're doing great! 💪";
  if (score >= 70) return "Good job! Stay consistent and you'll reach your goals! 🎯";
  if (score >= 60) return "You're on the right track! Keep pushing forward! 🚀";
  if (score >= 50) return "Don't give up! Small steps lead to big changes! 💚";
  return "Every journey starts somewhere. Let's build healthy habits together! 🌱";
}

/**
 * Format date range for displays
 */
export function formatDateRange(from: Date, to: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const fromStr = from.toLocaleDateString('en-US', options);
  const toStr = to.toLocaleDateString('en-US', options);

  if (from.getFullYear() !== to.getFullYear()) {
    return `${fromStr}, ${from.getFullYear()} - ${toStr}, ${to.getFullYear()}`;
  }

  return `${fromStr} - ${toStr}`;
}

/**
 * Check if user should see premium prompt
 */
export function shouldShowPremiumPrompt(context: {
  tier: string;
  daysActive: number;
  mealsLogged: number;
  achievements: number;
  lastPromptShown?: Date;
}): boolean {
  if (context.tier === 'PREMIUM') return false;

  // Don't show too frequently
  if (context.lastPromptShown) {
    const daysSinceLastPrompt = Math.floor(
      (Date.now() - context.lastPromptShown.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastPrompt < 3) return false;
  }

  // Show after engagement milestones
  if (context.daysActive >= 7 && context.mealsLogged >= 15) return true;
  if (context.achievements >= 3) return true;

  return false;
}

/**
 * Get widget default configuration
 */
export function getDefaultWidgetConfig(widgetType: string): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    'weight-trend': { period: '30d', showTrendline: true },
    'meal-timeline': { showCalories: true, showMacros: false },
    'macro-breakdown': { chartType: 'donut' },
    'activity-ring': { showSteps: true, showCalories: true },
    'insights-card': { maxInsights: 3 },
  };

  return defaults[widgetType] || {};
}

/**
 * Validate dashboard layout
 */
export function validateDashboardLayout(layout: unknown): boolean {
  if (!layout || typeof layout !== 'object') return false;

  const l = layout as Record<string, unknown>;

  if (!l.userId || typeof l.userId !== 'string') return false;
  if (!l.widgets || !Array.isArray(l.widgets)) return false;

  return true;
}

/**
 * Sort widgets by position
 */
export function sortWidgetsByPosition<T extends { position: number }>(widgets: T[]): T[] {
  return [...widgets].sort((a, b) => a.position - b.position);
}

/**
 * Calculate days until goal deadline
 */
export function getDaysUntilDeadline(deadline?: Date): number | null {
  if (!deadline) return null;

  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
