# 🚀 VivaForm+ Subscription System — Deployment Guide

## ✅ Что уже сделано

### 1. Backend (NestJS)
- ✅ Обновлена Prisma схема с расширенной моделью `Subscription`
- ✅ Установлен `stripe` SDK
- ✅ Создан `StripeModule` с конфигурацией
- ✅ Реализован `SubscriptionsModule` с:
  - Сервисом для создания Checkout Session
  - Сервисом для Customer Portal
  - Контроллером с API endpoints
  - Обработчиками webhook событий
- ✅ Создан `WebhooksController` для приёма событий от Stripe
- ✅ Добавлен `PremiumGuard` для защиты premium endpoints
- ✅ Создан декоратор `@RequiresPremium()`

### 2. Frontend (React + Vite)
- ✅ Установлен `@stripe/stripe-js`
- ✅ Создан API клиент `subscriptions.ts`
- ✅ Реализована премиум-страница `/premium` с:
  - Выбором планов подписки
  - Сравнением Free vs Premium
  - Блоком FAQ
  - Отзывами пользователей
  - Интеграцией с аналитикой

### 3. База данных
- ✅ Создана миграция `20251104000001_add_subscription_enums_and_fields`
- ⚠️ Миграция требует ручного применения

---

## 📋 Шаги для завершения внедрения

### Шаг 1: Применить миграцию базы данных

**Проблема:** Prisma CLI не может подключиться к БД из-за проблем с аутентификацией.

**Решение:** Применить миграцию вручную через расширение PostgreSQL в VS Code.

#### Вариант A: Через расширение PostgreSQL (ms-ossdata.vscode-pgsql)

1. Открыть расширение PostgreSQL в VS Code
2. Подключиться к базе `dbname`
3. Выполнить SQL-скрипт из файла:
   ```
   apps/backend/prisma/migrations/20251104000001_add_subscription_enums_and_fields/migration.sql
   ```

#### Вариант B: Через командную строку psql

Если у вас установлен psql:

```powershell
# Найти путь к psql (обычно в Program Files\PostgreSQL\<version>\bin)
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"

# Применить миграцию
psql -U vivaform_user -d dbname -f "apps\backend\prisma\migrations\20251104000001_add_subscription_enums_and_fields\migration.sql"
```

#### Вариант C: Пересоздать базу данных

Если в тестовой базе нет критичных данных:

```powershell
cd apps\backend
pnpm prisma migrate reset --force
```

### Шаг 2: Проверить конфигурацию Stripe

Убедиться, что в `.env` файле заполнены все необходимые ключи:

```env
# apps/backend/.env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_QUARTERLY=price_...
STRIPE_PRICE_ANNUAL=price_...
```

### Шаг 3: Настроить Webhook в Stripe Dashboard

1. Перейти в [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Создать новый webhook с URL: `https://your-domain.com/webhooks/stripe`
3. Выбрать события:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Скопировать `Signing secret` и добавить в `.env` как `STRIPE_WEBHOOK_SECRET`

### Шаг 4: Локальное тестирование с Stripe CLI

Для локальной разработки можно использовать Stripe CLI для прослушивания webhooks:

```powershell
# Установить Stripe CLI (если ещё не установлен)
# https://stripe.com/docs/stripe-cli#install

# Аутентифицироваться
stripe login

# Прослушивать webhooks и перенаправлять на localhost
stripe listen --forward-to localhost:4000/webhooks/stripe

# Stripe CLI выведет webhook secret - добавить его в .env
```

### Шаг 5: Запустить приложение

```powershell
# В корне проекта
pnpm dev
```

Приложение будет доступно:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Premium страница: http://localhost:5173/premium

### Шаг 6: Протестировать подписку

1. Зарегистрироваться или войти в приложение
2. Перейти на `/premium`
3. Выбрать план и нажать "Activate VivaForm+"
4. Использовать тестовую карту Stripe:
   - Номер: `4242 4242 4242 4242`
   - Дата: любая будущая
   - CVC: любые 3 цифры
5. Завершить оплату
6. Проверить, что:
   - Webhook получен в логах бэкенда
   - Подписка создана в БД
   - Пользователь получил роль `PREMIUM`

---

## 🔍 Проверка работы системы

### Проверка API

```bash
# Получить текущую подписку
curl -X GET http://localhost:4000/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Создать Checkout Session
curl -X POST http://localhost:4000/subscriptions/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly",
    "successUrl": "http://localhost:5173/dashboard?premium=success",
    "cancelUrl": "http://localhost:5173/premium?canceled=true"
  }'

# Создать Portal Session
curl -X POST http://localhost:4000/subscriptions/portal \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"returnUrl": "http://localhost:5173/settings"}'
```

### Проверка Guard

Добавить `@UseGuards(PremiumGuard)` к любому endpoint для проверки:

```typescript
@UseGuards(JwtAuthGuard, PremiumGuard)
@Get('premium-feature')
async getPremiumFeature() {
  return { message: 'This is a premium feature' };
}
```

---

## 📚 Использование в коде

### Backend

#### Защита endpoint с помощью Guard

```typescript
import { PremiumGuard } from '@/common/guards/premium.guard';

@UseGuards(JwtAuthGuard, PremiumGuard)
@Get('premium-recommendations')
async getPremiumRecommendations() {
  return this.service.getAdvancedRecommendations();
}
```

#### Использование декоратора

```typescript
import { RequiresPremium } from '@/common/decorators/requires-premium.decorator';

@RequiresPremium()
@Get('advanced-analytics')
async getAnalytics() {
  return this.analyticsService.getAdvanced();
}
```

### Frontend

#### Проверка статуса подписки

```typescript
import { useUserStore } from '@/store/user-store';

const user = useUserStore((state) => state.profile);
const isPremium = user?.tier === 'PREMIUM';

if (isPremium) {
  // Показать премиум-функции
}
```

#### Создание Checkout Session

```typescript
import { createCheckoutSession } from '@/api/subscriptions';

const handleSubscribe = async () => {
  const { url } = await createCheckoutSession({
    plan: 'monthly',
    successUrl: `${window.location.origin}/dashboard?premium=success`,
    cancelUrl: `${window.location.origin}/premium?canceled=true`,
  });

  if (url) {
    window.location.href = url;
  }
};
```

#### Открытие Customer Portal

```typescript
import { createPortalSession } from '@/api/subscriptions';

const handleManageBilling = async () => {
  const { url } = await createPortalSession({
    returnUrl: window.location.href,
  });

  if (url) {
    window.location.href = url;
  }
};
```

---

## 🐛 Troubleshooting

### Проблема: Webhook не принимается

**Решение:**
1. Проверить, что `STRIPE_WEBHOOK_SECRET` правильно указан в `.env`
2. Убедиться, что Stripe CLI запущен (для локальной разработки)
3. Проверить логи бэкенда на наличие ошибок валидации подписи

### Проблема: Подписка не создаётся после оплаты

**Решение:**
1. Проверить логи webhook в Stripe Dashboard
2. Убедиться, что в metadata присутствует `userId`
3. Проверить, что сервис `SubscriptionsService.handleCheckoutCompleted` выполняется

### Проблема: PremiumGuard не работает

**Решение:**
1. Убедиться, что `JwtAuthGuard` тоже добавлен
2. Проверить, что `user.tier` обновляется в БД после подписки
3. Проверить, что `PrismaService` правильно внедрён в Guard

---

## 📦 Структура файлов

```
apps/backend/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   └── requires-premium.decorator.ts
│   │   └── guards/
│   │       └── premium.guard.ts
│   ├── config/
│   │   └── stripe.config.ts
│   └── modules/
│       ├── stripe/
│       │   ├── stripe.module.ts
│       │   └── stripe.service.ts
│       ├── subscriptions/
│       │   ├── dto/
│       │   ├── subscriptions.controller.ts
│       │   ├── subscriptions.module.ts
│       │   └── subscriptions.service.ts
│       └── webhooks/
│           ├── webhooks.controller.ts
│           └── webhooks.module.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
        └── 20251104000001_add_subscription_enums_and_fields/
            └── migration.sql

apps/web/
├── src/
│   ├── api/
│   │   └── subscriptions.ts
│   └── pages/
│       └── premium-page.tsx
```

---

## ✅ Чеклист готовности к production

- [ ] Миграция базы данных применена
- [ ] Все Stripe ключи настроены (production keys)
- [ ] Webhook настроен в Stripe Dashboard на production URL
- [ ] Протестирован полный цикл подписки
- [ ] Протестирована отмена подписки
- [ ] Протестирован Customer Portal
- [ ] Добавлены аналитические события (GTM/GA4)
- [ ] Настроены email-уведомления
- [ ] Проверена работа PremiumGuard
- [ ] Документация обновлена

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверить логи бэкенда
2. Проверить [Stripe Dashboard → Logs](https://dashboard.stripe.com/test/logs)
3. Убедиться, что все ключи правильно настроены
4. Проверить состояние БД

---

## 🎉 Готово!

Система подписок VivaForm+ полностью реализована и готова к использованию после применения миграции базы данных.
