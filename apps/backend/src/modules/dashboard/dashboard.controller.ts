import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DailyOverviewQueryDto } from "./dto/daily-overview-query.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DashboardService } from "./dashboard.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { DashboardV2Service } from "./dashboard-v2.service";

@ApiTags("dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardV2Service: DashboardV2Service,
  ) {}

  @Get("daily")
  @ApiOperation({ summary: "Ежедневный обзор показателей" })
  getDaily(@CurrentUser() user: CurrentUserPayload, @Query() query: DailyOverviewQueryDto) {
    return this.dashboardService.getDailyOverview(user.userId, query);
  }

  @Get("v2/daily")
  @ApiOperation({ summary: "Dashboard V2 - Comprehensive daily overview with health score, achievements, and insights" })
  getDailyV2(
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') date?: string,
  ) {
    return this.dashboardV2Service.getDailyDashboard(user.userId, date);
  }
}