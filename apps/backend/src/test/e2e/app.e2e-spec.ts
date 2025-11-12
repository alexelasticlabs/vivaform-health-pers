﻿import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppE2eModule } from "../../app.e2e.module";
import { PrismaService } from "../../common/prisma/prisma.service";
import { truncateAll as _truncateAll } from '../setup-e2e';

describe("AppModule e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    console.log('[E2E] AppModule beforeAll start');
    const moduleRef = await Test.createTestingModule({
      imports: [AppE2eModule]
    }).compile();
    console.log('[E2E] module compiled');

    app = moduleRef.createNestApplication();
    await app.init();
    console.log('[E2E] app.init done');

    prisma = app.get(PrismaService);
    await prisma.$connect();
    console.log('[E2E] prisma connected');
    // await truncateAll(prisma);
    console.log('[E2E] beforeAll complete');
  });

  beforeEach(async () => {
    // await truncateAll(prisma);
  });

  afterAll(async () => {
    console.log('[E2E] AppModule afterAll start');
    await app?.close();
    console.log('[E2E] AppModule afterAll complete');
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