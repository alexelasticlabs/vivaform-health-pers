import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "./common/prisma/prisma.module";
import { appConfig, jwtConfig, stripeConfig } from "./config";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, stripeConfig]
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
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
  ]
})
export class AppModule {}
