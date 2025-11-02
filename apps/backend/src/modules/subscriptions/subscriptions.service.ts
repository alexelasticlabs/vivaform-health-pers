import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";

import { PrismaService } from "../../common/prisma/prisma.service";
import { StripeService } from "../stripe/stripe.service";
import {
  CreateCheckoutSessionDto,
  CreatePortalSessionDto,
  SubscriptionPlan
} from "./dto/create-checkout-session.dto";

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  "active",
  "trialing"
];

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService
  ) {}

  private priceIdForPlan(plan: SubscriptionPlan) {
    const priceId = this.stripeService.priceForPlan(plan);
    if (!priceId) {
      throw new BadRequestException(`Stripe price is not configured for plan "${plan}"`);
    }

    return priceId;
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const priceId = this.priceIdForPlan(dto.plan);
    const existingCustomerId = user.subscription?.stripeCustomerId ?? undefined;

    const session = await this.stripeService.client.checkout.sessions.create({
      mode: "subscription",
      success_url: `${dto.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: dto.cancelUrl,
      customer: existingCustomerId,
      customer_email: existingCustomerId ? undefined : user.email,
      invoice_creation: { enabled: true },
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

  private async updateSubscriptionRecord(userId: string, subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      throw new BadRequestException("Subscription price not found in Stripe payload");
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeCustomerId: subscription.customer as string,
        stripeSubscription: subscription.id,
        priceId,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      },
      create: {
        userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscription: subscription.id,
        priceId,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });

    const tier = ACTIVE_STATUSES.includes(subscription.status) ? "PREMIUM" : "FREE";

    await this.prisma.user.update({
      where: { id: userId },
      data: { tier }
    });
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) {
      return;
    }

    const subscription = await this.stripeService.client.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.userId ?? (session.metadata?.userId as string | undefined);

    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.updateSubscriptionRecord(userId, subscription);
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.updateSubscriptionRecord(userId, subscription);
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) {
      throw new BadRequestException("Subscription metadata does not contain userId");
    }

    await this.prisma.subscription.delete({ where: { userId } }).catch(() => undefined);
    await this.prisma.user.update({ where: { id: userId }, data: { tier: "FREE" } });
  }
}