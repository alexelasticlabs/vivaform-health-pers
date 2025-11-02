import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import { DailyOverviewQueryDto } from "./dto/daily-overview-query.dto";
import { DashboardService } from "./dashboard.service";

@ApiTags("dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("daily")
  @ApiOperation({ summary: "Ежедневный обзор показателей" })
  getDaily(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyOverviewQueryDto) {
    return this.dashboardService.getDailyOverview(user.userId, query);
  }
}