import { Controller, Post, Body, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import type { SubmitQuizResponse } from '@vivaform/shared';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * POST /quiz/submit
   * Submit quiz answers (anonymous or authenticated)
   * Saves to profile if user is logged in
   */
  @Post('submit')
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @Request() req?: any,
  ): Promise<SubmitQuizResponse> {
    const userId = req?.user?.userId; // Optional auth
    const result = await this.quizService.submitQuiz(dto as any, userId);

    return {
      result,
      message: userId
        ? 'Quiz submitted and saved to your profile'
        : 'Quiz results calculated',
    };
  }
}
