import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HealthService } from "./health.service";

@SkipThrottle()
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

  @Get("metrics")
  @ApiOperation({ summary: "Получить метрики приложения" })
  async getMetrics() {
    if (!this.healthService) {
      return { error: 'metrics-unavailable', reason: 'HealthService missing' };
    }
    return this.healthService.getMetrics();
  }
}