import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("Quiz E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
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

    // Create authenticated user for protected endpoints
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "quiz-test@example.com",
        password: "TestPass123",
        name: "Quiz Test User"
      });

    accessToken = registerResponse.body.tokens.accessToken;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app?.close();
  });

  describe("POST /quiz/preview", () => {
    it("позволяет анонимному пользователю просмотреть квиз", async () => {
      const quizData = {
        age: 30,
        gender: "male",
        height: 180,
        weight: 85,
        goal: "lose_weight",
        activityLevel: "moderate",
        dietaryPreferences: ["vegetarian"]
      };

      const response = await request(app.getHttpServer())
        .post("/quiz/preview")
        .send(quizData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.bmr).toBeDefined();
      expect(response.body.tdee).toBeDefined();
      expect(response.body.recommendations).toBeDefined();
    });

    it("валидирует поля квиза", async () => {
      await request(app.getHttpServer())
        .post("/quiz/preview")
        .send({
          age: 150, // Invalid age
          gender: "male",
          height: 180
        })
        .expect(400);
    });

    it("не требует аутентификации", async () => {
      const quizData = {
        age: 25,
        gender: "female",
        height: 165,
        weight: 60,
        goal: "maintain",
        activityLevel: "light"
      };

      const response = await request(app.getHttpServer())
        .post("/quiz/preview")
        .send(quizData)
        .expect(201);

      expect(response.body.bmr).toBeDefined();
    });
  });

  describe("POST /quiz/submit", () => {
    it("сохраняет результаты квиза для авторизованного пользователя", async () => {
      const quizData = {
        age: 28,
        gender: "female",
        height: 168,
        weight: 62,
        goal: "gain_muscle",
        activityLevel: "very_active",
        dietaryPreferences: ["gluten_free"],
        wantReminders: true
      };

      const response = await request(app.getHttpServer())
        .post("/quiz/submit")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(quizData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.bmr).toBeDefined();
      expect(response.body.tdee).toBeDefined();

      // Verify profile was created
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      expect(profile).toBeDefined();
      expect(profile?.gender).toBe(quizData.gender);
      expect(profile?.heightCm).toBe(quizData.height);
      expect(profile?.currentWeightKg).toBe(quizData.weight);
      expect(profile?.goal).toBe(quizData.goal);
      expect(profile?.activityLevel).toBe(quizData.activityLevel);
      expect(profile?.wantReminders).toBe(true);
    });

    it("возвращает 401 без токена аутентификации", async () => {
      const quizData = {
        age: 30,
        gender: "male",
        height: 175,
        weight: 80,
        goal: "lose_weight",
        activityLevel: "moderate"
      };

      await request(app.getHttpServer())
        .post("/quiz/submit")
        .send(quizData)
        .expect(401);
    });

    it("обновляет существующий профиль при повторной отправке", async () => {
      // First submission
      await request(app.getHttpServer())
        .post("/quiz/submit")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          age: 25,
          gender: "male",
          height: 180,
          weight: 85,
          goal: "lose_weight",
          activityLevel: "light"
        })
        .expect(201);

      // Second submission with updated data
      const updatedData = {
        age: 26,
        gender: "male",
        height: 180,
        weight: 80,
        goal: "maintain",
        activityLevel: "moderate"
      };

      await request(app.getHttpServer())
        .post("/quiz/submit")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedData)
        .expect(201);

      // Verify profile was updated
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      expect(profile).toBeDefined();
      expect(profile?.currentWeightKg).toBe(80);
      expect(profile?.goal).toBe("maintain");
      expect(profile?.activityLevel).toBe("moderate");
    });
  });
});
