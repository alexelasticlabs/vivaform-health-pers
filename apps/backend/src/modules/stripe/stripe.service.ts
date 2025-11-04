import { Inject, Injectable, Logger } from "@nestjs/common";
import type { OnModuleInit } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ConfigService } from "@nestjs/config";
import type { ConfigType } from "@nestjs/config";
import Stripe from "stripe";

import { stripeConfig } from "../../config";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
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

    const requiredPrices: Array<keyof ConfigType<typeof stripeConfig>['prices']> = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
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

  priceForPlan(plan: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL') {
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
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      const stripePriceId = subscription.items.data[0]?.price?.id || 'unknown';
      const statusMap: Record<Stripe.Subscription.Status, 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID'> = {
        active: 'ACTIVE',
        trialing: 'TRIALING',
        canceled: 'CANCELED',
        past_due: 'PAST_DUE',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'INCOMPLETE_EXPIRED',
        unpaid: 'UNPAID',
        paused: 'CANCELED'
      } as const;

      const plan = (Object.entries(this.stripeSettings.prices).find(([, id]) => id === stripePriceId)?.[0] || 'MONTHLY') as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
      const status = statusMap[subscription.status] || 'INCOMPLETE';
      const tier = status === 'ACTIVE' || status === 'TRIALING' ? 'PREMIUM' : 'FREE';

      await this.prisma.user.update({ where: { id: userId }, data: { tier } });

      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId,
          plan: plan as any,
          status: status as any,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          metadata: subscription.metadata as any
        },
        create: {
          userId,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId,
          plan: plan as any,
          status: status as any,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          metadata: subscription.metadata as any
        }
      });

      this.logger.log(`✅ Subscription created for user ${userId}: ${subscriptionId} (price: ${stripePriceId}, status: ${subscription.status})`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription creation for user ${userId}`, error);
      throw error;
    }
  }

  async handlePaymentSucceeded(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const stripePriceId = subscription.items.data[0]?.price?.id || 'unknown';
      const statusMap: Record<Stripe.Subscription.Status, 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID'> = {
        active: 'ACTIVE',
        trialing: 'TRIALING',
        canceled: 'CANCELED',
        past_due: 'PAST_DUE',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'INCOMPLETE_EXPIRED',
        unpaid: 'UNPAID',
        paused: 'CANCELED'
      } as const;
      const status = statusMap[subscription.status] || 'INCOMPLETE';

      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          currentPeriodStart,
          currentPeriodEnd,
          stripePriceId,
          status: status as any
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
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const stripePriceId = subscription.items.data[0]?.price?.id || 'unknown';
      const statusMap: Record<Stripe.Subscription.Status, 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID'> = {
        active: 'ACTIVE',
        trialing: 'TRIALING',
        canceled: 'CANCELED',
        past_due: 'PAST_DUE',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'INCOMPLETE_EXPIRED',
        unpaid: 'UNPAID',
        paused: 'CANCELED'
      } as const;
      const status = statusMap[subscription.status] || 'INCOMPLETE';
      const tier = status === 'ACTIVE' || status === 'TRIALING' ? 'PREMIUM' : 'FREE';

      await this.prisma.user.update({ where: { id: userId }, data: { tier } });

      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: status as any,
          currentPeriodStart,
          currentPeriodEnd,
          stripePriceId
        }
      });

      this.logger.log(`✅ Subscription ${subscription.id} synced: ${userId}, tier: ${tier}, status: ${subscription.status}, price: ${stripePriceId}`);
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
        data: { status: 'CANCELED' }
      });

      this.logger.log(`✅ User ${userId} downgraded to FREE`);
    } catch (error) {
      this.logger.error(`Failed to handle subscription cancellation`, error);
      throw error;
    }
  }
}