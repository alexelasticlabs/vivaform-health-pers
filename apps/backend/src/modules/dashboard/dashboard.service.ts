import { Injectable } from "@nestjs/common";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NutritionService } from "../nutrition/nutrition.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RecommendationsService } from "../recommendations/recommendations.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { WaterService } from "../water/water.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { WeightService } from "../weight/weight.service";
import type { DailyOverviewQueryDto } from "./dto/daily-overview-query.dto";

@Injectable()
export class DashboardService {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly waterService: WaterService,
    private readonly weightService: WeightService,
    private readonly recommendationsService: RecommendationsService
  ) {}

  async getDailyOverview(userId: string, query: DailyOverviewQueryDto) {
    const { date } = query;

    const [nutritionEntries, waterEntries, latestWeight, weightProgress, recommendations] = await Promise.all([
      this.nutritionService.findDaily(userId, date),
      this.waterService.findDaily(userId, date),
      this.weightService.getLatest(userId),
      this.weightService.getProgress(userId, { limit: 30 }),
      this.recommendationsService.findDaily(userId, date)
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
      recommendations
    };
  }
}