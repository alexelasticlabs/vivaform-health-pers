import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

export interface MealPlanMeal {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: string[];
  instructions: string | null;
  cookingTimeMinutes: number;
}

export interface DayPlan {
  date: string;
  meals: MealPlanMeal[];
  dailyTotals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface WeeklyMealPlan {
  days: DayPlan[];
  weeklyAverages: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  targetMacros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface UserProfile {
  dietPlan: string | null;
  recommendedCalories: number | null;
  foodAllergies: string[];
  avoidedFoods: string[];
  mealComplexity: string | null;
  cookingTimeMinutes: number | null;
  mealsPerDay: number | null;
  skipBreakfast: boolean | null;
}

interface MacroTargets {
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

@Injectable()
export class MealPlanService {
  private readonly logger = new Logger(MealPlanService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Генерирует план питания на неделю БЕЗ внешних AI API
   * Использует алгоритмическую логику на основе данных пользователя
   */
  async generateWeeklyPlan(userId: string): Promise<WeeklyMealPlan> {
    this.logger.log(`Generating weekly meal plan for user ${userId}`);

    // 1. Загружаем профиль пользователя с данными квиза
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        dietPlan: true,
        recommendedCalories: true,
        foodAllergies: true,
        avoidedFoods: true,
        mealComplexity: true,
        cookingTimeMinutes: true,
        mealsPerDay: true,
        skipBreakfast: true
      }
    });

    if (!profile || !profile.recommendedCalories) {
      throw new Error("Profile or recommended calories not found. Please complete the quiz first.");
    }

    // 2. Вычисляем целевые макросы на основе калорий
    const targetMacros = this.calculateMacroTargets(
      profile.recommendedCalories,
      profile.dietPlan || "mediterranean"
    );

    // 3. Загружаем подходящие meal templates из базы
    const availableTemplates = await this.getFilteredMealTemplates(profile);

    if (availableTemplates.length === 0) {
      throw new Error("No suitable meal templates found for your preferences.");
    }

    // 4. Генерируем план на 7 дней
    const days: DayPlan[] = [];
    const today = new Date();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayIndex);
      const dateStr = date.toISOString().split("T")[0];

      const dayPlan = this.generateDayPlan(
        dateStr,
        availableTemplates,
        profile,
        targetMacros,
        profile.recommendedCalories
      );
      days.push(dayPlan);
    }

    // 5. Вычисляем средние значения за неделю
    const weeklyAverages = this.calculateWeeklyAverages(days);

    return {
      days,
      weeklyAverages,
      targetMacros: {
        calories: profile.recommendedCalories,
        ...targetMacros
      }
    };
  }

  /**
   * Вычисляет целевые макросы на основе калорий и типа диеты
   */
  private calculateMacroTargets(dailyCalories: number, dietPlan: string): MacroTargets {
    let proteinRatio = 0.25; // 25% калорий из белка
    let fatRatio = 0.30; // 30% калорий из жира
    let carbsRatio = 0.45; // 45% калорий из углеводов

    // Корректируем соотношения в зависимости от диеты
    if (dietPlan === "carnivore") {
      proteinRatio = 0.35;
      fatRatio = 0.60;
      carbsRatio = 0.05;
    } else if (dietPlan === "anti-inflammatory") {
      proteinRatio = 0.20;
      fatRatio = 0.35;
      carbsRatio = 0.45;
    }

    return {
      protein: Math.round((dailyCalories * proteinRatio) / 4), // 4 kcal per gram
      fat: Math.round((dailyCalories * fatRatio) / 9), // 9 kcal per gram
      carbs: Math.round((dailyCalories * carbsRatio) / 4) // 4 kcal per gram
    };
  }

  /**
   * Фильтрует meal templates на основе предпочтений пользователя
   */
  private async getFilteredMealTemplates(profile: UserProfile) {
    const dietPlan = profile.dietPlan || "mediterranean";
    const maxCookingTime = profile.cookingTimeMinutes || 60;
    const complexity = profile.mealComplexity || "medium";

    // Находим все шаблоны, соответствующие диете пользователя
    const templates = await this.prisma.mealTemplate.findMany({
      where: {
        dietPlans: {
          has: dietPlan
        },
        cookingTimeMinutes: {
          lte: maxCookingTime
        },
        complexity: {
          in: this.getAllowedComplexities(complexity)
        }
      }
    });

    // Фильтруем по аллергенам и избегаемым продуктам
    return templates.filter((template) => {
      // Проверяем аллергены
      const hasAllergen = template.allergens.some((allergen) =>
        profile.foodAllergies.some((allergy) => allergy.toLowerCase() === allergen.toLowerCase())
      );

      if (hasAllergen) {
        return false;
      }

      // Проверяем избегаемые продукты
      const hasAvoidedIngredient = template.avoidedIngredients.some((ingredient) =>
        profile.avoidedFoods.some((avoided) => avoided.toLowerCase() === ingredient.toLowerCase())
      );

      return !hasAvoidedIngredient;
    });
  }

  /**
   * Возвращает допустимые уровни сложности
   */
  private getAllowedComplexities(userComplexity: string): string[] {
    if (userComplexity === "simple") {
      return ["simple"];
    } else if (userComplexity === "medium") {
      return ["simple", "medium"];
    } else {
      return ["simple", "medium", "complex"];
    }
  }

  /**
   * Генерирует план питания на один день
   */
  private generateDayPlan(
    date: string,
    templates: any[],
    profile: UserProfile,
    targetMacros: MacroTargets,
    targetCalories: number
  ): DayPlan {
    const mealsPerDay = profile.mealsPerDay || 3;
    const skipBreakfast = profile.skipBreakfast || false;

    // Определяем, какие приёмы пищи нужны
    const mealTypes: string[] = [];

    if (!skipBreakfast) {
      mealTypes.push("breakfast");
    }

    if (mealsPerDay >= 2) {
      mealTypes.push("lunch");
    }

    if (mealsPerDay >= 3) {
      mealTypes.push("dinner");
    }

    // Добавляем snack, если нужно больше приёмов пищи
    if (mealsPerDay >= 4) {
      mealTypes.push("snack");
    }

    if (mealsPerDay >= 5) {
      mealTypes.push("snack"); // второй snack
    }

    // Подбираем блюда для каждого приёма пищи
    const meals: MealPlanMeal[] = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const mealType of mealTypes) {
      // Вычисляем, сколько калорий должно остаться на оставшиеся приёмы пищи
      const remainingMeals = mealTypes.length - meals.length;
      const targetForThisMeal = (targetCalories - totalCalories) / remainingMeals;

      // Находим подходящее блюдо
      const selectedTemplate = this.selectBestMeal(
        templates,
        mealType,
        targetForThisMeal,
        targetMacros,
        totalProtein,
        totalFat,
        totalCarbs,
        meals
      );

      if (selectedTemplate) {
        meals.push({
          mealType: this.formatMealType(mealType),
          name: selectedTemplate.name,
          calories: selectedTemplate.calories,
          protein: selectedTemplate.protein,
          fat: selectedTemplate.fat,
          carbs: selectedTemplate.carbs,
          ingredients: selectedTemplate.ingredients,
          instructions: selectedTemplate.instructions,
          cookingTimeMinutes: selectedTemplate.cookingTimeMinutes
        });

        totalCalories += selectedTemplate.calories;
        totalProtein += selectedTemplate.protein;
        totalFat += selectedTemplate.fat;
        totalCarbs += selectedTemplate.carbs;
      }
    }

    return {
      date,
      meals,
      dailyTotals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        fat: Math.round(totalFat),
        carbs: Math.round(totalCarbs)
      }
    };
  }

  /**
   * Подбирает лучшее блюдо для приёма пищи на основе целевых макросов
   */
  private selectBestMeal(
    templates: any[],
    mealType: string,
    targetCalories: number,
    targetMacros: MacroTargets,
    currentProtein: number,
    currentFat: number,
    currentCarbs: number,
    alreadySelected: MealPlanMeal[]
  ): any | null {
    // Фильтруем по категории
    let candidates = templates.filter((t) => t.category === mealType);

    // Если категория "snack", используем все snack варианты
    if (candidates.length === 0 && mealType === "snack") {
      candidates = templates.filter((t) => t.category === "snack");
    }

    if (candidates.length === 0) {
      return null;
    }

    // Исключаем уже выбранные блюда в этот день (для разнообразия)
    const alreadySelectedNames = alreadySelected.map((m) => m.name);
    candidates = candidates.filter((t) => !alreadySelectedNames.includes(t.name));

    if (candidates.length === 0) {
      // Если все блюда уже использованы, берём из полного списка
      candidates = templates.filter((t) => t.category === mealType);
    }

    // Ищем блюдо, наиболее близкое к целевым калориям и макросам
    let bestMatch = candidates[0];
    let bestScore = Infinity;

    for (const candidate of candidates) {
      // Вычисляем разницу с целевыми значениями
      const caloriesDiff = Math.abs(candidate.calories - targetCalories);
      const proteinDiff = Math.abs(candidate.protein - targetMacros.protein / 3);
      const fatDiff = Math.abs(candidate.fat - targetMacros.fat / 3);
      const carbsDiff = Math.abs(candidate.carbs - targetMacros.carbs / 3);

      // Общая "оценка" несоответствия (меньше = лучше)
      const score = caloriesDiff + proteinDiff * 4 + fatDiff * 9 + carbsDiff * 4;

      if (score < bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  /**
   * Форматирует название приёма пищи
   */
  private formatMealType(mealType: string): string {
    const mapping: Record<string, string> = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack"
    };

    return mapping[mealType] || mealType;
  }

  /**
   * Вычисляет средние значения макросов за неделю
   */
  private calculateWeeklyAverages(days: DayPlan[]) {
    const totals = days.reduce(
      (acc, day) => {
        acc.calories += day.dailyTotals.calories;
        acc.protein += day.dailyTotals.protein;
        acc.fat += day.dailyTotals.fat;
        acc.carbs += day.dailyTotals.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    return {
      calories: Math.round(totals.calories / days.length),
      protein: Math.round(totals.protein / days.length),
      fat: Math.round(totals.fat / days.length),
      carbs: Math.round(totals.carbs / days.length)
    };
  }
}
