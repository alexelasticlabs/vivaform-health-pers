import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import Stripe from "stripe";

import { stripeConfig } from "../../config";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(stripeConfig.KEY) private readonly stripeSettings: ConfigType<typeof stripeConfig>
  ) {
    if (!this.stripeSettings.apiKey) {
      throw new Error('STRIPE_API_KEY is not configured');
    }

    this.stripe = new Stripe(this.stripeSettings.apiKey, {
      apiVersion: "2024-06-20",
      appInfo: {
        name: "VivaForm Backend",
        version: "0.1.0"
      }
    });

    this.logger.log('Stripe client initialized');
  }

  async onModuleInit() {
    // Verify Stripe configuration at boot
    if (!this.stripeSettings.webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not configured! Webhooks will fail.');
    }

    const requiredPrices: Array<keyof ConfigType<typeof stripeConfig>['prices']> = ['monthly', 'quarterly', 'annual'];
    for (const priceKey of requiredPrices) {
      if (!this.stripeSettings.prices[priceKey]) {
        this.logger.warn(`Stripe price ${priceKey} is not configured`);
      }
    }

    this.logger.log('Stripe configuration validated');
  }

  get client() {
    return this.stripe;
  }

  getWebhookSecret() {
    return this.stripeSettings.webhookSecret;
  }

  priceForPlan(plan: keyof ConfigType<typeof stripeConfig>["prices"]) {
    return this.stripeSettings.prices[plan];
  }

  async constructWebhookEvent(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.getWebhookSecret()
    );
  }

  async handleSubscriptionCreated(userId: string, subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product']
      });
      
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      // Extract priceId from first subscription item
      const priceId = subscription.items.data[0]?.price?.id || 'unknown';
      const tier = subscription.status === 'active' ? 'PREMIUM' : 'FREE';

      // Update user tier
      await this.prisma.user.update({
        where: { id: userId },
        data: { tier }
      });

      // Create subscription record with captured priceId and metadata
      await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubscription: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodEnd,
          priceId
        }
      });

      this.logger.log(`✅ Subscription created for user ${userId}: ${subscriptionId} (price: ${priceId}, status: ${subscription.status})`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription creation for user ${userId}`, error);
      throw error;
    }
  }

  async handlePaymentSucceeded(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      await this.prisma.subscription.update({
        where: { stripeSubscription: subscriptionId },
        data: {
          currentPeriodEnd,
          status: subscription.status
        }
      });

      this.logger.log(`✅ Subscription ${subscriptionId} extended`);
    } catch (error) {
      this.logger.error(`Failed to handle payment success`, error);
      throw error;
    }
  }

  async syncSubscriptionStatus(userId: string, subscription: Stripe.Subscription) {
    try {
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const tier = subscription.status === 'active' ? 'PREMIUM' : 'FREE';
      const priceId = subscription.items.data[0]?.price?.id || 'unknown';

      await this.prisma.user.update({
        where: { id: userId },
        data: { tier }
      });

      await this.prisma.subscription.update({
        where: { stripeSubscription: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd,
          priceId
        }
      });

      this.logger.log(`✅ Subscription ${subscription.id} synced: ${userId}, tier: ${tier}, status: ${subscription.status}, price: ${priceId}`);
    } catch (error) {
      this.logger.error(`Failed to sync subscription ${subscription.id} for user ${userId}`, error);
      throw error;
    }
  }

  async handleSubscriptionCanceled(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { tier: 'FREE' }
      });

      // Mark subscription as canceled
      await this.prisma.subscription.updateMany({
        where: { userId },
        data: { status: 'canceled' }
      });

      this.logger.log(`✅ User ${userId} downgraded to FREE`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription cancellation`, error);
      throw error;
    }
  }
}