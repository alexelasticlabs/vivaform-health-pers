import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { appConfig, jwtConfig, stripeConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { HealthModule } from './modules/health/health.module';

// Облегчённый модуль для e2e: без Cron/Schedule, Notifications, Articles, Stripe webhooks и пр.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, jwtConfig, stripeConfig] }),
    PrismaModule,
    UsersModule,
    AuthModule,
    QuizModule,
    SubscriptionsModule,
    HealthModule,
  ],
})
export class AppE2eModule {}

