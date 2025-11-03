import { Controller, Post, Headers, RawBodyRequest, Req, BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;

    try {
      event = await this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      this.logger.error(`⚠️ Webhook signature verification failed`, error);
      throw new BadRequestException('Invalid signature');
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

    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      this.logger.error('No subscription ID in checkout session');
      return;
    }

    // Stripe service will create/update subscription
    await this.stripeService.handleSubscriptionCreated(userId, subscriptionId);
    
    this.logger.log(`✅ Subscription created for user ${userId}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`💰 Payment succeeded for invoice: ${invoice.id}`);

    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) {
      return;
    }

    // Extend subscription period
    await this.stripeService.handlePaymentSucceeded(subscriptionId);
    
    this.logger.log(`✅ Subscription ${subscriptionId} extended`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`🔄 Subscription updated: ${subscription.id}`);

    const userId = subscription.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in subscription metadata');
      return;
    }

    // Sync subscription status
    await this.stripeService.syncSubscriptionStatus(userId, subscription);
    
    this.logger.log(`✅ Subscription ${subscription.id} synced`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`❌ Subscription deleted: ${subscription.id}`);

    const userId = subscription.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in subscription metadata');
      return;
    }

    // Downgrade to FREE tier
    await this.stripeService.handleSubscriptionCanceled(userId);
    
    this.logger.log(`✅ User ${userId} downgraded to FREE`);
  }
}
