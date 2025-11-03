import { Module } from "@nestjs/common";

import { NotificationsModule } from "../notifications/notifications.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { WaterModule } from "../water/water.module";
import { WeightModule } from "../weight/weight.module";
import { RecommendationsController } from "./recommendations.controller";
import { RecommendationsCronService } from "./recommendations-cron.service";
import { RecommendationsGeneratorService } from "./recommendations-generator.service";
import { RecommendationsService } from "./recommendations.service";

@Module({
  imports: [NutritionModule, WaterModule, WeightModule, NotificationsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsGeneratorService, RecommendationsCronService],
  exports: [RecommendationsService, RecommendationsGeneratorService]
})
export class RecommendationsModule {}
