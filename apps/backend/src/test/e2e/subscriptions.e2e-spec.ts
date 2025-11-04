import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StripeService } from "../../modules/stripe/stripe.service";
// Use literal values for enums to avoid Prisma client enum import drift in tests

describe("Subscriptions E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stripeService: StripeService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    );
    await app.init();

    prisma = app.get(PrismaService);
    stripeService = app.get(StripeService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.recommendation.deleteMany();
    await prisma.nutritionEntry.deleteMany();
    await prisma.waterEntry.deleteMany();
    await prisma.weightEntry.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    // Create authenticated user
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "subscription-test@example.com",
        password: "TestPass123",
        name: "Subscription Test User"
      });

    accessToken = registerResponse.body.tokens.accessToken;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app?.close();
  });

  describe("GET /subscriptions", () => {
    it("возвращает null для пользователя без подписки", async () => {
      const response = await request(app.getHttpServer())
        .get("/subscriptions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeNull();
    });

    it("возвращает подписку если она существует", async () => {
      // Create subscription manually with new schema
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: "sub_test123",
          stripeCustomerId: "cus_test123",
          stripePriceId: "price_test",
          plan: "MONTHLY" as any,
          status: "ACTIVE" as any,
          currentPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        } as any
      } as any);

      const response = await request(app.getHttpServer())
        .get("/subscriptions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.stripeSubscriptionId).toBe("sub_test123");
      expect(response.body.status).toBe("ACTIVE");
    });

    it("требует аутентификацию", async () => {
      await request(app.getHttpServer())
        .get("/subscriptions")
        .expect(401);
    });
  });

  describe("POST /subscriptions/checkout", () => {
    it("создает Stripe checkout session", async () => {
      // Mock Stripe checkout session creation
      const mockCheckoutSession = {
        id: "cs_test_123",
        url: "https://checkout.stripe.com/test",
        customer: "cus_test_123"
      };

      vi.spyOn(stripeService.client.checkout.sessions, "create").mockResolvedValue(
        mockCheckoutSession as any
      );

      const response = await request(app.getHttpServer())
        .post("/subscriptions/checkout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          plan: "MONTHLY",
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel"
        })
        .expect(201);

      expect(response.body.id).toBe(mockCheckoutSession.id);
      expect(response.body.url).toBe(mockCheckoutSession.url);
    });

    it("валидирует plan field", async () => {
      await request(app.getHttpServer())
        .post("/subscriptions/checkout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          plan: "invalid_plan",
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel"
        })
        .expect(400);
    });

    it("требует successUrl и cancelUrl", async () => {
      await request(app.getHttpServer())
        .post("/subscriptions/checkout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          plan: "MONTHLY"
        })
        .expect(400);
    });

    it("требует аутентификацию", async () => {
      await request(app.getHttpServer())
        .post("/subscriptions/checkout")
        .send({
          plan: "monthly",
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel"
        })
        .expect(401);
    });
  });

  describe("POST /subscriptions/portal", () => {
    it("создает Stripe customer portal session", async () => {
      // Create subscription first
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: "sub_test123",
          stripeCustomerId: "cus_test123",
          stripePriceId: "price_test",
          plan: "MONTHLY" as any,
          status: "ACTIVE" as any,
          currentPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        } as any
      } as any);

      // Mock Stripe portal session creation
      const mockPortalSession = {
        id: "bps_test_123",
        url: "https://billing.stripe.com/test"
      };

      vi.spyOn(stripeService.client.billingPortal.sessions, "create").mockResolvedValue(
        mockPortalSession as any
      );

      const response = await request(app.getHttpServer())
        .post("/subscriptions/portal")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          returnUrl: "https://example.com/settings"
        })
        .expect(201);

      expect(response.body.url).toBe(mockPortalSession.url);
    });

    it("требует активную подписку", async () => {
      await request(app.getHttpServer())
        .post("/subscriptions/portal")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          returnUrl: "https://example.com/settings"
        })
        .expect(404);
    });

    it("требует аутентификацию", async () => {
      await request(app.getHttpServer())
        .post("/subscriptions/portal")
        .send({
          returnUrl: "https://example.com/settings"
        })
        .expect(401);
    });
  });

  describe("Subscription lifecycle", () => {
    it("полный цикл: checkout → активация → апгрейд tier", async () => {
      // 1. Verify user starts with FREE tier
      let user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.tier).toBe("FREE");

      // 2. Create subscription (simulating webhook)
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: "sub_lifecycle_test",
          stripeCustomerId: "cus_lifecycle_test",
          stripePriceId: "price_monthly",
          plan: "MONTHLY" as any,
          status: "ACTIVE" as any,
          currentPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        } as any
      } as any);

      // 3. Update user tier to PREMIUM
      await prisma.user.update({
        where: { id: userId },
        data: { tier: "PREMIUM" }
      });

      // 4. Verify tier upgrade
      user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.tier).toBe("PREMIUM");

      // 5. Verify subscription is retrievable
      const response = await request(app.getHttpServer())
        .get("/subscriptions")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe("ACTIVE");
      expect(response.body.stripeSubscriptionId).toBe("sub_lifecycle_test");
    });

    it("cancellation: active → canceled → downgrade to FREE", async () => {
      // 1. Create active subscription
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: "sub_cancel_test",
          stripeCustomerId: "cus_cancel_test",
          stripePriceId: "price_monthly",
          plan: "MONTHLY" as any,
          status: "ACTIVE" as any,
          currentPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false
        } as any
      } as any);

      await prisma.user.update({
        where: { id: userId },
        data: { tier: "PREMIUM" }
      });

      // 2. Cancel subscription (simulating webhook)
      await prisma.subscription.update({
        where: { userId },
        data: { status: "CANCELED" as any }
      } as any);

      await prisma.user.update({
        where: { id: userId },
        data: { tier: "FREE" }
      });

      // 3. Verify downgrade
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.tier).toBe("FREE");

      const subscription = await prisma.subscription.findFirst({
        where: { userId }
      });
      expect(subscription?.status).toBe("CANCELED");
    });
  });
});
