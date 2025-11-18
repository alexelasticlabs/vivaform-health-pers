/**
 * Dashboard V2 Service
 * Business logic for the new dashboard features
 */

import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/prisma/prisma.service';
import type {
  DailyDashboardResponseDto,
  HealthScoreDto,
  DashboardMetricDto,
  DailyInsightDto,
  AchievementDto,
  StreakDto,
  GoalProgressDto,
  MealTimelineEntryDto,
} from './dto/dashboard-v2.dto';
import { AchievementCategory, AchievementRarity, GoalType } from './dto/dashboard-v2.dto';

@Injectable()
export class DashboardV2Service {
  private readonly logger = new Logger('DashboardV2Service');
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard data for a user
   */
  async getDailyDashboard(userId: string, date?: string): Promise<DailyDashboardResponseDto> {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    // Fetch user profile and goals
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        quizProfile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parallel data fetching
    const [
      nutritionEntries,
      waterEntries,
      weightEntries,
      healthScore,
      insights,
      streaks,
      achievements,
      goalProgress,
      mealTimeline,
    ] = await Promise.all([
      this.getNutritionEntries(userId, targetDate),
      this.getWaterEntries(userId, targetDate),
      this.getWeightEntries(userId, targetDate),
      this.calculateHealthScore(userId, targetDate),
      this.generateDailyInsights(userId, targetDate),
      this.calculateStreaks(userId),
      this.getUserAchievements(userId),
      this.getGoalProgress(userId),
      this.getMealTimeline(userId, targetDate),
    ]);

    // Activity aggregation for today (from audit logs)
    const { stepsToday } = await this.getActivityForDay(userId, targetDate);

    // Calculate metrics
    const metrics = this.calculateMetrics(
      user,
      nutritionEntries,
      waterEntries,
      weightEntries,
      stepsToday,
    );

    return {
      date: dateStr,
      healthScore,
      metrics,
      mealTimeline,
      insights,
      streaks,
      achievements,
      goalProgress,
    };
  }

  /**
   * Calculate health score based on multiple factors
   */
  private async calculateHealthScore(userId: string, date: Date): Promise<HealthScoreDto> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user's target calories and water from profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const targetCalories = profile?.recommendedCalories ?? 2000;
    const targetWater = 2000; // 2L default

    // Fetch today's data
    const [nutritionEntries, waterEntries, weightEntries, activityAgg] = await Promise.all([
      this.prisma.nutritionEntry.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.prisma.waterEntry.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.prisma.weightEntry.count({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.getActivityForDay(userId, date),
    ]);

    const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalWater = waterEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
    const mealsLogged = nutritionEntries.length;

    // Calculate scores (0-100)
    const caloriesPercent = Math.min(100, (totalCalories / targetCalories) * 100);
    const waterPercent = Math.min(100, (totalWater / targetWater) * 100);
    // Activity percent: based on steps vs target; fallback to profile.activityLevel mapping
    const targetSteps = 10000;
    let activityPercent = 0;
    const steps = (activityAgg?.stepsToday ?? 0) as number;
    if (steps > 0) {
      activityPercent = Math.min(100, Math.round((steps / targetSteps) * 100));
    } else {
      // Fallback to profile activity level heuristic
      const profile = await this.prisma.profile.findUnique({ where: { userId } });
      const level = profile?.activityLevel;
      activityPercent =
        level === 'ATHLETE' ? 95 :
        level === 'ACTIVE' ? 80 :
        level === 'MODERATE' ? 60 :
        level === 'LIGHT' ? 40 : 20;
    }
    const consistencyPercent = Math.min(100, (mealsLogged / 3) * 100); // Expect 3 meals/day

    const nutrition = Math.round((caloriesPercent + consistencyPercent) / 2);
    const hydration = Math.round(waterPercent);
    const activity = Math.round(activityPercent);
    const consistency = Math.round(consistencyPercent);

    const overall = Math.round((nutrition + hydration + activity + consistency) / 4);

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (overall >= 80) trend = 'improving';
    else if (overall < 60) trend = 'declining';

    return {
      overall,
      breakdown: {
        nutrition,
        hydration,
        activity,
        consistency,
      },
      trend,
    };
  }

  /**
   * Calculate all dashboard metrics
   */
  private calculateMetrics(
    user: any,
    nutritionEntries: any[],
    waterEntries: any[],
    weightEntries: any[],
    stepsToday: number,
  ): DailyDashboardResponseDto['metrics'] {
    const profile = user.profile;

    const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalProtein = nutritionEntries.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCarbs = nutritionEntries.reduce((sum, e) => sum + (e.carbs || 0), 0);
    const totalFat = nutritionEntries.reduce((sum, e) => sum + (e.fat || 0), 0);
    const totalWater = waterEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
    const currentWeight = weightEntries[0]?.weightKg || profile?.currentWeightKg || 0;

    const targetCalories = profile?.recommendedCalories || 2000;
    const targetProtein = profile?.targetProtein || 120;
    const targetCarbs = profile?.targetCarbs || 200;
    const targetFat = profile?.targetFat || 60;
    const targetWeight = profile?.targetWeightKg || currentWeight;
    const targetWater = 2000;
    const targetSteps = 10000;

    return {
      calories: {
        id: 'calories',
        label: 'Calories',
        value: totalCalories,
        target: targetCalories,
        unit: 'kcal',
        trend: 'stable',
        changePercent: 0,
        icon: '🔥',
      },
      water: {
        id: 'water',
        label: 'Water',
        value: totalWater,
        target: targetWater,
        unit: 'ml',
        trend: 'up',
        changePercent: 5,
        icon: '💧',
      },
      weight: {
        id: 'weight',
        label: 'Weight',
        value: currentWeight,
        target: targetWeight,
        unit: 'kg',
        trend: currentWeight < targetWeight ? 'down' : 'up',
        changePercent: 0,
        icon: '⚖️',
      },
      steps: {
        id: 'steps',
        label: 'Steps',
        value: stepsToday,
        target: targetSteps,
        unit: 'steps',
        trend: 'stable',
        changePercent: 0,
        icon: '👟',
      },
      protein: {
        id: 'protein',
        label: 'Protein',
        value: totalProtein,
        target: targetProtein,
        unit: 'g',
        icon: '🥩',
      },
      carbs: {
        id: 'carbs',
        label: 'Carbs',
        value: totalCarbs,
        target: targetCarbs,
        unit: 'g',
        icon: '🍞',
      },
      fat: {
        id: 'fat',
        label: 'Fat',
        value: totalFat,
        target: targetFat,
        unit: 'g',
        icon: '🥑',
      },
    };
  }

  /**
   * Generate personalized daily insights
   */
  private async generateDailyInsights(userId: string, date: Date): Promise<DailyInsightDto[]> {
    const insights: DailyInsightDto[] = [];
    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const targetCalories = profile?.recommendedCalories ?? 2000;

    const [nutritionEntries, waterEntries, { stepsToday }] = await Promise.all([
      this.prisma.nutritionEntry.findMany({ where: { userId, date: { gte: startOfDay, lte: endOfDay } } }),
      this.prisma.waterEntry.findMany({ where: { userId, date: { gte: startOfDay, lte: endOfDay } } }),
      this.getActivityForDay(userId, date),
    ]);

    const totalCalories = nutritionEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const totalWater = waterEntries.reduce((s, e) => s + (e.amountMl || 0), 0);

    if (totalCalories < targetCalories * 0.6) {
      insights.push({
        id: 'calories_low', type: 'tip', priority: 'medium', icon: '🍽️',
        title: 'Наберите минимум по калориям',
        description: 'Сегодня вы далеко от целевой калорийности. Добавьте питательный приём пищи.',
        actionable: { label: 'Добавить приём пищи', action: '/app/add-meal' },
      });
    }
    if (totalWater < 1500) {
      insights.push({
        id: 'water_boost', type: 'tip', priority: 'low', icon: '💧',
        title: 'Добавьте воды',
        description: 'Стакан воды улучшит самочувствие и контроль аппетита.',
      });
    }
    if (stepsToday >= 8000) {
      insights.push({
        id: 'activity_good', type: 'milestone', priority: 'high', icon: '🎉',
        title: 'Отличная активность сегодня!',
        description: 'Вы близки к цели по шагам. Так держать!',
      });
    }

    return insights.slice(0, 3);
  }

  /**
   * Calculate user streaks
   */
  private async calculateStreaks(userId: string): Promise<StreakDto[]> {
    // Compute logging streaks over the last 90 days
    const days = 90;
    const now = new Date(); now.setHours(0,0,0,0);
    const from = new Date(now); from.setDate(now.getDate() - (days - 1));

    const entries = await this.prisma.nutritionEntry.findMany({
      where: { userId, date: { gte: from, lte: new Date(now.getTime() + 86400000 - 1) } },
      select: { date: true },
    });

    const set = new Set(entries.map(e => e.date.toISOString().slice(0,10)));
    // daily-logging streak
    let current = 0, longest = 0; let cursor = new Date(now);
    for (let i = 0; i < days; i++) {
      const key = cursor.toISOString().slice(0,10);
      if (set.has(key)) { current++; longest = Math.max(longest, current); }
      else { current = 0; }
      cursor.setDate(cursor.getDate() - 1);
    }

    return [{ current: Math.min(current, days), longest, type: 'daily-logging', lastUpdated: new Date() }];
  }

  /**
   * Get user achievements
   */
  private async getUserAchievements(userId: string): Promise<AchievementDto[]> {
    // Derive simple achievements from existing data
    const now = new Date(); now.setHours(0,0,0,0);
    const from30 = new Date(now); from30.setDate(now.getDate() - 29);

    const [anyMeal, waterEntries] = await Promise.all([
      this.prisma.nutritionEntry.count({ where: { userId } }),
      this.prisma.waterEntry.findMany({ where: { userId, date: { gte: from30, lte: new Date(now.getTime()+86400000-1) } } }),
    ]);

    const byDay = new Map<string, number>();
    for (const w of waterEntries) {
      const k = w.date.toISOString().slice(0,10);
      byDay.set(k, (byDay.get(k) ?? 0) + (w.amountMl || 0));
    }
    const daysHit = Array.from(byDay.values()).filter(x => x >= 2000).length;

    const achievements: AchievementDto[] = [];
    achievements.push({
      id: 'first_meal', title: 'First Meal Logged', description: 'Log your first meal', icon: '🌱',
      progress: Math.min(100, anyMeal > 0 ? 100 : 0), unlocked: anyMeal > 0,
      category: AchievementCategory.NUTRITION, rarity: AchievementRarity.COMMON,
    });
    achievements.push({
      id: 'hydration_hero_30d', title: 'Hydration Hero', description: 'Hit water goal on 10 of last 30 days', icon: '💧',
      progress: Math.min(100, Math.round((daysHit / 10) * 100)), unlocked: daysHit >= 10,
      category: AchievementCategory.HYDRATION, rarity: daysHit >= 10 ? AchievementRarity.RARE : AchievementRarity.COMMON,
    });
    return achievements;
  }

  /**
   * Get goal progress
   */
  private async getGoalProgress(userId: string): Promise<GoalProgressDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const quizProfile = await this.prisma.quizProfile.findUnique({
      where: { userId },
    });

    const goalType = ((quizProfile as any)?.primaryGoal as GoalType) || GoalType.LOSE_WEIGHT;
    const targetWeight = profile?.targetWeightKg || 70;
    const currentWeight = profile?.currentWeightKg || 75;

    return {
      primaryGoal: {
        type: goalType,
        target: targetWeight,
        current: currentWeight,
        unit: 'kg',
        deadline: undefined,
        progress: Math.min(100, ((currentWeight / targetWeight) * 100)),
      },
      weeklyProgress: {
        caloriesOnTrack: 85,
        waterGoalsHit: 5,
        mealsLogged: 18,
        activeStreak: 7,
      },
    };
  }

  /**
   * Get meal timeline for the day
   */
  private async getMealTimeline(userId: string, date: Date): Promise<MealTimelineEntryDto[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await this.prisma.nutritionEntry.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { date: 'asc' },
    });
    const groups = new Map<string, typeof entries>();
    for (const e of entries) {
      const key = (e.mealType || 'Meal').toLowerCase();
      if (!groups.has(key as any)) groups.set(key as any, [] as any);
      (groups.get(key as any) as any[]).push(e);
    }
    const timeline: MealTimelineEntryDto[] = [];
    let i = 0;
    for (const [mealType, items] of groups.entries()) {
      const calories = items.reduce((s, e) => s + (e.calories || 0), 0);
      const time = items[0]?.date?.toISOString().split('T')[1]?.slice(0,5) || '08:00';
      timeline.push({
        id: `${mealType}-${i++}`,
        type: ['breakfast','lunch','dinner','snack'].includes(mealType) ? (mealType as any) : 'snack',
        time,
        calories,
        logged: true,
        items: items.slice(0,3).map((x) => ({ name: x.food, calories: x.calories || 0 })),
      });
    }
    return timeline;
  }

  private async getActivityForDay(userId: string, date: Date): Promise<{ stepsToday: number; durationMin?: number; calories?: number }>{
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    const logs = await this.prisma.auditLog.findMany({
      where: { userId, action: 'activity.logged', createdAt: { gte: start, lte: end } },
      select: { metadata: true },
    });
    let steps = 0; let duration = 0; let calories = 0;
    for (const l of logs) {
      const m = (l.metadata ?? {}) as any;
      if (typeof m.steps === 'number') steps += m.steps;
      if (typeof m.durationMin === 'number') duration += m.durationMin;
      if (typeof m.calories === 'number') calories += m.calories;
    }
    return { stepsToday: steps, durationMin: duration || undefined, calories: calories || undefined };
  }

  // Helper methods
  private async getNutritionEntries(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.nutritionEntry.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  private async getWaterEntries(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.waterEntry.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  private async getWeightEntries(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.weightEntry.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
