import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import type { SubmitQuizResponse } from '@vivaform/shared';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * POST /quiz/submit
   * Submit quiz answers (public or authenticated)
   * If authenticated, save to user profile
   */
  @Post('submit')
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @Request() req?: any,
  ): Promise<SubmitQuizResponse> {
    const userId = req?.user?.id; // Optional auth
    const result = await this.quizService.submitQuiz(dto as any, userId);

    return {
      result,
      message: userId
        ? 'Quiz submitted and saved to your profile'
        : 'Quiz results calculated',
    };
  }
}
