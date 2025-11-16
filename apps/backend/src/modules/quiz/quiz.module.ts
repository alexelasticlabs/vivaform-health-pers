import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizService as QuizProfileService } from './services/quiz-profile.service';
import { QuizLeadService } from './services/quiz-lead.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController],
  providers: [
    QuizService, // Legacy service for old Profile model
    QuizProfileService, // New service for QuizProfile model
    QuizLeadService,
  ],
  exports: [QuizService, QuizProfileService, QuizLeadService],
})
export class QuizModule {}
