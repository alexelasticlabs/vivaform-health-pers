import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';
import type {
  DietPlan,
  ActivityLevel,
  GoalTimeline,
  MealComplexity,
  Theme,
} from '@vivaform/shared';

export class SubmitQuizDto {
  @IsOptional()
  @IsString()
  dietPlan?: DietPlan;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  currentWeightKg?: number;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @IsString()
  goalTimeline?: GoalTimeline;

  @IsOptional()
  @IsNumber()
  mealsPerDay?: number;

  @IsOptional()
  @IsBoolean()
  skipBreakfast?: boolean;

  @IsOptional()
  @IsBoolean()
  snackBetweenMeals?: boolean;

  @IsOptional()
  @IsString()
  fastFoodFrequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';

  @IsOptional()
  @IsString()
  cookAtHomeFrequency?: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';

  @IsOptional()
  @IsNumber()
  sleepHours?: number;

  @IsOptional()
  @IsString()
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsBoolean()
  exerciseRegularly?: boolean;

  @IsOptional()
  @IsString()
  wakeUpTime?: string;

  @IsOptional()
  @IsString()
  dinnerTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodAllergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidedFoods?: string[];

  @IsOptional()
  @IsString()
  mealComplexity?: MealComplexity;

  @IsOptional()
  @IsBoolean()
  tryNewFoods?: boolean;

  @IsOptional()
  @IsNumber()
  cookingTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  eatWhenStressed?: boolean;

  @IsOptional()
  @IsString()
  mainMotivation?: 'health' | 'appearance' | 'energy' | 'discipline' | 'longevity';

  @IsOptional()
  @IsNumber()
  stressLevel?: number;

  @IsOptional()
  @IsString()
  comfortSource?: 'food' | 'exercise' | 'rest' | 'socializing';

  @IsOptional()
  @IsNumber()
  routineConfidence?: number;

  @IsOptional()
  @IsNumber()
  dailyWaterMl?: number;

  @IsOptional()
  @IsBoolean()
  wantReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  trackActivity?: boolean;

  @IsOptional()
  @IsBoolean()
  connectHealthApp?: boolean;

  @IsOptional()
  @IsString()
  theme?: Theme;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;
}
