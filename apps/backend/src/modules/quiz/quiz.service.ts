import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../common/prisma/prisma.service';
import type {
  QuizAnswers,
  QuizResult,
  ActivityLevel,
  WeightGoal,
} from '@vivaform/shared';
import { ACTIVITY_LEVELS } from '@vivaform/shared';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate BMI (Body Mass Index)
   * Formula: weight(kg) / (height(m) ^ 2)
   */
  private calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  }

  /**
   * Get BMI category
   */
  private getBMICategory(
    bmi: number,
  ): 'underweight' | 'normal' | 'overweight' | 'obese' {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  /**
   * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
   * Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
   * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
   * Simplified version without age/gender for now
   */
  private calculateBMR(
    weightKg: number,
    heightCm: number,
    gender?: string,
    birthDate?: string,
  ): number {
    // Calculate age if birthDate provided
    let age = 30; // default
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
    }

    let bmr: number;
    if (gender === 'female') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else {
      // male or default
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    }

    return Math.round(bmr);
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   * Formula: BMR * Activity Multiplier
   */
  private calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel);
    const multiplier = activity?.multiplier || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Determine weight goal based on current vs target
   */
  private determineWeightGoal(
    currentWeight: number,
    targetWeight: number,
  ): WeightGoal {
    const diff = targetWeight - currentWeight;
    if (Math.abs(diff) < 2) return 'maintain';
    return diff < 0 ? 'lose' : 'gain';
  }

  /**
   * Calculate recommended daily calories based on goal
   * - Lose: TDEE - 500 (0.5kg/week loss)
   * - Maintain: TDEE
   * - Gain: TDEE + 300 (muscle gain with minimal fat)
   */
  private calculateRecommendedCalories(
    tdee: number,
    goal: WeightGoal,
  ): number {
    if (goal === 'lose') return Math.max(1200, tdee - 500); // Never go below 1200
    if (goal === 'gain') return tdee + 300;
    return tdee;
  }

  /**
   * Calculate macros distribution
   * Standard: 30% protein, 30% fat, 40% carbs
   */
  private calculateMacros(calories: number) {
    const proteinCalories = calories * 0.3;
    const fatCalories = calories * 0.3;
    const carbsCalories = calories * 0.4;

    return {
      protein: Math.round(proteinCalories / 4), // 4 cal/g
      fat: Math.round(fatCalories / 9), // 9 cal/g
      carbs: Math.round(carbsCalories / 4), // 4 cal/g
    };
  }

  /**
   * Generate personalized advice
   */
  private generateAdvice(
    goal: WeightGoal,
    _bmi: number,
    answers: QuizAnswers,
  ): string {
    const advice: string[] = [];

    // Goal-based advice
    if (goal === 'lose') {
      advice.push(
        `You can achieve your goal by reducing ${Math.round(
          500,
        )} kcal/day and staying active.`,
      );
    } else if (goal === 'gain') {
      advice.push(
        'Focus on progressive strength training and a calorie surplus for healthy weight gain.',
      );
    } else {
      advice.push(
        'Maintain your current weight by balancing calories in and calories out.',
      );
    }

    // Sleep advice
    if (answers.sleepHours && answers.sleepHours < 7) {
      advice.push(
        'Try to get 7-9 hours of sleep — it helps regulate hunger hormones.',
      );
    }

    // Activity advice
    if (
      answers.activityLevel === 'sedentary' ||
      answers.exerciseRegularly === false
    ) {
      advice.push(
        'Adding 30 minutes of daily movement can boost your metabolism and mood.',
      );
    }

    // Hydration advice
    if (answers.dailyWaterMl && answers.dailyWaterMl < 2000) {
      advice.push(
        'Aim for at least 2 liters of water daily — hydration supports metabolism.',
      );
    }

    // Stress management
    if (answers.stressLevel && answers.stressLevel >= 4) {
      advice.push(
        'Managing stress is key — consider mindfulness or regular breaks throughout the day.',
      );
    }

    return advice.join(' ');
  }

  /**
   * Calculate quiz result
   */
  calculateQuizResult(answers: QuizAnswers): QuizResult {
    const {
      heightCm = 170,
      currentWeightKg = 70,
      targetWeightKg = 65,
      activityLevel = 'moderate',
      gender,
      birthDate,
    } = answers;

    const bmi = this.calculateBMI(currentWeightKg, heightCm);
    const bmiCategory = this.getBMICategory(bmi);
    const bmr = this.calculateBMR(currentWeightKg, heightCm, gender, birthDate);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const goal = this.determineWeightGoal(currentWeightKg, targetWeightKg);
    const recommendedCalories = this.calculateRecommendedCalories(tdee, goal);
    const macros = this.calculateMacros(recommendedCalories);

    // Calculate timeline estimates
    const weightDiff = Math.abs(targetWeightKg - currentWeightKg);
    const dailyCalorieDeficit = Math.abs(recommendedCalories - tdee);
    const weeklyWeightChangeLbs =
      goal === 'maintain' ? 0 : (dailyCalorieDeficit * 7) / 7700; // 7700 kcal = 1kg
    const estimatedWeeks =
      goal === 'maintain' ? 0 : Math.ceil(weightDiff / weeklyWeightChangeLbs);

    const advice = this.generateAdvice(goal, bmi, answers);

    return {
      bmi,
      bmiCategory,
      bmr,
      tdee,
      recommendedCalories,
      dailyCalorieDeficit: goal !== 'maintain' ? dailyCalorieDeficit : 0,
      weeklyWeightChangeLbs: parseFloat(weeklyWeightChangeLbs.toFixed(2)),
      estimatedWeeks,
      macros,
      advice,
      goal,
    };
  }

  /**
   * Submit quiz and save to profile (optionally with userId)
   */
  async submitQuiz(
    answers: QuizAnswers,
    userId?: string,
  ): Promise<QuizResult> {
    const result = this.calculateQuizResult(answers);

    // If userId provided, save to profile
    if (userId) {
      const activityLevelEnum = answers.activityLevel?.toUpperCase() as
        | 'SEDENTARY'
        | 'LIGHT'
        | 'MODERATE'
        | 'ACTIVE'
        | 'ATHLETE'
        | undefined;

      let goalEnum:
        | 'LOSE_WEIGHT'
        | 'MAINTAIN_WEIGHT'
        | 'GAIN_WEIGHT'
        | undefined;
      if (result.goal === 'lose') goalEnum = 'LOSE_WEIGHT';
      else if (result.goal === 'gain') goalEnum = 'GAIN_WEIGHT';
      else goalEnum = 'MAINTAIN_WEIGHT';

      await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          heightCm: answers.heightCm,
          currentWeightKg: answers.currentWeightKg,
          targetWeightKg: answers.targetWeightKg,
          activityLevel: activityLevelEnum,
          goal: goalEnum,
          gender: answers.gender,
          birthDate: answers.birthDate
            ? new Date(answers.birthDate)
            : undefined,
          dietaryPreferences: answers.avoidedFoods || [],
          dietPlan: answers.dietPlan,
          mealsPerDay: answers.mealsPerDay,
          skipBreakfast: answers.skipBreakfast,
          snackBetweenMeals: answers.snackBetweenMeals,
          fastFoodFrequency: answers.fastFoodFrequency,
          cookAtHomeFrequency: answers.cookAtHomeFrequency,
          sleepHours: answers.sleepHours,
          exerciseRegularly: answers.exerciseRegularly,
          wakeUpTime: answers.wakeUpTime,
          dinnerTime: answers.dinnerTime,
          foodAllergies: answers.foodAllergies || [],
          avoidedFoods: answers.avoidedFoods || [],
          mealComplexity: answers.mealComplexity,
          tryNewFoods: answers.tryNewFoods,
          cookingTimeMinutes: answers.cookingTimeMinutes,
          eatWhenStressed: answers.eatWhenStressed,
          mainMotivation: answers.mainMotivation,
          stressLevel: answers.stressLevel,
          comfortSource: answers.comfortSource,
          routineConfidence: answers.routineConfidence,
          dailyWaterMl: answers.dailyWaterMl,
          wantReminders: answers.wantReminders,
          trackActivity: answers.trackActivity,
          connectHealthApp: answers.connectHealthApp,
          theme: answers.theme,
          bmi: result.bmi,
          bmr: result.bmr,
          tdee: result.tdee,
          recommendedCalories: result.recommendedCalories,
        },
        update: {
          heightCm: answers.heightCm,
          currentWeightKg: answers.currentWeightKg,
          targetWeightKg: answers.targetWeightKg,
          activityLevel: activityLevelEnum,
          goal: goalEnum,
          gender: answers.gender,
          birthDate: answers.birthDate
            ? new Date(answers.birthDate)
            : undefined,
          dietaryPreferences: answers.avoidedFoods || [],
          dietPlan: answers.dietPlan,
          mealsPerDay: answers.mealsPerDay,
          skipBreakfast: answers.skipBreakfast,
          snackBetweenMeals: answers.snackBetweenMeals,
          fastFoodFrequency: answers.fastFoodFrequency,
          cookAtHomeFrequency: answers.cookAtHomeFrequency,
          sleepHours: answers.sleepHours,
          exerciseRegularly: answers.exerciseRegularly,
          wakeUpTime: answers.wakeUpTime,
          dinnerTime: answers.dinnerTime,
          foodAllergies: answers.foodAllergies || [],
          avoidedFoods: answers.avoidedFoods || [],
          mealComplexity: answers.mealComplexity,
          tryNewFoods: answers.tryNewFoods,
          cookingTimeMinutes: answers.cookingTimeMinutes,
          eatWhenStressed: answers.eatWhenStressed,
          mainMotivation: answers.mainMotivation,
          stressLevel: answers.stressLevel,
          comfortSource: answers.comfortSource,
          routineConfidence: answers.routineConfidence,
          dailyWaterMl: answers.dailyWaterMl,
          wantReminders: answers.wantReminders,
          trackActivity: answers.trackActivity,
          connectHealthApp: answers.connectHealthApp,
          theme: answers.theme,
          bmi: result.bmi,
          bmr: result.bmr,
          tdee: result.tdee,
          recommendedCalories: result.recommendedCalories,
        },
      });
    }

    return result;
  }
}
