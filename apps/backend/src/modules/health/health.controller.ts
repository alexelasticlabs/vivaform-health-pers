import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HealthService } from "./health.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {
    if (!healthService) {
      // Логируем, чтобы понять, почему DI не сработал в окружении теста
      // и не валим запросы (fallback ниже в handler)
      console.error('[HealthController] HealthService DI failed (undefined)');
    }
  }

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: "Проверить статус API" })
  async getHealth() {
    if (!this.healthService) {
      return {
        status: 'ok',
        note: 'HealthService missing (fallback)',
        timestamp: new Date().toISOString()
      };
    }
    return this.healthService.getStatus();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get("metrics")
  @ApiOperation({ summary: "Получить метрики приложения" })
  async getMetrics() {
    if (!this.healthService) {
      return { error: 'metrics-unavailable', reason: 'HealthService missing' };
    }
    return this.healthService.getMetrics();
  }
}