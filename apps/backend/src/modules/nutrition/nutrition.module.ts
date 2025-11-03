import { Module } from "@nestjs/common";

import { FoodController } from "./food.controller";
import { FoodService } from "./food.service";
import { MealPlanService } from "./meal-plan.service";
import { NutritionController } from "./nutrition.controller";
import { NutritionService } from "./nutrition.service";

@Module({
  controllers: [NutritionController, FoodController],
  providers: [NutritionService, MealPlanService, FoodService],
  exports: [NutritionService, MealPlanService, FoodService]
})
export class NutritionModule {}
