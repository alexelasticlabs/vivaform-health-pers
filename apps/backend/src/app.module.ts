import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_GUARD } from "@nestjs/core";
import { Controller, Get, Res, Req } from '@nestjs/common';

import { PrismaModule } from "./common/prisma/prisma.module";
import { appConfig, jwtConfig, stripeConfig } from "./config";
import { AdminModule } from "./modules/admin/admin.module";
import { ArticleModule } from "./modules/articles/article.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";
import { UsersModule } from "./modules/users/users.module";
import { WaterModule } from "./modules/water/water.module";
import { WeightModule } from "./modules/weight/weight.module";
import { StripeModule } from "./modules/stripe/stripe.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { QuizModule } from "./modules/quiz/quiz.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { BusinessMetricsService } from './common/metrics/business-metrics.service';

@Controller('health')
class HealthController {
  @Get()
  get() {
    return { status: 'ok', ts: Date.now() };
  }
}

@Controller('metrics')
class MetricsController {
  private readonly prom: any;
  constructor() {
    // Lazy require to avoid TS type issues
    this.prom = require('prom-client');
    try { this.prom.collectDefaultMetrics(); } catch {}
  }

  @Get()
  async get(@Res() res: any, @Req() req: any) {
    // Защита internal endpoint через секретный заголовок
    const secret = process.env.METRICS_SECRET || 'dev-metrics-secret';
    const provided = req.headers['x-internal-key'];

    if (process.env.NODE_ENV === 'production' && provided !== secret) {
      res.status(403).send('Forbidden');
      return;
    }

    res.setHeader('Content-Type', this.prom.register.contentType);
    res.send(await this.prom.register.metrics());
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, stripeConfig]
    }),
    // Rate limiting: 10 requests per 10 seconds per user
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 5    // 5 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20   // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100  // 100 requests per minute
      }
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AdminModule,
    ArticleModule,
    AuditModule,
    HealthModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
    NutritionModule,
    WaterModule,
    WeightModule,
    RecommendationsModule,
    StripeModule,
    SubscriptionsModule,
    QuizModule,
    WebhooksModule,
    DashboardModule
  ],
  controllers: [
    HealthController,
    MetricsController
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    BusinessMetricsService
  ]
})
export class AppModule {}
