import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../common/prisma/prisma.service';

export enum AuditAction {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TEMP_PASSWORD_REQUESTED = 'TEMP_PASSWORD_REQUESTED',
  
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  SUBSCRIPTION_UPGRADED = 'SUBSCRIPTION_UPGRADED',
  SUBSCRIPTION_DOWNGRADED = 'SUBSCRIPTION_DOWNGRADED',
  
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  DATA_EXPORTED = 'DATA_EXPORTED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',

  PREMIUM_PAGE_VIEW = 'PREMIUM_PAGE_VIEW'
}

interface AuditLogDto {
  userId?: string;
  action: AuditAction;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * AuditService
 * 
 * Логирование критичных действий пользователей для безопасности и GDPR compliance.
 * Храним логи в базе данных и выводим в structured logging для Sentry/CloudWatch.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать запись в audit log
   */
  async log(dto: AuditLogDto): Promise<void> {
    try {
      // Structured logging для Sentry/monitoring
      this.logger.log({
        message: `Audit: ${dto.action}`,
        userId: dto.userId,
        action: dto.action,
        metadata: dto.metadata,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        timestamp: new Date().toISOString()
      });

      // Сохранение в БД
      await (this.prisma as any).auditLog.create({
        data: {
          userId: dto.userId || null,
          action: dto.action,
          metadata: dto.metadata ? (dto.metadata as unknown as any) : undefined,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent
        }
      });
    } catch (error) {
      // Не бросаем ошибку, чтобы не блокировать основной поток
      this.logger.error(`Failed to write audit log: ${dto.action}`, error);
    }
  }

  /**
   * Логирование входа пользователя
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.USER_LOGIN,
      ipAddress,
      userAgent
    });
  }

  /**
   * Логирование регистрации
   */
  async logRegistration(userId: string, email: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.USER_REGISTERED,
      metadata: { email },
      ipAddress
    });
  }

  /**
   * Логирование изменения подписки
   */
  async logSubscriptionChange(
    userId: string,
    action: AuditAction,
    metadata: { subscriptionId?: string; priceId?: string; tier?: string; amount?: number; currency?: string }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      metadata
    });
  }

  /**
   * Логирование платежа
   */
  async logPayment(
    userId: string,
    success: boolean,
    metadata: { amount?: number; currency?: string; invoiceId?: string }
  ): Promise<void> {
    await this.log({
      userId,
      action: success ? AuditAction.PAYMENT_SUCCEEDED : AuditAction.PAYMENT_FAILED,
      metadata
    });
  }

  /**
   * Логирование экспорта данных (GDPR)
   */
  async logDataExport(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.DATA_EXPORTED,
      ipAddress
    });
  }

  /**
   * Логирование удаления аккаунта
   */
  async logAccountDeletion(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.ACCOUNT_DELETED,
      ipAddress
    });
  }

  /**
   * Логирование запроса на сброс пароля
   */
  async logPasswordResetRequest(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      ipAddress
    });
  }

  /**
   * Логирование успешного сброса пароля
   */
  async logPasswordReset(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_RESET,
      ipAddress
    });
  }

  /**
   * Логирование запроса временного пароля
   */
  async logTempPasswordRequest(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TEMP_PASSWORD_REQUESTED,
      ipAddress
    });
  }

  /**
   * Логирование изменения пароля
   */
  async logPasswordChange(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGED,
      ipAddress
    });
  }

  /**
   * Логирование посещения премиум страницы
   */
  async logPremiumPageView(userId?: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId: userId || undefined,
      action: AuditAction.PREMIUM_PAGE_VIEW,
      metadata: { event: 'PREMIUM_PAGE_VIEW' },
      ipAddress
    });
  }
}
