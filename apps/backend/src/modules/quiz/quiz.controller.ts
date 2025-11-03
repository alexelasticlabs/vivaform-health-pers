import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { SubmitQuizResponse } from '@vivaform/shared';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * POST /quiz/preview
   * Preview quiz results without authentication
   * For marketing funnel - does not save to profile
   */
  @Post('preview')
  @ApiOperation({ 
    summary: 'Preview quiz results (anonymous)',
    description: 'Calculate personalized recommendations without saving to profile. Use this for marketing funnel.' 
  })
  async previewQuiz(
    @Body() dto: SubmitQuizDto,
  ): Promise<SubmitQuizResponse> {
    const result = await this.quizService.submitQuiz(dto as any);

    return {
      result,
      message: 'Quiz results calculated. Sign up to save your personalized plan!',
    };
  }

  /**
   * POST /quiz/submit
   * Submit quiz answers and save to profile (requires authentication)
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Submit quiz and save to profile (authenticated)',
    description: 'Calculate and save personalized recommendations to user profile.' 
  })
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @Request() req: any,
  ): Promise<SubmitQuizResponse> {
    const userId = req.user.userId;
    const result = await this.quizService.submitQuiz(dto as any, userId);

    return {
      result,
      message: 'Quiz submitted and saved to your profile',
    };
  }
}
