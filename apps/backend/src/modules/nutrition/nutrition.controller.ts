import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PrismaService } from "../../common/prisma/prisma.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { CreateNutritionEntryDto, DailyQueryDto } from "./dto/create-nutrition-entry.dto";
import { MealPlanService } from "./meal-plan.service";
import { NutritionService } from "./nutrition.service";

@ApiTags("nutrition")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("nutrition")
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly mealPlanService: MealPlanService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @ApiOperation({ summary: "Добавить приём пищи" })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateNutritionEntryDto) {
    return this.nutritionService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Получить дневник питания за день" })
  findDaily(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyQueryDto) {
    return this.nutritionService.findDaily(user.userId, query.date);
  }

  @Get("summary")
  @ApiOperation({ summary: "Суммарная калорийность и БЖУ за день" })
  getSummary(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyQueryDto) {
    return this.nutritionService.getDailySummary(user.userId, query.date);
  }

  @Get("meal-plan")
  @ApiOperation({ summary: "Генерация персонального плана питания (PREMIUM)" })
  async getMealPlan(@CurrentUser() user: CurrentUserPayload) {
    // Premium gate: проверяем tier пользователя
    const userWithTier = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { tier: true }
    });

    if (!userWithTier || userWithTier.tier !== "PREMIUM") {
      throw new BadRequestException(
        "Meal planner is a premium feature. Please upgrade to access personalized meal plans."
      );
    }

    // Генерируем план питания на основе данных квиза
    return this.mealPlanService.generateWeeklyPlan(user.userId);
  }
}