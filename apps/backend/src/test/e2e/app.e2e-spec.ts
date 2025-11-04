import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("AppModule e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.$connect();
    await prisma.recommendation.deleteMany();
    await prisma.nutritionEntry.deleteMany();
    await prisma.waterEntry.deleteMany();
    await prisma.weightEntry.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /health", async () => {
    const response = await request(app.getHttpServer()).get("/health").expect(200);
    expect(response.body.status).toBe("ok");
  });

  it("POST /auth/login возвращает токены", async () => {
    const email = "e2e-user@example.com";
    const password = "Secret123";
    await prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(password),
        name: "E2E"
      }
    });

    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password })
      .expect(201);

    expect(response.body.tokens.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(email);
  });
});