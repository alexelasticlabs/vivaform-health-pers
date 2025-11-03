# E2E Testing Guide

Руководство по запуску интеграционных (E2E) тестов для VivaForm Backend.

## Обзор

E2E тесты проверяют полные потоки приложения, включая:
- **Auth Flow**: Регистрация → Верификация → Логин
- **Quiz Endpoints**: `/quiz/preview` (анонимный) и `/quiz/submit` (авторизованный)
- **Subscription Lifecycle**: Checkout → Webhook → Tier Upgrade
- **Protected Endpoints**: Доступ с JWT токенами

## Структура

```
apps/backend/src/test/e2e/
├── auth.e2e-spec.ts           # Тесты авторизации и регистрации
├── quiz.e2e-spec.ts           # Тесты квиза (анонимный и авторизованный)
├── subscriptions.e2e-spec.ts  # Тесты подписок и Stripe интеграции
└── app.e2e-spec.ts            # Базовые тесты приложения
```

## Настройка

### 1. Подготовка Test Database

E2E тесты требуют отдельную тестовую базу данных. Создайте `.env.test`:

```bash
# apps/backend/.env.test
DATABASE_URL="postgresql://user:password@localhost:5432/vivaform_test"
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-refresh-secret"
STRIPE_API_KEY="sk_test_..." # Используйте Stripe Test Mode
STRIPE_WEBHOOK_SECRET="whsec_test_..."
STRIPE_PRICE_MONTHLY="price_test_monthly"
STRIPE_PRICE_QUARTERLY="price_test_quarterly"
STRIPE_PRICE_ANNUAL="price_test_annual"
EMAIL_SERVICE="smtp"
```

### 2. Создание Test Database

```bash
# Создать тестовую БД
psql -U postgres -c "CREATE DATABASE vivaform_test;"

# Применить миграции
cd apps/backend
DATABASE_URL="postgresql://user:password@localhost:5432/vivaform_test" pnpm prisma migrate deploy
```

### 3. Установка зависимостей

Убедитесь, что установлены все dev-зависимости:

```bash
cd apps/backend
pnpm install
```

## Запуск тестов

### Unit Tests (без E2E)
```bash
pnpm test
```

### E2E Tests
```bash
# Один раз
pnpm test:e2e

# В watch mode
pnpm test:e2e:watch
```

### Все тесты (Unit + E2E)
```bash
pnpm test && pnpm test:e2e
```

## Написание E2E тестов

### Пример базового теста

```typescript
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../common/prisma/prisma.service";

describe("Feature E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Очистка БД перед каждым тестом
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app?.close();
  });

  it("should test something", async () => {
    const response = await request(app.getHttpServer())
      .get("/endpoint")
      .expect(200);

    expect(response.body).toBeDefined();
  });
});
```

### Best Practices

1. **Изоляция тестов**: Очищайте БД в `beforeEach` для независимости тестов
2. **Используйте реальные данные**: Не мокайте БД в E2E тестах
3. **Тестируйте полные потоки**: Проверяйте цепочки действий (register → login → action)
4. **Проверяйте состояние БД**: Используйте `prisma.findUnique()` для верификации изменений
5. **Мокируйте внешние сервисы**: Stripe, SendGrid, Expo Push (только внешние API)

### Мокирование Stripe

```typescript
import { vi } from "vitest";

// В тесте
vi.spyOn(stripeService.client.checkout.sessions, "create").mockResolvedValue({
  id: "cs_test_123",
  url: "https://checkout.stripe.com/test"
} as any);
```

## Покрытие тестов

### Текущее состояние

**Unit Tests**: 11/11 passing ✅
- `auth.service.spec.ts`: 4 tests
- `dashboard.service.spec.ts`: 2 tests
- `subscriptions.service.spec.ts`: 4 tests
- `health.service.spec.ts`: 1 test

**E2E Tests**: Created ✅
- `auth.e2e-spec.ts`: 12 scenarios
  - Registration flow (success, validation, duplicates)
  - Login flow (success, wrong password, nonexistent user)
  - Token refresh
  - Protected endpoints
  
- `quiz.e2e-spec.ts`: 6 scenarios
  - Anonymous quiz preview
  - Authenticated quiz submission
  - Profile creation and updates
  
- `subscriptions.e2e-spec.ts`: 8 scenarios
  - Checkout session creation
  - Customer portal access
  - Subscription lifecycle (activate → cancel)

### Coverage Report

```bash
# Генерировать coverage для unit tests
pnpm test -- --coverage

# Генерировать coverage для E2E tests
pnpm test:e2e -- --coverage

# Открыть HTML report
open coverage/index.html        # Unit tests
open coverage-e2e/index.html    # E2E tests
```

## Troubleshooting

### E2E тесты не запускаются

**Проблема**: `Cannot read properties of undefined (reading '$disconnect')`

**Решение**: Проверьте подключение к test database:
```bash
# Проверить доступность БД
psql postgresql://user:password@localhost:5432/vivaform_test -c "SELECT 1"

# Проверить миграции
DATABASE_URL="..." pnpm prisma migrate status
```

### Timeout ошибки

**Проблема**: Тесты превышают 30 секунд

**Решение**: Увеличьте timeout в `vitest.e2e.config.ts`:
```typescript
testTimeout: 60000, // 60 seconds
hookTimeout: 60000
```

### Конфликты портов

**Проблема**: `EADDRINUSE: address already in use`

**Решение**: Используйте случайный порт или остановите другие экземпляры:
```bash
# Найти процесс на порту 4000
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Убить процесс
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Stripe webhooks в тестах

**Проблема**: Нужно тестировать webhook обработку

**Решение**: Используйте Stripe CLI для форвардинга:
```bash
# Установить Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
choco install stripe-cli  # Windows

# Логин
stripe login

# Форвард вебхуков на локальный сервер
stripe listen --forward-to localhost:4000/webhooks/stripe

# Триггер тестового события
stripe trigger checkout.session.completed
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: vivaform
          POSTGRES_PASSWORD: password
          POSTGRES_DB: vivaform_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        run: pnpm --filter @vivaform/backend prisma migrate deploy
        env:
          DATABASE_URL: postgresql://vivaform:password@localhost:5432/vivaform_test
      
      - name: Run E2E tests
        run: pnpm --filter @vivaform/backend test:e2e
        env:
          DATABASE_URL: postgresql://vivaform:password@localhost:5432/vivaform_test
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
```

## Следующие шаги

- [ ] Добавить E2E тесты для notifications delivery
- [ ] Добавить E2E тесты для weight tracking endpoints
- [ ] Добавить E2E тесты для nutrition entries
- [ ] Добавить E2E тесты для water tracking
- [ ] Добавить E2E тесты для recommendations generation
- [ ] Настроить CI/CD pipeline для автоматического запуска
- [ ] Добавить performance benchmarks

---

**Last Updated**: 2025-11-04
