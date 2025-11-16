/**
 * Dashboard V2 Service
 * Business logic for the new dashboard features
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
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

    // Calculate metrics
    const metrics = this.calculateMetrics(
      user,
      nutritionEntries,
      waterEntries,
      weightEntries
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

    const targetCalories = profile?.targetDailyCalories || 2000;
    const targetWater = 2000; // 2L default

    // Fetch today's data
    const [nutritionEntries, waterEntries, weightEntries] = await Promise.all([
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
    ]);

    const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalWater = waterEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
    const mealsLogged = nutritionEntries.length;

    // Calculate scores (0-100)
    const caloriesPercent = Math.min(100, (totalCalories / targetCalories) * 100);
    const waterPercent = Math.min(100, (totalWater / targetWater) * 100);
    const activityPercent = 70; // TODO: Implement with actual activity data
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
    weightEntries: any[]
  ): DailyDashboardResponseDto['metrics'] {
    const profile = user.profile;

    const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalProtein = nutritionEntries.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCarbs = nutritionEntries.reduce((sum, e) => sum + (e.carbs || 0), 0);
    const totalFat = nutritionEntries.reduce((sum, e) => sum + (e.fat || 0), 0);
    const totalWater = waterEntries.reduce((sum, e) => sum + (e.amountMl || 0), 0);
    const currentWeight = weightEntries[0]?.weightKg || profile?.currentWeight || 0;

    const targetCalories = profile?.targetDailyCalories || 2000;
    const targetProtein = profile?.targetProtein || 120;
    const targetCarbs = profile?.targetCarbs || 200;
    const targetFat = profile?.targetFat || 60;
    const targetWeight = profile?.targetWeight || currentWeight;
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
        value: 0, // TODO: Implement with actual activity data
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

    // TODO: Implement smart insight generation based on:
    // - Progress trends
    // - Achievement milestones
    // - Nutritional patterns
    // - Goal proximity

    // Example insights for now
    insights.push({
      id: '1',
      type: 'tip',
      title: 'Try adding protein to breakfast',
      description: 'Studies show protein-rich breakfasts help with satiety throughout the day.',
      priority: 'medium',
      icon: '💡',
      actionable: {
        label: 'See protein-rich recipes',
        action: '/recipes?filter=protein',
      },
    });

    return insights;
  }

  /**
   * Calculate user streaks
   */
  private async calculateStreaks(userId: string): Promise<StreakDto[]> {
    // TODO: Implement actual streak calculation
    // For now, return mock data
    return [
      {
        current: 7,
        longest: 12,
        type: 'daily-logging',
        lastUpdated: new Date(),
      },
    ];
  }

  /**
   * Get user achievements
   */
  private async getUserAchievements(userId: string): Promise<AchievementDto[]> {
    // TODO: Implement achievement system with database
    // For now, return sample achievements
    return [
      {
        id: '1',
        title: 'First Steps',
        description: 'Log your first meal',
        icon: '🌱',
        progress: 100,
        unlocked: true,
        category: AchievementCategory.NUTRITION,
        rarity: AchievementRarity.COMMON,
      },
      {
        id: '2',
        title: 'Week Warrior',
        description: 'Log meals for 7 consecutive days',
        icon: '🔥',
        progress: 100,
        unlocked: true,
        category: AchievementCategory.CONSISTENCY,
        rarity: AchievementRarity.RARE,
      },
      {
        id: '3',
        title: 'Hydration Hero',
        description: 'Hit your water goal 30 days in a row',
        icon: '💧',
        progress: 10,
        unlocked: false,
        category: AchievementCategory.HYDRATION,
        rarity: AchievementRarity.EPIC,
      },
    ];
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

    const goalType = (quizProfile?.primaryGoal as GoalType) || GoalType.LOSE_WEIGHT;
    const targetWeight = profile?.targetWeight || 70;
    const currentWeight = profile?.currentWeight || 75;

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
    });

    // TODO: Group by meal type and create timeline
    return [];
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
