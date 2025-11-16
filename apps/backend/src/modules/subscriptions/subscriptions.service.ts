import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException, Logger } from "@nestjs/common";
import type Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../common/prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { StripeService } from "../stripe/stripe.service";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService, AuditAction } from "../audit/audit.service";
import type { CreateCheckoutSessionDto, CreatePortalSessionDto } from "./dto/create-checkout-session.dto";
import type { SubscriptionPlan } from "@prisma/client";
import { deleteByPattern } from '../../common/utils/redis';

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  "active",
  "trialing"
];

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly audit: AuditService
  ) {}

  private priceIdForPlan(plan: SubscriptionPlan) {
    const priceId = this.stripeService.priceForPlan(plan);
    if (!priceId) {
      throw new BadRequestException(`Stripe price is not configured for plan "${plan}"`);
    }

    return priceId;
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    console.log('[SubscriptionsService] Creating checkout session', { userId, plan: dto.plan });
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    console.log('[SubscriptionsService] User found', { userId, hasSubscription: !!user.subscription });

    const priceId = this.priceIdForPlan(dto.plan);
    console.log('[SubscriptionsService] Price ID for plan', { plan: dto.plan, priceId });
    
    const existingCustomerId = user.subscription?.stripeCustomerId ?? undefined;
    console.log('[SubscriptionsService] Existing customer ID', { existingCustomerId });

    // Ensure we append session_id correctly whether successUrl already contains query params or not
    const successUrlHasQuery = dto.successUrl.includes("?");
    const successUrl = `${dto.successUrl}${successUrlHasQuery ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: "subscription",
      success_url: successUrl,
      cancel_url: dto.cancelUrl,
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : user.email,
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        userId,
        plan: dto.plan
      },
      subscription_data: {
        metadata: {
          userId,
          plan: dto.plan
        }
      }
    });

    return { url: session.url, id: session.id };
  }

  async createPortalSession(userId: string, dto: CreatePortalSessionDto) {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException("Premium subscription is not active for this user");
    }

    const session = await this.stripeService.client.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: dto.returnUrl
    });

    return { url: session.url };
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async syncCheckoutSession(userId: string, sessionId: string) {
    const session = await this.stripeService.client.checkout.sessions.retrieve(sessionId);
    
    if (session.metadata?.userId !== userId) {
      throw new BadRequestException("Session does not belong to this user");
    }

    await this.handleCheckoutCompleted(session);

    await this.audit.logSubscriptionChange(userId, AuditAction.SUBSCRIPTION_CREATED, {
      subscriptionId: (session.subscription as string) || undefined,
      priceId: session.metadata?.price as string | undefined,
      tier: 'PREMIUM',
      amount: (session as any).amount_total || (session as any).amount_subtotal || undefined,
      currency: ((session as any).currency || 'usd').toUpperCase()
    });
    
    return { success: true, message: "Subscription synced successfully" };
  }

  private mapStripeStatusToPrisma(status: Stripe.Subscription.Status): string {
    const statusMap: Record<Stripe.Subscription.Status, string> = {
      'active': 'ACTIVE',
      'trialing': 'TRIALING',
      'canceled': 'CANCELED',
      'past_due': 'PAST_DUE',
      'incomplete': 'INCOMPLETE',
      'incomplete_expired': 'INCOMPLETE_EXPIRED',
      'unpaid': 'UNPAID',
      'paused': 'CANCELED'
    };
    return statusMap[status] || 'INCOMPLETE';
  }

  private mapPlanToPrisma(plan: string): string {
    const planMap: Record<string, string> = {
      'monthly': 'MONTHLY',
      'quarterly': 'QUARTERLY',
      'annual': 'ANNUAL'
    };
    return planMap[plan] || 'MONTHLY';
  }

  private async updateSubscriptionRecord(userId: string, subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      throw new BadRequestException("Subscription price not found in Stripe payload");
    }

    const plan = subscription.metadata.plan || 'monthly';

    try {
      await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          plan: this.mapPlanToPrisma(plan) as any,
          status: this.mapStripeStatusToPrisma(subscription.status) as any,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
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
          stripePriceId: priceId,
          plan: this.mapPlanToPrisma(plan) as any,
          status: this.mapStripeStatusToPrisma(subscription.status) as any,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          metadata: subscription.metadata as any
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to upsert subscription for userId=${userId}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException('Не удалось обновить подписку пользователя');
    }

    const tier = ACTIVE_STATUSES.includes(subscription.status) ? "PREMIUM" : "FREE";

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { tier }
      });
    } catch (error) {
      this.logger.error(
        `Failed to update user tier for userId=${userId}`,
        error instanceof Error ? error.stack : undefined
      );
      throw new InternalServerErrorException('Не удалось обновить статус пользователя');
    }
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) {
      return;
    }

    const subscription = await this.stripeService.client.subscriptions.retrieve(subscriptionId);
    const userId = (subscription as any).metadata.userId ?? (session.metadata?.userId as string | undefined);

    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.updateSubscriptionRecord(userId, subscription as any);
    await deleteByPattern('admin:*');
  }

  private extractBillingInfo(invoice?: Stripe.Invoice, subscription?: Stripe.Subscription) {
    if (invoice) {
      const amount = invoice.total ?? invoice.amount_due ?? undefined;
      const currency = (invoice.currency || 'usd').toUpperCase();
      return { amount, currency };
    }
    if (subscription) {
      // Попытка взять из последнего invoice через pending_update (ограниченно). Иначе null.
      return { amount: undefined, currency: undefined };
    }
    return { amount: undefined, currency: undefined };
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription, invoice?: Stripe.Invoice) {
    const userId = (subscription as any).metadata.userId;
    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.updateSubscriptionRecord(userId, subscription);
    await deleteByPattern('admin:*');

    if (ACTIVE_STATUSES.includes(subscription.status)) {
      const { amount, currency } = this.extractBillingInfo(invoice, subscription);
      await this.audit.logSubscriptionChange(userId, AuditAction.SUBSCRIPTION_UPGRADED, {
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0]?.price?.id,
        tier: 'PREMIUM',
        amount,
        currency
      });
    }
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = (subscription as any).metadata.userId;
    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.prisma.subscription.delete({ where: { userId } }).catch(() => undefined);
    await this.prisma.user.update({ where: { id: userId }, data: { tier: "FREE" } });
    await this.audit.logSubscriptionChange(userId, AuditAction.SUBSCRIPTION_CANCELLED, {
      subscriptionId: subscription.id,
      priceId: subscription.items.data[0]?.price?.id,
      tier: 'FREE',
      amount: undefined,
      currency: undefined
    });
    await deleteByPattern('admin:*');
  }

  async getHistory(userId: string, page = 1, pageSize = 10, filters?: { from?: Date; to?: Date; actions?: string[] }) {
    const actionList = filters?.actions?.length ? filters.actions : [
      AuditAction.SUBSCRIPTION_CREATED,
      AuditAction.SUBSCRIPTION_UPGRADED,
      AuditAction.SUBSCRIPTION_CANCELLED
    ];
    const where: any = {
      userId,
      action: { in: actionList }
    };
    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const [total, items] = await this.prisma.$transaction([
      (this.prisma as any).auditLog.count({ where }),
      (this.prisma as any).auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, action: true, createdAt: true, metadata: true }
      })
    ]);

    return { items, total, page, pageSize, hasNext: page * pageSize < total };
  }
}