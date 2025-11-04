import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../modules/email/email.service";

describe("Password reset E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.tempPassword.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app?.close();
  });

  it("POST /auth/forgot-password создает токен и (мок) отправляет письмо", async () => {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: "pwd-e2e@example.com",
        passwordHash: await argon2.hash("Pass12345"),
        name: "Pwd E2E"
      }
    });

    // Spy on EmailService to avoid network
    const emailService = app.get(EmailService);
    const spy = vi.spyOn(emailService, "sendPasswordResetEmail").mockResolvedValue(undefined as any);

    const resp = await request(app.getHttpServer())
      .post("/auth/forgot-password")
      .send({ email: user.email })
      .expect(201);

    expect(resp.body.message).toBeDefined();
    expect(spy).toHaveBeenCalledOnce();

    const tokens = await prisma.passwordResetToken.findMany({ where: { userId: user.id } });
    expect(tokens.length).toBe(1);
  });

  it("POST /auth/reset-password принимает валидный токен и обновляет пароль", async () => {
    const email = "reset-flow@example.com";
    const oldPassword = "OldPass123";
    const newPassword = "NewPass456!";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(oldPassword),
        name: "Reset User"
      }
    });

    // Create known token
    const rawToken = "TEST_RESET_TOKEN";
    const tokenHash = await argon2.hash(rawToken);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Reset password
    const resetResp = await request(app.getHttpServer())
      .post("/auth/reset-password")
      .send({ token: rawToken, newPassword })
      .expect(201);

    expect(resetResp.body.message).toMatch(/Password updated/i);

    // Login with new password should succeed
    const loginResp = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: newPassword })
      .expect(201);

    expect(loginResp.body.tokens?.accessToken).toBeDefined();

    // Token should be marked used
    const tokens = await prisma.passwordResetToken.findMany({ where: { userId: user.id } });
    expect(tokens[0].usedAt).not.toBeNull();
  });
});
