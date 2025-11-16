import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { SubmitQuizDto, UpdateQuizProfileDto } from '../dto/submit-quiz.dto';
import {
  extractHeightCm,
  extractWeightKg,
  mapCookingTimeMinutes,
  mapDietPreference,
  mapExerciseRegularly,
} from '../utils/answer-normalizer';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate BMI (Body Mass Index)
   * Formula: weight(kg) / (height(m) ^ 2)
   * Rounded to 2 decimal places
   */
  private calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  }

  /**
   * Extract normalized fields from quiz answers
   */
  private extractNormalizedFields(answers: any) {
    const normalized: Record<string, any> = {};

    const heightCm = extractHeightCm(answers);
    if (typeof heightCm === 'number') {
      normalized.heightCm = heightCm;
    }

    const weightKg = extractWeightKg(answers);
    if (typeof weightKg === 'number') {
      normalized.weightKg = weightKg;
    }

    if (typeof heightCm === 'number' && typeof weightKg === 'number') {
      normalized.bmi = this.calculateBMI(weightKg, heightCm);
    }

    const primaryGoalBlock =
      (answers?.primary_goal && typeof answers.primary_goal === 'object' ? answers.primary_goal : undefined) ??
      (answers?.primaryGoal && typeof answers.primaryGoal === 'object' ? answers.primaryGoal : undefined);
    const legacyGoals = typeof answers?.goals === 'object' ? answers.goals : undefined;
    const goalSource = primaryGoalBlock ?? legacyGoals;

    if (goalSource) {
      const goalType = goalSource.type ?? goalSource.goalType ?? goalSource.intent;
      if (typeof goalType === 'string') {
        normalized.goalType = goalType;
      }

      const goalDeltaKg =
        typeof goalSource.deltaKg === 'number'
          ? goalSource.deltaKg
          : typeof goalSource.delta_kg === 'number'
            ? goalSource.delta_kg
            : undefined;
      if (goalDeltaKg !== undefined) {
        normalized.goalDeltaKg = goalDeltaKg;
      }

      const etaMonths =
        typeof goalSource.etaMonths === 'number'
          ? goalSource.etaMonths
          : typeof goalSource.eta_months === 'number'
            ? goalSource.eta_months
            : typeof goalSource.months === 'number'
              ? goalSource.months
              : undefined;
      if (etaMonths !== undefined) {
        normalized.etaMonths = etaMonths;
      }
    }

    if (typeof answers?.primary_goal === 'string' && !normalized.goalType) {
      const key = answers.primary_goal.toLowerCase();
      if (key === 'weight_loss') normalized.goalType = 'lose';
      else if (key === 'muscle_gain') normalized.goalType = 'gain';
      else if (key === 'maintenance') normalized.goalType = 'maintain';
    }

    const dietPlan = mapDietPreference(answers) ?? answers?.diet?.plan;
    if (typeof dietPlan === 'string') {
      normalized.dietPlan = dietPlan;
    }

    const mealsPerDay =
      typeof answers?.habits?.mealsPerDay === 'number'
        ? answers.habits.mealsPerDay
        : typeof answers?.meals_per_day === 'number'
          ? answers.meals_per_day
          : typeof answers?.mealsPerDay === 'number'
            ? answers.mealsPerDay
            : undefined;
    if (mealsPerDay !== undefined) {
      normalized.mealsPerDay = mealsPerDay;
    }

    const cookingTimeMinutes =
      typeof answers?.habits?.cookingTimeMinutes === 'number'
        ? answers.habits.cookingTimeMinutes
        : typeof answers?.cooking_time_minutes === 'number'
          ? answers.cooking_time_minutes
          : typeof answers?.cookingTimeMinutes === 'number'
            ? answers.cookingTimeMinutes
            : mapCookingTimeMinutes(answers);
    if (typeof cookingTimeMinutes === 'number') {
      normalized.cookingTimeMinutes = cookingTimeMinutes;
    }

    const exerciseRegularly =
      typeof answers?.habits?.exerciseRegularly === 'boolean'
        ? answers.habits.exerciseRegularly
        : typeof answers?.exercise_regularly === 'boolean'
          ? answers.exercise_regularly
          : typeof answers?.exerciseRegularly === 'boolean'
            ? answers.exerciseRegularly
            : mapExerciseRegularly(answers);
    if (typeof exerciseRegularly === 'boolean') {
      normalized.exerciseRegularly = exerciseRegularly;
    }

    return normalized;
  }

  /**
   * Submit quiz profile (idempotent)
   * Creates or updates QuizProfile based on overwrite flag
   */
  async submitQuiz(userId: string, dto: SubmitQuizDto) {
    const { clientId, version, answers, overwrite = true } = dto;

    // Extract and normalize fields
    const normalized = this.extractNormalizedFields(answers);

    // Check if profile exists
    const existing = await this.prisma.quizProfile.findUnique({
      where: { userId },
    });

    let quizProfile;

    if (existing && !overwrite) {
      // Merge with existing answers
      const mergedAnswers = {
        ...(existing.answers as any),
        ...answers,
      };
      const mergedNormalized = this.extractNormalizedFields(mergedAnswers);

      quizProfile = await this.prisma.quizProfile.update({
        where: { userId },
        data: {
          answers: mergedAnswers,
          version,
          ...mergedNormalized,
          completedAt: new Date(),
        },
      });
    } else {
      // Create or replace completely
      quizProfile = await this.prisma.quizProfile.upsert({
        where: { userId },
        create: {
          userId,
          clientId,
          version,
          answers: answers as any,
          ...normalized,
          completedAt: new Date(),
        },
        update: {
          clientId,
          version,
          answers: answers as any,
          ...normalized,
          completedAt: new Date(),
        },
      });
    }

    // Return formatted response
    return {
      userId,
      stored: true,
      profile: {
        dietPlan: quizProfile.dietPlan,
        heightCm: quizProfile.heightCm,
        weightKg: quizProfile.weightKg,
        bmi: quizProfile.bmi,
        goalType: quizProfile.goalType,
        goalDeltaKg: quizProfile.goalDeltaKg,
        etaMonths: quizProfile.etaMonths,
        updatedAt: quizProfile.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Get user's quiz profile
   */
  async getQuizProfile(userId: string) {
    const profile = await this.prisma.quizProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Quiz profile not found');
    }

    return {
      id: profile.id,
      version: profile.version,
      answers: profile.answers,
      // Normalized/cached fields
      dietPlan: profile.dietPlan,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      bmi: profile.bmi,
      goalType: profile.goalType,
      goalDeltaKg: profile.goalDeltaKg,
      etaMonths: profile.etaMonths,
      mealsPerDay: profile.mealsPerDay,
      cookingTimeMinutes: profile.cookingTimeMinutes,
      exerciseRegularly: profile.exerciseRegularly,
      completedAt: profile.completedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Partially update quiz profile
   */
  async updateQuizProfile(userId: string, dto: UpdateQuizProfileDto) {
    const existing = await this.prisma.quizProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Quiz profile not found. Please submit quiz first.');
    }

    // Merge answers
    const mergedAnswers = {
      ...(existing.answers as any),
      ...dto.answers,
    };

    // Re-extract normalized fields from merged answers
    const normalized = this.extractNormalizedFields(mergedAnswers);

    const updated = await this.prisma.quizProfile.update({
      where: { userId },
      data: {
        answers: mergedAnswers,
        ...normalized,
      },
    });

    return {
      userId,
      updated: true,
      profile: {
        dietPlan: updated.dietPlan,
        heightCm: updated.heightCm,
        weightKg: updated.weightKg,
        bmi: updated.bmi,
        goalType: updated.goalType,
        goalDeltaKg: updated.goalDeltaKg,
        etaMonths: updated.etaMonths,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Calculate local BMI preview (client can call this or compute locally)
   */
  calculateBMIPreview(heightCm: number, weightKg: number) {
    const bmi = this.calculateBMI(weightKg, heightCm);
    
    let category: string;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi, category };
  }
}
