import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

import { HealthService } from "./health.service";

@SkipThrottle()
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Проверить статус API" })
  async getHealth() {
    return this.healthService.getStatus();
  }

  @Get("metrics")
  @ApiOperation({ summary: "Получить метрики приложения" })
  async getMetrics() {
    return this.healthService.getMetrics();
  }
}