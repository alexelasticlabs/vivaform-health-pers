import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("Auth E2E", () => {
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
    // Clean database before each test
    await prisma.recommendation.deleteMany();
    await prisma.nutritionEntry.deleteMany();
    await prisma.waterEntry.deleteMany();
    await prisma.weightEntry.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app?.close();
  });

  describe("POST /auth/register", () => {
    it("создает нового пользователя и возвращает токены", async () => {
      const registerDto = {
        email: "newuser@example.com",
        password: "SecurePass123",
        name: "New User"
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerDto)
        .expect(201);

      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.name).toBe(registerDto.name);
      expect(response.body.user.tier).toBe("FREE");

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: registerDto.email }
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerDto.email);
      expect(user?.emailVerified).toBe(false);
    });

    it("возвращает ошибку при дублировании email", async () => {
      const email = "duplicate@example.com";
      await prisma.user.create({
        data: {
          email,
          passwordHash: await argon2.hash("password"),
          name: "Existing User"
        }
      });

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email,
          password: "NewPassword123",
          name: "New User"
        })
        .expect(409);

      expect(response.body.message).toContain("уже зарегистрирован");
    });

    it("валидирует формат email", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "SecurePass123",
          name: "Test User"
        })
        .expect(400);
    });

    it("требует минимальную длину пароля", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "short",
          name: "Test User"
        })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    const userCredentials = {
      email: "login-test@example.com",
      password: "TestPassword123"
    };

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          passwordHash: await argon2.hash(userCredentials.password),
          name: "Login Test User"
        }
      });
    });

    it("успешно авторизует пользователя", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(userCredentials)
        .expect(201);

      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(userCredentials.email);
    });

    it("возвращает ошибку при неверном пароле", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: userCredentials.email,
          password: "WrongPassword"
        })
        .expect(401);
    });

    it("возвращает ошибку при несуществующем email", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePassword123"
        })
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("обновляет токены с валидным refresh token", async () => {
      // 1. Register user
      const registerResponse = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "refresh-test@example.com",
          password: "TestPass123",
          name: "Refresh Test"
        })
        .expect(201);

      const { refreshToken } = registerResponse.body.tokens;

      // 2. Refresh tokens
      const refreshResponse = await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken })
        .expect(201);

      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.refreshToken).toBeDefined();
      expect(refreshResponse.body.accessToken).not.toBe(registerResponse.body.tokens.accessToken);
    });

    it("возвращает ошибку при невалидном refresh token", async () => {
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: "invalid.token.here" })
        .expect(401);
    });
  });

  describe("Защищенные эндпоинты", () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "protected-test@example.com",
          password: "TestPass123",
          name: "Protected Test"
        })
        .expect(201);

      accessToken = response.body.tokens.accessToken;
      userId = response.body.user.id;
    });

    it("GET /users/me возвращает текущего пользователя", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe("protected-test@example.com");
    });

    it("GET /users/me возвращает 401 без токена", async () => {
      await request(app.getHttpServer())
        .get("/users/me")
        .expect(401);
    });

    it("GET /users/me возвращает 401 с невалидным токеном", async () => {
      await request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });
  });
});
