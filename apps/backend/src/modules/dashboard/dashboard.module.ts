import { Module } from "@nestjs/common";

import { NutritionModule } from "../nutrition/nutrition.module";
import { RecommendationsModule } from "../recommendations/recommendations.module";
import { WaterModule } from "../water/water.module";
import { WeightModule } from "../weight/weight.module";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [NutritionModule, WaterModule, WeightModule, RecommendationsModule, PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}