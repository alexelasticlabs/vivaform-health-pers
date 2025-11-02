import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { CreateWeightEntryDto, WeightQueryDto } from "./dto/create-weight-entry.dto";
import { WeightService } from "./weight.service";

@ApiTags("weight")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("weight")
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Post()
  @ApiOperation({ summary: "Добавить запись веса" })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateWeightEntryDto) {
    return this.weightService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "История веса" })
  async history(@CurrentUser() user: CurrentUserPayload, @Query() query: WeightQueryDto) {
    const entries = await this.weightService.getHistory(user.userId, query);
    return entries.reverse();
  }

  @Get("latest")
  @ApiOperation({ summary: "Последняя запись веса" })
  latest(@CurrentUser() user: CurrentUserPayload) {
    return this.weightService.getLatest(user.userId);
  }

  @Get("progress")
  @ApiOperation({ summary: "Прогресс веса за период" })
  progress(@CurrentUser() user: CurrentUserPayload, @Query() query: WeightQueryDto) {
    return this.weightService.getProgress(user.userId, query);
  }
}