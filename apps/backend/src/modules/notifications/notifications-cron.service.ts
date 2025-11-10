import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NotificationsService } from "./notifications.service";

/**
 * NotificationsCronService
 *
 * Автоматическая отправка напоминаний по расписанию:
 * - Вода: каждые 2 часа (9:00 - 21:00)
 * - Взвешивание: по понедельникам в 8:00
 * - Приёмы пищи: на основе wakeUpTime и dinnerTime из профиля
 */
@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Напоминания о воде каждые 2 часа (9:00, 11:00, 13:00, 15:00, 17:00, 19:00, 21:00)
   */
  @Cron("0 9,11,13,15,17,19,21 * * *", {
    name: "water-reminders",
    timeZone: "Europe/Moscow"
  })
  async sendWaterReminders() {
    this.logger.log("Sending water reminders...");

    try {
      const users = await this.prisma.user.findMany({
        where: {
          pushToken: { not: null },
          profile: {
            wantReminders: true
          }
        },
        select: { id: true }
      });

      let sentCount = 0;
      for (const user of users) {
        try {
          await this.notificationsService.sendWaterReminder(user.id);
          sentCount++;
        } catch (error) {
          this.logger.error(`Failed to send water reminder to user ${user.id}`, error instanceof Error ? error.stack : String(error));
        }
      }

      this.logger.log(`Water reminders sent to ${sentCount}/${users.length} users`);
    } catch (error) {
      this.logger.error("Failed to send water reminders", error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Напоминание о взвешивании каждый понедельник в 8:00
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_8AM, {
    name: "weight-tracking-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendWeightTrackingReminders() {
    this.logger.log("Sending weight tracking reminders...");

    try {
      const users = await this.prisma.user.findMany({
        where: {
          pushToken: { not: null },
          profile: {
            wantReminders: true
          }
        },
        select: { id: true }
      });

      let sentCount = 0;
      for (const user of users) {
        try {
          await this.notificationsService.sendWeightTrackingReminder(user.id);
          sentCount++;
        } catch (error) {
          this.logger.error(`Failed to send weight reminder to user ${user.id}`, error instanceof Error ? error.stack : String(error));
        }
      }

      this.logger.log(`Weight tracking reminders sent to ${sentCount}/${users.length} users`);
    } catch (error) {
      this.logger.error("Failed to send weight tracking reminders", error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Напоминание о завтраке в 8:00
   */
  @Cron("0 8 * * *", {
    name: "breakfast-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendBreakfastReminders() {
    await this.sendMealReminderToAll("breakfast");
  }

  /**
   * Напоминание об обеде в 13:00
   */
  @Cron("0 13 * * *", {
    name: "lunch-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendLunchReminders() {
    await this.sendMealReminderToAll("lunch");
  }

  /**
   * Напоминание об ужине в 19:00
   */
  @Cron("0 19 * * *", {
    name: "dinner-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendDinnerReminders() {
    await this.sendMealReminderToAll("dinner");
  }

  /**
   * Вспомогательный метод для массовой рассылки напоминаний о приёмах пищи
   */
  private async sendMealReminderToAll(mealType: string) {
    this.logger.log(`Sending ${mealType} reminders...`);

    try {
      const users = await this.prisma.user.findMany({
        where: {
          pushToken: { not: null },
          profile: {
            wantReminders: true
          }
        },
        select: { id: true }
      });

      let sentCount = 0;
      for (const user of users) {
        try {
          await this.notificationsService.sendMealReminder(user.id, mealType);
          sentCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send ${mealType} reminder to user ${user.id}`,
            error instanceof Error ? error.stack : String(error)
          );
        }
      }

      this.logger.log(`${mealType} reminders sent to ${sentCount}/${users.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send ${mealType} reminders`, error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Ночной job для очистки невалидных токенов раз в сутки
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: "cleanup-invalid-push-tokens",
    timeZone: "Europe/Moscow"
  })
  async cleanupInvalidTokens() {
    try {
      const removed = await this.notificationsService.cleanupInvalidTokens();
      this.logger.log(`Invalid push tokens cleanup removed: ${removed}`);
    } catch (error) {
      this.logger.error("Failed to cleanup invalid push tokens", error instanceof Error ? error.stack : String(error));
    }
  }
}
