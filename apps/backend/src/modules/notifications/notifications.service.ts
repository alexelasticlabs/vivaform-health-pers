import { Injectable, Logger } from "@nestjs/common";
import { Expo } from "expo-server-sdk";
import type { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";

interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * NotificationsService
 *
 * Отправка push-уведомлений пользователям через Expo Push Notifications.
 * Поддерживает индивидуальные и массовые рассылки.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  /**
   * Регистрация Push Token пользователя
   */
  async registerPushToken(userId: string, pushToken: string): Promise<void> {
    // Validate token format
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken }
    });

    this.logger.log(`Registered push token for user ${userId}`);
  }

  /**
   * Отправка уведомления конкретному пользователю
   */
  async sendToUser(dto: SendNotificationDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { pushToken: true }
    });

    if (!user?.pushToken) {
      this.logger.warn(`User ${dto.userId} has no push token registered`);
      return;
    }

    await this.sendPushNotifications([
      {
        to: user.pushToken,
        title: dto.title,
        body: dto.body,
        data: dto.data,
        sound: "default",
        badge: 1
      }
    ]);
  }

  /**
   * Массовая рассылка уведомлений всем пользователям с включёнными напоминаниями
   */
  async sendToAllWithReminders(title: string, body: string, data?: Record<string, any>): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: {
        pushToken: { not: null },
        profile: {
          wantReminders: true
        }
      },
      select: { id: true, pushToken: true }
    });

    if (users.length === 0) {
      this.logger.log("No users with push tokens and reminders enabled");
      return;
    }

    const messages: ExpoPushMessage[] = users
      .filter((user) => user.pushToken && Expo.isExpoPushToken(user.pushToken))
      .map((user) => ({
        to: user.pushToken!,
        title,
        body,
        data,
        sound: "default",
        badge: 1
      }));

    await this.sendPushNotifications(messages);
    this.logger.log(`Sent notifications to ${messages.length} users`);
  }

  /**
   * Отправка напоминания о воде конкретному пользователю
   */
  async sendWaterReminder(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            wantReminders: true,
            dailyWaterMl: true
          }
        }
      }
    });

    if (!user?.profile?.wantReminders || !user.pushToken) {
      return;
    }

    const waterGoal = user.profile.dailyWaterMl || 2000;
    const glassesNeeded = Math.ceil(waterGoal / 250);

    await this.sendToUser({
      userId,
      title: "💧 Time to drink water!",
      body: `Don't forget to drink a glass of water. Goal: ${glassesNeeded} glasses per day`,
      data: { type: "water_reminder", waterGoalMl: waterGoal }
    });
  }

  /**
   * Отправка напоминания о взвешивании
   */
  async sendWeightTrackingReminder(userId: string): Promise<void> {
    await this.sendToUser({
      userId,
      title: "⚖️ Time to weigh yourself!",
      body: "Track your progress — record your current weight",
      data: { type: "weight_reminder" }
    });
  }

  /**
   * Отправка напоминания о приёме пищи
   */
  async sendMealReminder(userId: string, mealType: string): Promise<void> {
    const mealEmojis: Record<string, string> = {
      breakfast: "🍳",
      lunch: "🥗",
      dinner: "🍽️",
      snack: "🍎"
    };

    const emoji = mealEmojis[mealType.toLowerCase()] || "🍴";

    await this.sendToUser({
      userId,
      title: `${emoji} Time for ${mealType}`,
      body: "Don't forget to log your meal for accurate tracking",
      data: { type: "meal_reminder", mealType }
    });
  }

  /**
   * Отправка уведомления о новых рекомендациях
   */
  async sendRecommendationsNotification(userId: string, count: number): Promise<void> {
    await this.sendToUser({
      userId,
      title: "✨ New recommendations!",
      body: `You have ${count} new ${count === 1 ? 'recommendation' : 'recommendations'}`,
      data: { type: "new_recommendations", count }
    });
  }

  /**
   * Низкоуровневая отправка push-уведомлений через Expo API
   * Включает retry-логику и детальное логирование ошибок
   */
  private async sendPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
    // Разбиваем на чанки (Expo рекомендует до 100 за раз)
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await this.sendChunkWithRetry(chunk, 3);
    }
  }

  /**
   * Отправка чанка с retry-логикой
   */
  private async sendChunkWithRetry(chunk: ExpoPushMessage[], maxRetries: number): Promise<void> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        this.handlePushTickets(tickets, chunk);
        return; // Success
      } catch (error) {
        attempt++;
        this.logger.error(
          `Failed to send push notifications (attempt ${attempt}/${maxRetries})`,
          error instanceof Error ? error.stack : String(error)
        );

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    this.logger.error(`Failed to send push notification chunk after ${maxRetries} attempts`);
  }

  /**
   * Обработка результатов отправки с логированием проблемных токенов
   */
  private handlePushTickets(tickets: ExpoPushTicket[], messages: ExpoPushMessage[]): void {
    tickets.forEach((ticket, index) => {
      if (ticket.status === "error") {
        const pushToken = messages[index]?.to;
        
        this.logger.error(
          `Push notification error for token ${pushToken}: ${ticket.message}`,
          ticket.details ? JSON.stringify(ticket.details) : undefined
        );

        // Если токен невалидный - логируем для дальнейшей очистки
        if (ticket.details?.error === 'DeviceNotRegistered') {
          this.logger.warn(`Token ${pushToken} is no longer valid - should be removed from database`);
        }
      }
    });
  }

  /**
   * Вспомогательная функция для склонения слов
   */
  private pluralize(count: number, one: string, few: string, many: string): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    }
    return many;
  }
}
