# VivaForm Backend

NestJS 11 + Prisma 6 сервис с авторизацией и базовыми сущностями VivaForm.

## Скрипты

- `pnpm dev` — запуск сервера в watch-режиме (ts-node-dev)
- `pnpm build` — компиляция в `dist`
- `pnpm test` — unit-тесты через Vitest
- `pnpm lint` — ESLint
- `pnpm prisma:migrate` — локальная миграция

## Переменные окружения

Скопируйте `.env.example` в `.env` и укажите доступ к PostgreSQL, JWT секреты и идентификаторы Stripe.

## API (черновик)

- `POST /auth/login` — выдаёт access/refresh токены
- `POST /auth/refresh` — обновление access token по refresh-токену
- `GET /auth/me` — получение текущего профиля (JWT)
- `POST /users` — регистрация пользователя
- `GET /health` — ping сервера
- `GET /dashboard/daily` — агрегированная статистика (калории, вода, вес, рекомендации)
- `GET/POST /nutrition` — дневник питания + суммарные БЖУ
- `GET/POST /water` — учёт воды и суммарный объём
- `GET/POST /weight` — история веса, прогресс и последняя запись
- `GET/POST /recommendations` — персональные рекомендации
- `GET /subscriptions` — статус VivaForm+
- `POST /subscriptions/checkout` — создание Stripe Checkout с планом (`monthly`, `quarterly`, `annual`)
- `POST /subscriptions/portal` — ссылка на Billing Portal для управления подпиской
- `POST /webhooks/stripe` — обработка событий Stripe (Checkout, Subscription lifecycle)

## Stripe интеграция

1. Настройте `STRIPE_API_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_QUARTERLY`, `STRIPE_PRICE_ANNUAL` и `STRIPE_WEBHOOK_SECRET` в `.env`.
2. Для локальной разработки запустите Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:4000/webhooks/stripe
   ```
3. В ответах на Checkout/Portal приходит `url`, которую нужно открыть на фронтенде.