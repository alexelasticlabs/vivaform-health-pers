import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import { PrismaModule } from "./common/prisma/prisma.module";
import { appConfig, jwtConfig, stripeConfig } from "./config";
import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";
import { UsersModule } from "./modules/users/users.module";
import { WaterModule } from "./modules/water/water.module";
import { WeightModule } from "./modules/weight/weight.module";
import { StripeModule } from "./modules/stripe/stripe.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, stripeConfig]
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 120 }]),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    NutritionModule,
    WaterModule,
    WeightModule,
    RecommendationsModule,
    StripeModule,
    SubscriptionsModule,
    DashboardModule
  ]
})
export class AppModule {}
