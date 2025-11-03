import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import Stripe from "stripe";

import { stripeConfig } from "../../config";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(stripeConfig.KEY) private readonly stripeSettings: ConfigType<typeof stripeConfig>
  ) {
    this.stripe = new Stripe(this.stripeSettings.apiKey, {
      apiVersion: "2024-06-20",
      appInfo: {
        name: "VivaForm Backend",
        version: "0.1.0"
      }
    });
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
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      // Determine tier based on subscription status and price
      const tier = subscription.status === 'active' ? 'PREMIUM' : 'FREE';

      // Update user tier
      await this.prisma.user.update({
        where: { id: userId },
        data: { tier }
      });

      // Create subscription record
      await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubscription: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodEnd,
          priceId: 'price_default' // Default, should be read from price
        }
      });

      this.logger.log(`✅ Subscription created for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription creation`, error);
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

      await this.prisma.user.update({
        where: { id: userId },
        data: { tier }
      });

      await this.prisma.subscription.update({
        where: { stripeSubscription: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd
        }
      });

      this.logger.log(`✅ Subscription ${subscription.id} synced for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to sync subscription status`, error);
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