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
import { buildLegacyQuizAnswers } from './utils/answer-normalizer';
import type { CaptureQuizEmailDto } from './dto/capture-email.dto';
import { QuizLeadService } from './services/quiz-lead.service';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(
    private quizProfileService: QuizProfileService,
    private legacyQuizService: LegacyQuizService,
    private quizLeadService: QuizLeadService,
  ) {}

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
    const answers = buildLegacyQuizAnswers(dto?.answers ?? dto);
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
  async captureEmail(@Body() dto: CaptureQuizEmailDto, @CurrentUser() user?: CurrentUserPayload) {
    const result = await this.quizLeadService.captureLead(dto, user?.userId);
    return {
      ok: true,
      leadId: result.leadId,
      savedAt: result.savedAt,
      message: 'Email saved successfully',
    };
  }
}
