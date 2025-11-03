import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import {
  CreateRecommendationDto,
  LatestRecommendationsQueryDto,
  RecommendationsQueryDto
} from "./dto/create-recommendation.dto";
import { RecommendationsGeneratorService } from "./recommendations-generator.service";
import { RecommendationsService } from "./recommendations.service";

@ApiTags("recommendations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("recommendations")
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly generatorService: RecommendationsGeneratorService
  ) {}

  @Post()
  @ApiOperation({ summary: "Добавить рекомендацию" })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Рекомендации за день" })
  findDaily(@CurrentUser() user: CurrentUserPayload, @Query() query: RecommendationsQueryDto) {
    return this.recommendationsService.findDaily(user.userId, query.date);
  }

  @Get("latest")
  @ApiOperation({ summary: "Последние рекомендации" })
  findLatest(@CurrentUser() user: CurrentUserPayload, @Query() query: LatestRecommendationsQueryDto) {
    return this.recommendationsService.findLatest(user.userId, query.limit);
  }

  @Post("generate")
  @ApiOperation({ summary: "Сгенерировать персональные рекомендации" })
  async generate(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.generatorService.generateForUser(user.userId);
    return {
      message: `Generated ${count} recommendations`,
      count
    };
  }
}