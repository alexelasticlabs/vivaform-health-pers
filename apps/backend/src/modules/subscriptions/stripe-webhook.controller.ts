import { BadRequestException, Controller, Headers, Post, Req } from "@nestjs/common";
import { RawBodyRequest } from "@nestjs/common";
import { Request } from "express";
import Stripe from "stripe";

import { StripeService } from "../stripe/stripe.service";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  @Post()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    const webhookSecret = this.stripeService.getWebhookSecret();
    if (!webhookSecret) {
      throw new BadRequestException("Stripe webhook secret is not configured");
    }

    if (!signature) {
      throw new BadRequestException("Missing Stripe signature header");
    }

    const rawBody = req.rawBody ?? (req.body as Buffer);

    let event: Stripe.Event;

    try {
      event = this.stripeService.client.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      throw new BadRequestException(`Invalid Stripe webhook signature: ${(error as Error).message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.subscriptionsService.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.subscriptionsService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.subscriptionsService.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return { received: true };
  }
}