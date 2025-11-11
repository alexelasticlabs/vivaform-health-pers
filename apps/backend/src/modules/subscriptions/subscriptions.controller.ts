import { Body, Controller, Get, Post, Req, UseGuards, SetMetadata } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SubscriptionsService } from "./subscriptions.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService } from "../audit/audit.service";
import { StripeSubscriptionGuard, PREMIUM_ONLY_KEY } from "../../common/middleware/stripe-subscription.guard";
import type { CreateCheckoutSessionDto, CreatePortalSessionDto } from "./dto/create-checkout-session.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SyncCheckoutSessionDto } from './dto/sync-checkout-session.dto';

export const PremiumOnly = () => SetMetadata(PREMIUM_ONLY_KEY, true);

@ApiTags("subscriptions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly audit: AuditService
  ) {}

  @Get()
  @ApiOperation({ summary: "Текущая подписка пользователя" })
  @ApiResponse({ status: 200, description: 'Подписка найдена или null', schema: { example: { plan: 'MONTHLY', status: 'ACTIVE' } } })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  getSubscription(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.getSubscription(user.userId);
  }

  @Post("checkout")
  @ApiOperation({ summary: "Создать Stripe Checkout для VivaForm+" })
  @ApiResponse({ status: 200, description: 'Сессия создана', schema: { example: { url: 'https://checkout.stripe.com/session/abc', id: 'cs_test_123' } } })
  @ApiResponse({ status: 400, description: 'Некорректный план или данные' })
  async checkout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.subscriptionsService.createCheckoutSession(user.userId, dto);
  }

  @Post("portal")
  @ApiOperation({ summary: "Создать портал управления подпиской" })
  @ApiResponse({ status: 200, description: 'URL портала', schema: { example: { url: 'https://billing.stripe.com/p/session_abc' } } })
  @ApiResponse({ status: 403, description: 'Требуется премиум-подписка' })
  @PremiumOnly()
  @UseGuards(StripeSubscriptionGuard)
  async portal(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePortalSessionDto
  ) {
    return this.subscriptionsService.createPortalSession(user.userId, dto);
  }

  @Post("sync-session")
  @ApiOperation({ summary: "Синхронизировать подписку после checkout" })
  @ApiResponse({ status: 200, description: 'Синхронизация успешна', schema: { example: { success: true, message: 'Subscription synced successfully' } } })
  @ApiResponse({ status: 400, description: 'Сессия не принадлежит пользователю' })
  async syncSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: SyncCheckoutSessionDto
  ) {
    return this.subscriptionsService.syncCheckoutSession(user.userId, body.sessionId);
  }

  @Get('history')
  @ApiOperation({ summary: 'История изменений подписки (audit log)' })
  @ApiResponse({ status: 200, description: 'История', schema: { example: { items: [{ id: 'log1', action: 'SUBSCRIPTION_CREATED', createdAt: '2025-01-01T00:00:00.000Z', metadata: { tier: 'PREMIUM', amount: 1299, currency: 'USD' } }], total: 1, page: 1, pageSize: 10, hasNext: false } } })
  async history(@CurrentUser() user: CurrentUserPayload, @Req() req: any) {
    const page = parseInt(req.query.page ?? '1', 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize ?? '10', 10) || 10, 50);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const actions = req.query.actions ? String(req.query.actions).split(',') : undefined;
    return this.subscriptionsService.getHistory(user.userId, page, pageSize, { from, to, actions } as any);
  }

  @Get('premium-view')
  @ApiOperation({ summary: 'Аудит: пользователь открыл /premium' })
  @ApiResponse({ status: 200, description: 'Лог записан', schema: { example: { ok: true } } })
  async premiumView(@CurrentUser() user: CurrentUserPayload, @Req() req: any) {
    await this.audit.logPremiumPageView(user?.userId, req.ip);
    return { ok: true };
  }
}
