import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { SubmitQuizResponse } from '@vivaform/shared';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * POST /quiz/submit
   * Submit quiz answers (requires authentication)
   * Saves to user profile
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @Request() req: any,
  ): Promise<SubmitQuizResponse> {
    const userId = req.user.userId; // Required auth
    const result = await this.quizService.submitQuiz(dto as any, userId);

    return {
      result,
      message: userId
        ? 'Quiz submitted and saved to your profile'
        : 'Quiz results calculated',
    };
  }
}
