import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SubmitQuizDto, UpdateQuizProfileDto } from '../dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normalize height to centimeters
   * Accepts either cm or ft+in
   */
  private normalizeHeight(height: any): number {
    if (height.cm) {
      return height.cm;
    }
    if (height.ft !== undefined && height.in !== undefined) {
      // Convert feet and inches to cm
      const totalInches = height.ft * 12 + height.in;
      return totalInches * 2.54;
    }
    if (height.ft !== undefined) {
      // Only feet provided
      const totalInches = height.ft * 12;
      return totalInches * 2.54;
    }
    throw new BadRequestException('Height must be provided in cm or ft+in');
  }

  /**
   * Normalize weight to kilograms
   * Accepts either kg or lb
   */
  private normalizeWeight(weight: any): number {
    if (weight.kg) {
      return weight.kg;
    }
    if (weight.lb) {
      // Convert pounds to kg
      return weight.lb * 0.453592;
    }
    throw new BadRequestException('Weight must be provided in kg or lb');
  }

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
    const normalized: any = {};

    // Normalize body metrics if provided
    if (answers.body) {
      if (answers.body.height) {
        normalized.heightCm = this.normalizeHeight(answers.body.height);
      }
      if (answers.body.weight) {
        normalized.weightKg = this.normalizeWeight(answers.body.weight);
      }

      // Calculate BMI if we have both height and weight
      if (normalized.heightCm && normalized.weightKg) {
        normalized.bmi = this.calculateBMI(normalized.weightKg, normalized.heightCm);
      }
    }

    // Extract goal information
    if (answers.goals) {
      normalized.goalType = answers.goals.type;
      normalized.goalDeltaKg = answers.goals.deltaKg;
      normalized.etaMonths = answers.goals.etaMonths;
    }

    // Extract diet plan
    if (answers.diet?.plan) {
      normalized.dietPlan = answers.diet.plan;
    }

    // Extract common habit fields
    if (answers.habits) {
      normalized.mealsPerDay = answers.habits.mealsPerDay;
      normalized.cookingTimeMinutes = answers.habits.cookingTimeMinutes;
      normalized.exerciseRegularly = answers.habits.exerciseRegularly;
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
