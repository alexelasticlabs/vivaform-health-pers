import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { QuizService as QuizProfileService } from './services/quiz-profile.service';
import type { SubmitQuizDto, UpdateQuizProfileDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserPayload } from '../../common/types/current-user';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { QuizService as LegacyQuizService } from './quiz.service';
import type { QuizAnswers } from '@vivaform/shared';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(
    private quizProfileService: QuizProfileService,
    private legacyQuizService: LegacyQuizService,
  ) {}

  private mapAnyToQuizAnswers(payload: any): QuizAnswers {
    const p = payload || {};
    const answers: QuizAnswers = {
      dietPlan: p.dietPlan || p?.diet?.plan,
      heightCm: p.heightCm ?? p.height ?? p?.body?.height?.cm,
      currentWeightKg: p.currentWeightKg ?? p.weight ?? p?.body?.weight?.kg,
      targetWeightKg: p.targetWeightKg,
      activityLevel: p.activityLevel || p?.habits?.activityLevel,
      gender: p.gender,
      birthDate: p.birthDate,
      mealsPerDay: p.mealsPerDay ?? p?.habits?.mealsPerDay,
      snackBetweenMeals: p.snackBetweenMeals ?? p?.habits?.snacks,
      cookAtHomeFrequency: p.cookAtHomeFrequency ?? p?.habits?.cookAtHomeFrequency,
      fastFoodFrequency: p.fastFoodFrequency ?? p?.habits?.fastFoodFrequency,
      exerciseRegularly: p.exerciseRegularly ?? p?.habits?.exerciseRegularly,
      sleepHours: p.sleepHours ?? p?.habits?.sleepHours,
      foodAllergies: p.foodAllergies ?? p?.habits?.foodAllergies,
      avoidedFoods: p.avoidedFoods ?? p?.habits?.avoidedFoods,
      mealComplexity: p.mealComplexity ?? p?.habits?.mealComplexity,
      cookingTimeMinutes: p.cookingTimeMinutes ?? p?.habits?.cookingTimeMinutes,
      wakeUpTime: p.wakeUpTime ?? p?.habits?.wakeUpTime,
      dinnerTime: p.dinnerTime ?? p?.habits?.dinnerTime,
      dailyWaterMl: p.dailyWaterMl ?? p?.habits?.dailyWaterMl,
      wantReminders: p.wantReminders ?? p?.habits?.wantReminders,
      trackActivity: p.trackActivity ?? p?.habits?.trackActivity,
      connectHealthApp: p.connectHealthApp ?? p?.habits?.connectHealthApp,
      theme: p.theme,
    };

    // Derive targetWeight from simple goal strings if provided by legacy clients
    if (!answers.targetWeightKg && typeof p.goal === 'string' && typeof answers.currentWeightKg === 'number') {
      const w = answers.currentWeightKg;
      if (/lose/i.test(p.goal)) answers.targetWeightKg = w - 5;
      else if (/gain|muscle/i.test(p.goal)) answers.targetWeightKg = w + 3;
      else answers.targetWeightKg = w;
    }

    return answers;
  }

  /**
   * POST /quiz/preview
   * Анонимный preview — сохраняем черновик для авторизованного пользователя, если токен есть
   */
  @Post('preview')
  @ApiOperation({
    summary: 'Anonymous quiz preview',
    description: 'Returns normalized preview and persists draft for authenticated users'
  })
  @ApiOkResponse({ description: 'Preview calculated/saved successfully' })
  async preview(@Body() dto: any, @CurrentUser() user?: any) {
    // If authenticated, persist a draft (non-fatal)
    if (user?.userId) {
      try {
        await this.quizProfileService.submitQuiz(user.userId, {
          clientId: dto.clientId ?? 'anonymous',
          version: dto.version ?? 1,
          answers: dto.answers ?? dto,
          overwrite: false,
        });
      } catch {}
    }
    // Always compute full preview using legacy calculator
    const answers = this.mapAnyToQuizAnswers(dto?.answers ?? dto);
    const result = this.legacyQuizService.calculateQuizResult(answers);
    return {
      bmr: result.bmr,
      tdee: result.tdee,
      bmi: result.bmi,
      macros: result.macros,
      recommendations: [result.advice],
      goal: result.goal,
      savedAt: new Date().toISOString(),
    };
  }

  /**
   * GET /quiz/preview
   * Возвращаем сохранённый превью для авторизованного пользователя
   */
  @Get('preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved preview for current user' })
  async getPreview(@CurrentUser() user: CurrentUserPayload) {
    const profile = await this.quizProfileService.getQuizProfile(user.userId).catch(() => null);
    if (!profile) return {};
    return {
      clientId: undefined,
      version: profile.version,
      answers: profile.answers,
      savedAt: profile.updatedAt
    };
  }

  /**
   * POST /quiz/submit
   * Submit quiz answers and save to QuizProfile
   * Idempotent - can be called multiple times
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Submit quiz and save to profile',
    description: 'Create or update QuizProfile with normalized data. Idempotent operation.' 
  })
  @ApiOkResponse({ description: 'Quiz profile created/updated successfully' })
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizProfileService.submitQuiz(user.userId, dto);
  }

  /**
   * GET /quiz/profile
   * Get user's complete quiz profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user quiz profile',
    description: 'Returns complete QuizProfile with all answers and normalized fields' 
  })
  @ApiOkResponse({ description: 'Quiz profile retrieved successfully' })
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.quizProfileService.getQuizProfile(user.userId);
  }

  /**
   * PATCH /quiz/profile
   * Partially update quiz profile
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update quiz profile',
    description: 'Partially update QuizProfile answers. Merges with existing data.' 
  })
  @ApiOkResponse({ description: 'Quiz profile updated successfully' })
  async updateProfile(
    @Body() dto: UpdateQuizProfileDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quizProfileService.updateQuizProfile(user.userId, dto);
  }

  /**
   * POST /quiz/capture-email
   * Anonymous email capture for midpoint/exit-intent
   */
  @Post('capture-email')
  @ApiOperation({
    summary: 'Capture email for quiz progress save',
    description: 'Save email for guest users to resume quiz later. Non-fatal endpoint.'
  })
  @ApiOkResponse({ description: 'Email captured successfully' })
  async captureEmail(@Body() dto: { email: string; clientId?: string; step?: number; type?: 'midpoint' | 'exit' }) {
    // TODO: Implement email capture logic (e.g., save to LeadCapture table, send reminder email)
    // For now, just log and return success
    console.log('[Quiz] Email captured:', { email: dto.email, clientId: dto.clientId, step: dto.step, type: dto.type });
    return { ok: true, message: 'Email saved successfully' };
  }
}
