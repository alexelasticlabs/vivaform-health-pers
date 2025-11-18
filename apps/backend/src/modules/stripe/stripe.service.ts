import { Inject, Injectable, Logger } from "@nestjs/common";
import type { OnModuleInit } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ConfigService } from "@nestjs/config";
import type { ConfigType } from "@nestjs/config";
import Stripe from "stripe";
import Redis from 'ioredis';

import { stripeConfig } from "../../config";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  // Shared mapping from Stripe subscription status -> internal status
  private readonly subscriptionStatusMap: Record<
    Stripe.Subscription.Status,
    'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID'
  > = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    unpaid: 'UNPAID',
    paused: 'CANCELED'
  } as const;

  // Simple in-memory cache for prices to reduce Stripe calls
  private priceCache = new Map<string, { monthlyAmount: number; currency: string }>();
  private redis: Redis | null = null;
  private readonly REDIS_TTL_SECONDS = 3600;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(stripeConfig.KEY) private readonly stripeSettings: ConfigType<typeof stripeConfig>
  ) {
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST !== undefined;
    if (!this.stripeSettings.apiKey) {
      if (isTest) {
        // Лёгкий мок Stripe-клиента для тестов, чтобы не падать на инициализации
        this.logger.warn('Stripe API key missing — using mock client for tests');
        // @ts-ignore: we provide minimal shape used in tests
        this.stripe = {
          subscriptions: {
            retrieve: async (_id: string, _opts?: any) => ({
              id: 'sub_test',
              status: 'active',
              customer: 'cus_test',
              current_period_start: Math.floor(Date.now()/1000) - 86400,
              current_period_end: Math.floor(Date.now()/1000) + 2592000,
              cancel_at_period_end: false,
              trial_start: null,
              trial_end: null,
              items: { data: [{ price: { id: this.stripeSettings.prices?.MONTHLY || 'price_test', product: { id: 'prod_test' } } }] },
              metadata: {}
            })
          },
          billingPortal: { sessions: { create: async () => ({ id: 'bps_test', url: 'https://billing.stripe.com/test' }) } },
          checkout: { sessions: { create: async () => ({ id: 'cs_test', url: 'https://checkout.stripe.com/test', customer: 'cus_test' }) } },
          webhooks: { constructEvent: (_raw: Buffer) => ({ id: 'evt_test', type: 'ping' }) }
        } as unknown as Stripe;
      } else {
        throw new Error('STRIPE_API_KEY is not configured');
      }
    } else {
      this.stripe = new Stripe(this.stripeSettings.apiKey, {
        apiVersion: "2024-06-20",
        appInfo: { name: "VivaForm Backend", version: "0.1.0" }
      });
      this.logger.log('Stripe client initialized');
    }

    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
        void this.redis.connect().catch(err => this.logger.warn(`Redis connect failed: ${err.message}`));
      } catch (e:any) {
        this.logger.warn(`Redis init error: ${e.message}`);
        this.redis = null;
      }
    }
  }

  async onModuleInit() {
    // Verify Stripe configuration at boot (skip strict errors in tests)
    const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST !== undefined;
    if (!this.stripeSettings.webhookSecret && !isTest) {
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

  private normalizeToMonthly(unitAmount: number, interval?: string | null, intervalCount?: number | null) {
    if (!interval || interval === 'month') {
      const c = intervalCount && intervalCount > 0 ? intervalCount : 1;
      return unitAmount / c;
    }
    if (interval === 'year') {
      const c = intervalCount && intervalCount > 0 ? intervalCount : 1;
      return unitAmount / (12 * c);
    }
    if (interval === 'week') {
      const c = intervalCount && intervalCount > 0 ? intervalCount : 1;
      return (unitAmount / (4.34524 * c)); // approx weeks per month
    }
    if (interval === 'day') {
      const c = intervalCount && intervalCount > 0 ? intervalCount : 1;
      return unitAmount * (30 / c);
    }
    return unitAmount; // fallback
  }

  async getMonthlyAmountForPrice(priceId: string): Promise<{ monthlyAmount: number; currency: string }> {
    // Redis first
    if (this.redis) {
      try {
        const cachedRaw = await this.redis.get(`stripe:price:${priceId}`);
        if (cachedRaw) return JSON.parse(cachedRaw);
      } catch (e:any) { this.logger.debug(`Redis get fail ${e.message}`); }
    }
    const cached = this.priceCache.get(priceId);
    if (cached) return cached;
    const price = await this.stripe.prices.retrieve(priceId);
    const unitAmount = (price.unit_amount ?? 0) / 100;
    const currency = (price.currency || 'usd').toUpperCase();
    const recurring = price.recurring;
    const monthlyAmount = this.normalizeToMonthly(unitAmount, recurring?.interval, recurring?.interval_count ?? null);
    const entry = { monthlyAmount, currency };
    this.priceCache.set(priceId, entry);
    if (this.redis) {
      try { await this.redis.set(`stripe:price:${priceId}`, JSON.stringify(entry), 'EX', this.REDIS_TTL_SECONDS); } catch {}
    }
    return entry;
  }

  async getMonthlyAmountForPlan(plan: 'MONTHLY'|'QUARTERLY'|'ANNUAL'): Promise<{ monthlyAmount: number; currency: string }> {
    const priceId = this.priceForPlan(plan);
    if (!priceId) throw new Error(`Stripe price is not configured for plan ${plan}`);
    return this.getMonthlyAmountForPrice(priceId);
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
      const plan = (Object.entries(this.stripeSettings.prices).find(([, id]) => id === stripePriceId)?.[0] || 'MONTHLY') as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
      const status = this.subscriptionStatusMap[subscription.status] || 'INCOMPLETE';
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
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price']
      } as any);
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const stripePriceId = subscription.items.data[0]?.price?.id || 'unknown';
      const status = this.subscriptionStatusMap[subscription.status] || 'INCOMPLETE';

      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: status as any,
          currentPeriodStart,
          currentPeriodEnd,
          stripePriceId
        }
      });

      this.logger.log(`✅ Payment succeeded for subscription ${subscriptionId} (status: ${subscription.status})`);
    } catch (error) {
      this.logger.error(`Failed to handle payment success for subscription ${subscriptionId}`, error);
      throw error;
    }
  }
}
