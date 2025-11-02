import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { CreateNutritionEntryDto, DailyQueryDto } from "./dto/create-nutrition-entry.dto";
import { NutritionService } from "./nutrition.service";

@ApiTags("nutrition")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("nutrition")
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

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
}