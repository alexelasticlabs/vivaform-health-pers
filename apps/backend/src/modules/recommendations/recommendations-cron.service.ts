import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { RecommendationsGeneratorService } from "./recommendations-generator.service";

/**
 * RecommendationsCronService
 *
 * Автоматическая генерация персональных рекомендаций по расписанию.
 * Запускается каждый день в 6:00 утра для всех пользователей с профилями.
 */
@Injectable()
export class RecommendationsCronService {
  private readonly logger = new Logger(RecommendationsCronService.name);

  constructor(private readonly generatorService: RecommendationsGeneratorService) {}

  /**
   * Генерация рекомендаций для всех пользователей
   * Выполняется каждый день в 6:00 утра
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    name: "generate-daily-recommendations",
    timeZone: "Europe/Moscow"
  })
  async handleDailyRecommendations() {
    this.logger.log("Starting daily recommendations generation...");

    try {
      const startTime = Date.now();
      const usersProcessed = await this.generatorService.generateForAllUsers();
      const duration = Date.now() - startTime;

      this.logger.log(
        `Daily recommendations generation completed. ` +
          `Processed ${usersProcessed} users in ${duration}ms`
      );
    } catch (error) {
      this.logger.error(
        "Failed to generate daily recommendations",
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Тестовый метод для ручной генерации (можно вызвать через контроллер)
   */
  async triggerManualGeneration(): Promise<number> {
    this.logger.log("Manual recommendations generation triggered");
    return this.generatorService.generateForAllUsers();
  }
}
