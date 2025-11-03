import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NutritionService } from "../nutrition/nutrition.service";
import { WaterService } from "../water/water.service";
import { WeightService } from "../weight/weight.service";
import { RecommendationsService } from "./recommendations.service";

interface RecommendationRule {
  condition: (data: AnalysisData) => boolean;
  title: string;
  body: string;
  priority: number; // 1 = highest, 5 = lowest
}

interface AnalysisData {
  userId: string;
  averageCalories: number;
  targetCalories: number | null;
  averageProtein: number;
  targetProtein: number | null;
  averageWater: number;
  targetWater: number | null;
  weightDelta: number;
  daysSinceLastWeight: number;
  lastWeekEntries: number;
}

/**
 * Сервис автоматической генерации персональных рекомендаций
 * БЕЗ внешних AI API - использует rule-based алгоритм
 */
@Injectable()
export class RecommendationsGeneratorService {
  private readonly logger = new Logger(RecommendationsGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nutritionService: NutritionService,
    private readonly waterService: WaterService,
    private readonly weightService: WeightService,
    private readonly recommendationsService: RecommendationsService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * Генерирует рекомендации для всех пользователей с данными за последнюю неделю
   */
  async generateForAllUsers(): Promise<number> {
    this.logger.log("Starting recommendations generation for all users");

    const users = await this.prisma.user.findMany({
      where: {
        profile: {
          isNot: null
        }
      },
      select: {
        id: true,
        tier: true,
        profile: {
          select: {
            recommendedCalories: true,
            dailyWaterMl: true
          }
        }
      }
    });

    let generated = 0;

    for (const user of users) {
      try {
        const count = await this.generateForUser(user.id);
        generated += count;
      } catch (error) {
        this.logger.error(`Failed to generate recommendations for user ${user.id}`, error);
      }
    }

    this.logger.log(`Generated ${generated} recommendations for ${users.length} users`);
    return generated;
  }

  /**
   * Генерирует рекомендации для конкретного пользователя
   */
  async generateForUser(userId: string): Promise<number> {
    // Собираем данные за последние 7 дней
    const analysisData = await this.collectUserData(userId);

    if (analysisData.lastWeekEntries === 0) {
      // Нет данных для анализа
      return 0;
    }

    // Применяем правила генерации
    const recommendations = this.applyRules(analysisData);

    // Сохраняем топ-3 рекомендации (по приоритету)
    const topRecommendations = recommendations.slice(0, 3);

    for (const rec of topRecommendations) {
      await this.recommendationsService.create(userId, {
        title: rec.title,
        body: rec.body,
        date: new Date().toISOString()
      });
    }

    // Отправляем push-уведомление о новых рекомендациях
    if (topRecommendations.length > 0) {
      try {
        await this.notificationsService.sendRecommendationsNotification(userId, topRecommendations.length);
      } catch (error) {
        this.logger.warn(`Failed to send notification to user ${userId}`, error);
      }
    }

    this.logger.log(`Generated ${topRecommendations.length} recommendations for user ${userId}`);
    return topRecommendations.length;
  }

  /**
   * Собирает данные пользователя за последние 7 дней
   */
  private async collectUserData(userId: string): Promise<AnalysisData> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profile, nutritionEntries, waterEntries, weightProgress] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { userId },
        select: {
          recommendedCalories: true,
          dailyWaterMl: true
        }
      }),
      this.prisma.nutritionEntry.findMany({
        where: {
          userId,
          date: {
            gte: sevenDaysAgo
          }
        }
      }),
      this.prisma.waterEntry.findMany({
        where: {
          userId,
          date: {
            gte: sevenDaysAgo
          }
        }
      }),
      this.weightService.getProgress(userId, { limit: 14 })
    ]);

    // Группируем данные по дням
    const dailyNutrition: Record<string, { calories: number; protein: number }> = {};
    for (const entry of nutritionEntries) {
      const day = entry.date.toISOString().split("T")[0];
      if (!dailyNutrition[day]) {
        dailyNutrition[day] = { calories: 0, protein: 0 };
      }
      dailyNutrition[day].calories += entry.calories;
      dailyNutrition[day].protein += entry.protein;
    }

    const dailyWater: Record<string, number> = {};
    for (const entry of waterEntries) {
      const day = entry.date.toISOString().split("T")[0];
      if (!dailyWater[day]) {
        dailyWater[day] = 0;
      }
      dailyWater[day] += entry.amountMl;
    }

    // Вычисляем средние
    const days = Object.keys(dailyNutrition).length;
    const averageCalories =
      days > 0
        ? Object.values(dailyNutrition).reduce((sum, day) => sum + day.calories, 0) / days
        : 0;
    const averageProtein =
      days > 0
        ? Object.values(dailyNutrition).reduce((sum, day) => sum + day.protein, 0) / days
        : 0;

    const waterDays = Object.keys(dailyWater).length;
    const averageWater =
      waterDays > 0 ? Object.values(dailyWater).reduce((sum, ml) => sum + ml, 0) / waterDays : 0;

    // Последнее взвешивание
    const latestWeight = await this.weightService.getLatest(userId);
    const daysSinceLastWeight = latestWeight
      ? Math.floor(
          (Date.now() - new Date(latestWeight.date).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    // Целевые значения
    const targetProtein = profile?.recommendedCalories
      ? Math.round((profile.recommendedCalories * 0.25) / 4)
      : null;

    return {
      userId,
      averageCalories: Math.round(averageCalories),
      targetCalories: profile?.recommendedCalories || null,
      averageProtein: Math.round(averageProtein),
      targetProtein,
      averageWater: Math.round(averageWater),
      targetWater: profile?.dailyWaterMl || null,
      weightDelta: weightProgress.delta,
      daysSinceLastWeight,
      lastWeekEntries: nutritionEntries.length + waterEntries.length
    };
  }

  /**
   * Применяет правила генерации рекомендаций
   */
  private applyRules(data: AnalysisData): RecommendationRule[] {
    const rules: RecommendationRule[] = [
      // Правило 1: Недостаток белка
      {
        condition: (d) => d.targetProtein !== null && d.averageProtein < d.targetProtein * 0.7,
        title: "Increase your protein intake",
        body: `You're averaging ${data.averageProtein}g of protein per day, which is below your target of ${data.targetProtein}g. Try adding lean meats, fish, eggs, or legumes to your meals.`,
        priority: 1
      },

      // Правило 2: Калории стабильно ниже нормы
      {
        condition: (d) => d.targetCalories !== null && d.averageCalories < d.targetCalories * 0.8,
        title: "You're eating too few calories",
        body: `Your average daily intake (${data.averageCalories} kcal) is significantly below your recommended ${data.targetCalories} kcal. This may slow your metabolism. Consider adding healthy snacks between meals.`,
        priority: 1
      },

      // Правило 3: Калории стабильно выше нормы
      {
        condition: (d) => d.targetCalories !== null && d.averageCalories > d.targetCalories * 1.2,
        title: "Calorie intake is above target",
        body: `You're consuming around ${data.averageCalories} kcal per day, which exceeds your target of ${data.targetCalories} kcal. Try reducing portion sizes or choosing lower-calorie alternatives.`,
        priority: 2
      },

      // Правило 4: Недостаток воды
      {
        condition: (d) => d.targetWater !== null && d.averageWater < d.targetWater * 0.6,
        title: "Drink more water",
        body: `You're only drinking ${data.averageWater}ml of water per day on average. Your goal is ${data.targetWater}ml. Set reminders throughout the day to stay hydrated.`,
        priority: 2
      },

      // Правило 5: Вес не меняется (плато)
      {
        condition: (d) => Math.abs(d.weightDelta) < 0.2 && d.daysSinceLastWeight <= 14,
        title: "Weight plateau detected",
        body: `Your weight hasn't changed much in the past 2 weeks (${data.weightDelta >= 0 ? "+" : ""}${data.weightDelta.toFixed(1)} kg). Consider adjusting your activity level or reviewing your meal portions.`,
        priority: 3
      },

      // Правило 6: Давно не взвешивались
      {
        condition: (d) => d.daysSinceLastWeight > 7,
        title: "Time to weigh yourself",
        body: `It's been ${data.daysSinceLastWeight} days since your last weigh-in. Regular tracking helps you stay on course. Step on the scale to see your progress!`,
        priority: 3
      },

      // Правило 7: Отличный прогресс
      {
        condition: (d) =>
          d.averageCalories > 0 &&
          d.targetCalories !== null &&
          Math.abs(d.averageCalories - d.targetCalories) < d.targetCalories * 0.1,
        title: "You're doing great! 🎉",
        body: `Your calorie intake (${data.averageCalories} kcal) is right on target! Keep up the excellent work with your nutrition tracking.`,
        priority: 4
      },

      // Правило 8: Хорошее потребление воды
      {
        condition: (d) =>
          d.targetWater !== null &&
          d.averageWater >= d.targetWater * 0.9 &&
          d.averageWater <= d.targetWater * 1.1,
        title: "Perfect hydration! 💧",
        body: `You're drinking ${data.averageWater}ml of water daily, which is perfect for your ${data.targetWater}ml goal. Stay hydrated!`,
        priority: 5
      }
    ];

    // Фильтруем и сортируем по приоритету
    return rules.filter((rule) => rule.condition(data)).sort((a, b) => a.priority - b.priority);
  }
}
