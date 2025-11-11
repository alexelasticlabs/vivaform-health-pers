import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  CreateCheckoutSessionDto,
  CreatePortalSessionDto
} from "./dto/create-checkout-session.dto";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SubscriptionsService } from "./subscriptions.service";
import { AuditService, AuditAction } from "../audit/audit.service";
import { UseGuards, SetMetadata } from "@nestjs/common";
import { StripeSubscriptionGuard, PREMIUM_ONLY_KEY } from "../../common/middleware/stripe-subscription.guard";

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
  async checkout(@Req() req: any, @Body() body: any) {
    const result = await this.subscriptionsService.createCheckoutSession(req.user.id, body);
    await this.audit.logSubscriptionChange(req.user.id, AuditAction.SUBSCRIPTION_UPGRADED, { priceId: result.id, tier: body.plan });
    return result;
  }

  @Post("portal")
  @ApiOperation({ summary: "Создать портал управления подпиской" })
  @ApiResponse({ status: 200, description: 'URL портала', schema: { example: { url: 'https://billing.stripe.com/p/session_abc' } } })
  @ApiResponse({ status: 403, description: 'Требуется премиум-подписка' })
  @PremiumOnly()
  @UseGuards(StripeSubscriptionGuard)
  async portal(@Req() req: any) {
    return this.subscriptionsService.createPortalSession(req.user.id, { returnUrl: req.query.returnUrl || req.headers.origin || 'http://localhost:5173/app' });
  }

  @Post("sync-session")
  @ApiOperation({ summary: "Синхронизировать подписку после checkout" })
  @ApiResponse({ status: 200, description: 'Синхронизация успешна', schema: { example: { success: true, message: 'Subscription synced successfully' } } })
  @ApiResponse({ status: 400, description: 'Сессия не принадлежит пользователю' })
  async syncSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { sessionId: string }
  ) {
    return this.subscriptionsService.syncCheckoutSession(user.userId, body.sessionId);
  }
}

export const PremiumOnly = () => SetMetadata(PREMIUM_ONLY_KEY, true);
