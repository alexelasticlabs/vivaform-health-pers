import { BadRequestException, NotFoundException } from "@nestjs/common";
import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { SubscriptionsService } from './subscriptions.service';
import type { PrismaService } from "../../common/prisma/prisma.service";
import type { StripeService } from "../stripe/stripe.service";
import type { AuditService } from "../audit/audit.service";

const createStripeService = () => {
  const stripeClient = {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn()
      }
    },
    billingPortal: {
      sessions: {
        create: vi.fn()
      }
    },
    subscriptions: {
      retrieve: vi.fn()
    }
  } as unknown as any;

  return {
    client: stripeClient,
    priceForPlan: vi.fn()
  } as unknown as StripeService;
};

describe("SubscriptionsService", () => {
  let prisma: PrismaService;
  let stripeService: StripeService;
  let service: SubscriptionsService;
  let audit: AuditService;

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    stripeService = createStripeService();
    audit = { logSubscriptionChange: vi.fn() } as unknown as AuditService;
    service = new SubscriptionsService(prisma, stripeService, audit as any);
  });

  it("создаёт checkout session", async () => {
    (stripeService.priceForPlan as unknown as ReturnType<typeof vi.fn>).mockReturnValue("price_123");
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      subscription: null
    });
    (stripeService.client.checkout.sessions.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: "https://checkout",
      id: "sess_123"
    });

    const result = await service.createCheckoutSession("user-1", {
      plan: "monthly" as any,
      successUrl: "https://app/success",
      cancelUrl: "https://app/cancel"
    });

    expect(result.url).toBe("https://checkout");
    expect((stripeService.client.checkout.sessions.create as any)).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://app/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://app/cancel"
      })
    );
  });

  it("бросает NotFoundException, если пользователь не найден", async () => {
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      service.createCheckoutSession("missing", {
        plan: "monthly" as any,
        successUrl: "https://ok",
        cancelUrl: "https://cancel"
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("обновляет статус подписки при событии", async () => {
    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      current_period_end: Math.floor(Date.now() / 1000),
      current_period_start: Math.floor(Date.now() / 1000) - 1000,
      cancel_at_period_end: false,
      items: {
        data: [
          {
            price: { id: "price_123" }
          }
        ]
      },
      metadata: {
        userId: "user-1",
        plan: 'monthly'
      }
    } as unknown as Stripe.Subscription;

    (prisma.subscription.upsert as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await service.handleSubscriptionUpdated(subscription);

    expect(prisma.subscription.upsert).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { tier: "PREMIUM" }
    });
    expect((audit.logSubscriptionChange as any)).toHaveBeenCalledWith(
      "user-1",
      expect.any(String),
      expect.objectContaining({ subscriptionId: "sub_1" })
    );
  });

  it("бросает ошибку, если metadata не содержит userId", async () => {
    const subscription = {
      metadata: {}
    } as unknown as Stripe.Subscription;

    await expect(service.handleSubscriptionUpdated(subscription)).rejects.toBeInstanceOf(BadRequestException);
  });
});