import { Controller, Post, Headers, Req, BadRequestException, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StripeService } from '../stripe/stripe.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type Stripe from 'stripe';
import { getRedis } from '../../common/utils/redis';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly redis = getRedis();
  private processedIds = new Set<string>(); // fallback на память, если нет Redis

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  @Throttle({ name: 'medium' })
  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Support both Nest rawBody (when app created with { rawBody: true }) and
    // express raw() middleware (where body is already a Buffer)
    const rawBody = (request as any).rawBody ?? (request as any).body;
    if (!rawBody) {
      this.logger.error('❗ Missing raw body on webhook request');
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;

    try {
      event = await this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      this.logger.error(`⚠️ Webhook signature verification failed`, error as any);
      throw new BadRequestException('Invalid signature');
    }

    // Idempotency: если событие уже обрабатывалось — игнорируем
    const evtId = event.id;
    try {
      if (this.redis) {
        const key = `stripe:webhook:${evtId}`;
        const res = await (this.redis as any).set(key, '1', 'EX', 24 * 60 * 60, 'NX');
        if (res !== 'OK') {
          this.logger.log(`🔁 Duplicate webhook ignored: ${evtId} (${event.type})`);
          return { received: true, duplicate: true } as any;
        }
      } else {
        if (this.processedIds.has(evtId)) {
          this.logger.log(`🔁 Duplicate webhook (memory) ignored: ${evtId}`);
          return { received: true, duplicate: true } as any;
        }
        this.processedIds.add(evtId);
        // Очистка набора при росте
        if (this.processedIds.size > 5000) {
          this.processedIds.clear();
        }
      }
    } catch (e) {
      this.logger.warn(`Idempotency check failed, proceeding without it: ${(e as Error)?.message}`);
    }

    this.logger.log(`🔔 Received webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}`, error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`💳 Checkout completed for session: ${session.id}`);
    await this.subscriptionsService.handleCheckoutCompleted(session);
    this.logger.log(`✅ Subscription created via SubscriptionsService`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`💰 Payment succeeded for invoice: ${invoice.id}`);
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) {
      return;
    }
    
    const subscription = await this.stripeService.client.subscriptions.retrieve(subscriptionId);
    await this.subscriptionsService.handleSubscriptionUpdated(subscription, invoice);
    this.logger.log(`✅ Subscription ${subscriptionId} updated`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`🔄 Subscription updated: ${subscription.id}`);
    await this.subscriptionsService.handleSubscriptionUpdated(subscription);
    this.logger.log(`✅ Subscription ${subscription.id} synced`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`❌ Subscription deleted: ${subscription.id}`);
    await this.subscriptionsService.handleSubscriptionDeleted(subscription);
    this.logger.log(`✅ User downgraded to FREE`);
  }
}
