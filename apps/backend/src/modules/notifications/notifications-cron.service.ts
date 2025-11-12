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
  private readonly prom: any = require('prom-client');
  private readonly jobCounter = new this.prom.Counter({ name: 'cron_notifications_jobs_total', help: 'Notifications cron jobs total', labelNames: ['job','status'] as const });
  private readonly jobDuration = new this.prom.Histogram({ name: 'cron_notifications_job_duration_ms', help: 'Duration of notifications cron jobs', labelNames: ['job'] as const });

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
    const endTimer = this.jobDuration.startTimer({ job: 'water' } as any);
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
      this.jobCounter.inc({ job: 'water', status: 'success' } as any);
    } catch (error) {
      this.jobCounter.inc({ job: 'water', status: 'error' } as any);
      this.logger.error("Failed to send water reminders", error instanceof Error ? error.stack : String(error));
    } finally {
      endTimer();
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
    const endTimer = this.jobDuration.startTimer({ job: 'weight' } as any);
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
      this.jobCounter.inc({ job: 'weight', status: 'success' } as any);
    } catch (error) {
      this.jobCounter.inc({ job: 'weight', status: 'error' } as any);
      this.logger.error("Failed to send weight tracking reminders", error instanceof Error ? error.stack : String(error));
    } finally {
      endTimer();
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
    const endTimer = this.jobDuration.startTimer({ job: 'breakfast' } as any);
    try { await this.sendMealReminderToAll("breakfast"); this.jobCounter.inc({ job: 'breakfast', status: 'success' } as any);} catch { this.jobCounter.inc({ job: 'breakfast', status: 'error' } as any);} finally { endTimer(); }
  }

  /**
   * Напоминание об обеде в 13:00
   */
  @Cron("0 13 * * *", {
    name: "lunch-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendLunchReminders() {
    const endTimer = this.jobDuration.startTimer({ job: 'lunch' } as any);
    try { await this.sendMealReminderToAll("lunch"); this.jobCounter.inc({ job: 'lunch', status: 'success' } as any);} catch { this.jobCounter.inc({ job: 'lunch', status: 'error' } as any);} finally { endTimer(); }
  }

  /**
   * Напоминание об ужине в 19:00
   */
  @Cron("0 19 * * *", {
    name: "dinner-reminder",
    timeZone: "Europe/Moscow"
  })
  async sendDinnerReminders() {
    const endTimer = this.jobDuration.startTimer({ job: 'dinner' } as any);
    try { await this.sendMealReminderToAll("dinner"); this.jobCounter.inc({ job: 'dinner', status: 'success' } as any);} catch { this.jobCounter.inc({ job: 'dinner', status: 'error' } as any);} finally { endTimer(); }
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
    const endTimer = this.jobDuration.startTimer({ job: 'cleanup' } as any);
    try {
      const removed = await this.notificationsService.cleanupInvalidTokens();
      this.logger.log(`Invalid push tokens cleanup removed: ${removed}`);
      this.jobCounter.inc({ job: 'cleanup', status: 'success' } as any);
    } catch (error) {
      this.jobCounter.inc({ job: 'cleanup', status: 'error' } as any);
      this.logger.error("Failed to cleanup invalid push tokens", error instanceof Error ? error.stack : String(error));
    } finally {
      endTimer();
    }
  }
}
