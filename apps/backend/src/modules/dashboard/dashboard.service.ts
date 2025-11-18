import { Injectable, Optional, Logger } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NutritionService } from "../nutrition/nutrition.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RecommendationsService } from "../recommendations/recommendations.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { WaterService } from "../water/water.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { WeightService } from "../weight/weight.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
import type { DailyOverviewQueryDto } from "./dto/daily-overview-query.dto";

@Injectable()
export class DashboardService {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly waterService: WaterService,
    private readonly weightService: WeightService,
    private readonly recommendationsService: RecommendationsService,
    @Optional() private readonly prisma?: PrismaService
  ) {}

  async getDailyOverview(userId: string, query: DailyOverviewQueryDto) {
    const { date } = query;

    const profilePromise = this.prisma
      ? this.prisma.profile.findUnique({
          where: { userId },
          select: {
            recommendedCalories: true,
            dailyWaterMl: true
          }
        })
      : Promise.resolve(null as any);

    const [nutritionEntries, waterEntries, latestWeight, weightProgress, recommendations, profile] = await Promise.all([
      this.nutritionService.findDaily(userId, date),
      this.waterService.findDaily(userId, date),
      this.weightService.getLatest(userId),
      this.weightService.getProgress(userId, { limit: 30 }),
      this.recommendationsService.findDaily(userId, date),
      profilePromise
    ]);

    const nutritionSummary = nutritionEntries.reduce(
      (acc, entry) => {
        acc.calories += entry.calories;
        acc.protein += entry.protein;
        acc.fat += entry.fat;
        acc.carbs += entry.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    const totalWaterMl = waterEntries.reduce((total, entry) => total + entry.amountMl, 0);

    // Цели: если есть recommendedCalories, рассчитываем макросы (30/30/40), иначе null
    let goals: any;
    if (profile?.recommendedCalories) {
      const calorieGoal = Math.round(profile.recommendedCalories);
      const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
      const fatGoal = Math.round((calorieGoal * 0.3) / 9);
      const carbsGoal = Math.round((calorieGoal * 0.4) / 4);
      goals = {
        calories: calorieGoal,
        protein: proteinGoal,
        fat: fatGoal,
        carbs: carbsGoal,
        waterMl: profile?.dailyWaterMl || 2000
      };
    } else {
      goals = {
        calories: null,
        protein: null,
        fat: null,
        carbs: null,
        waterMl: profile?.dailyWaterMl || 2000
      };
    }

    return {
      date: date ?? new Date().toISOString(),
      nutrition: {
        entries: nutritionEntries,
        summary: nutritionSummary
      },
      water: {
        entries: waterEntries,
        totalMl: totalWaterMl
      },
      weight: {
        latest: latestWeight,
        progress: weightProgress
      },
      recommendations,
      goals
    };
  }

  /**
   * Log a user activity event as an audit log entry (avoids schema changes)
   */
  async logActivity(
    userId: string,
    payload: { date?: string; type?: string; steps?: number; durationMin?: number; calories?: number; note?: string },
  ) {
    if (!this.prisma) throw new Error('Persistence layer not available');
    const logger = new Logger('DashboardService');
    try {
      const createdAt = payload.date ? new Date(payload.date) : new Date();
      // Normalize to provided date, but preserve now-time if same day
      const entry = await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'activity.logged',
          entity: 'activity',
          entityId: undefined,
          metadata: {
            type: payload.type ?? 'custom',
            steps: typeof payload.steps === 'number' ? payload.steps : undefined,
            durationMin: typeof payload.durationMin === 'number' ? payload.durationMin : undefined,
            calories: typeof payload.calories === 'number' ? payload.calories : undefined,
            note: payload.note,
            date: (payload.date ?? createdAt.toISOString()).slice(0, 10),
          },
          createdAt,
        },
      });
      return { id: entry.id, ok: true };
    } catch (e) {
      logger.error(`Failed to log activity: ${(e as Error)?.message}`);
      throw e;
    }
  }
}