/**
 * Dashboard Types & Interfaces
 * Comprehensive type definitions for the new dashboard system
 */

export type DashboardWidgetType =
  | 'quick-actions'
  | 'daily-snapshot'
  | 'weight-trend'
  | 'meal-timeline'
  | 'activity-ring'
  | 'streak-counter'
  | 'insights-card'
  | 'macro-breakdown'
  | 'hydration-tracker'
  | 'goal-progress';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';
export type DashboardView = 'compact' | 'detailed' | 'minimal';

export interface DashboardWidget {
  id: DashboardWidgetType;
  position: number;
  visible: boolean;
  size: WidgetSize;
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  userId: string;
  view: DashboardView;
  widgets: DashboardWidget[];
  preferences: DashboardPreferences;
}

export interface DashboardPreferences {
  showPremiumPrompts: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    waterReminders: boolean;
    mealReminders: boolean;
    goalMilestones: boolean;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
  shortcut?: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  target?: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  icon?: string;
  color?: string;
}

export interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    nutrition: number;
    hydration: number;
    activity: number;
    consistency: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

export interface DailyInsight {
  id: string;
  type: 'tip' | 'achievement' | 'warning' | 'milestone';
  title: string;
  description: string;
  icon?: string;
  actionable?: {
    label: string;
    action: string;
  };
  priority: 'high' | 'medium' | 'low';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'nutrition' | 'hydration' | 'activity' | 'consistency' | 'special';
  reward?: {
    type: 'badge' | 'premium-trial' | 'discount' | 'feature-unlock';
    value: string | number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StreakData {
  current: number;
  longest: number;
  type: 'daily-logging' | 'water-goal' | 'calorie-goal' | 'activity-goal';
  lastUpdated: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  completed: boolean;
  skippable: boolean;
  order: number;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  steps: OnboardingStep[];
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// API Response types
export interface DailyDashboardResponse {
  date: string;
  healthScore: HealthScore;
  metrics: {
    calories: DashboardMetric;
    water: DashboardMetric;
    weight: DashboardMetric;
    steps: DashboardMetric;
    protein: DashboardMetric;
    carbs: DashboardMetric;
    fat: DashboardMetric;
  };
  mealTimeline: MealTimelineEntry[];
  insights: DailyInsight[];
  streaks: StreakData[];
  achievements: Achievement[];
  goalProgress: GoalProgress;
}

export interface MealTimelineEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  calories: number;
  logged: boolean;
  items?: {
    name: string;
    calories: number;
  }[];
}

export interface GoalProgress {
  primaryGoal: {
    type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle';
    target: number;
    current: number;
    unit: string;
    deadline?: Date;
    progress: number; // 0-100
  };
  weeklyProgress: {
    caloriesOnTrack: number; // percentage
    waterGoalsHit: number; // days
    mealsLogged: number;
    activeStreak: number;
  };
}

// Event types for analytics
export type DashboardEvent =
  | { name: 'dashboard_viewed'; properties: { view: DashboardView; widgets: DashboardWidgetType[] } }
  | { name: 'widget_interacted'; properties: { widget: DashboardWidgetType; action: string } }
  | { name: 'quick_action_clicked'; properties: { action: string } }
  | { name: 'insight_clicked'; properties: { insightId: string; type: string } }
  | { name: 'achievement_unlocked'; properties: { achievementId: string; category: string } }
  | { name: 'onboarding_step_completed'; properties: { stepId: string; stepNumber: number } }
  | { name: 'premium_prompt_shown'; properties: { context: string } }
  | { name: 'premium_prompt_clicked'; properties: { context: string; source: string } };
