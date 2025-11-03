import { apiClient } from "./client";

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

export async function getMealPlan(): Promise<WeeklyMealPlan> {
  const response = await apiClient.get<WeeklyMealPlan>("/nutrition/meal-plan");
  return response.data;
}
