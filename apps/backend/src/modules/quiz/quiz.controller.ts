import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { QuizService as QuizProfileService } from './services/quiz-profile.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SubmitQuizDto, UpdateQuizProfileDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserPayload } from '../../common/types/current-user';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private quizProfileService: QuizProfileService) {}

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
}
