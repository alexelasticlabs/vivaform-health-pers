import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './common/prisma/prisma.module';
import { appConfig, jwtConfig, stripeConfig } from './config';
import { UsersModule } from './modules/users/users.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { HealthModule } from './modules/health/health.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { UsersService } from './modules/users/users.service';
import { EmailService } from './modules/email/email.service';
import { AuditModule } from './modules/audit/audit.module';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from './modules/auth/strategies/local.strategy';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';

// Облегчённый модуль для e2e: без Cron/Schedule, Notifications, Articles, Stripe webhooks и пр.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, jwtConfig, stripeConfig] }),
    PrismaModule,
    UsersModule,
    // Лёгкая регистрация JWT для тестов
    JwtModule.register({ secret: process.env.JWT_SECRET || 'test-secret', signOptions: { expiresIn: '900s' } }),
    EmailModule,
    AuditModule,
    QuizModule,
    HealthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, EmailService, JwtStrategy, LocalStrategy],
})
export class AppE2eModule {}
