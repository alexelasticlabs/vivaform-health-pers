import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUser as CurrentUserPayload } from "../../common/types/current-user";
import {
  CreateCheckoutSessionDto,
  CreatePortalSessionDto
} from "./dto/create-checkout-session.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("subscriptions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: "Текущая подписка пользователя" })
  getSubscription(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.getSubscription(user.userId);
  }

  @Post("checkout")
  @ApiOperation({ summary: "Создать Stripe Checkout для VivaForm+" })
  createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.subscriptionsService.createCheckoutSession(user.userId, dto);
  }

  @Post("portal")
  @ApiOperation({ summary: "Создать портал управления подпиской" })
  createPortal(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePortalSessionDto
  ) {
    return this.subscriptionsService.createPortalSession(user.userId, dto);
  }
}