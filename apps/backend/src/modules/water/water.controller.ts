import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateWaterEntryDto, DailyWaterQueryDto } from "./dto/create-water-entry.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { WaterService } from "./water.service";

@ApiTags("water")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("water")
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Post()
  @ApiOperation({ summary: "Добавить запись по воде" })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateWaterEntryDto) {
    return this.waterService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Получить записи потребления воды" })
  findDaily(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyWaterQueryDto) {
    return this.waterService.findDaily(user.userId, query.date);
  }

  @Get("total")
  @ApiOperation({ summary: "Объём воды за день" })
  async getTotal(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyWaterQueryDto) {
    const totalMl = await this.waterService.getDailyTotal(user.userId, query.date);
    return { totalMl };
  }
}