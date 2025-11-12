## 🧾 Аудит лог

Сервис `AuditService` логирует критичные действия: логины, изменения пароля, подписки, платежи.
- Таблица: `AuditLog` (Prisma модель)
- События подписки логируются в `SubscriptionsService`.

Пример использования:
```ts
await audit.logSubscriptionChange(userId, AuditAction.SUBSCRIPTION_CREATED, { subscriptionId, tier: 'PREMIUM' });
```
# VivaForm Health

🥗 Кроссплатформенная платформа для осознанного питания и здорового образа жизни

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-29%20passing-green)](.)

---

## 🎯 О проекте

VivaForm Health - это комплексное решение для управления питанием, отслеживания здоровья и достижения фитнес-целей. Приложение включает веб-версию, мобильные приложения для iOS/Android и мощный backend с интеграциями Stripe и push-уведомлениями.

### ✨ Основные возможности

- 📊 **Персонализированные планы питания** - на основе quiz и целей пользователя
- 🍎 **База продуктов** - 60+ продуктов с макронутриентами и калориями
- 💧 **Трекинг воды** - напоминания о регидратации
- ⚖️ **Отслеживание веса** - динамика и тренды
- 💎 **Premium подписки** - через Stripe с автоматическим биллингом
- 🔔 **Push-уведомления** - напоминания и мотивация
- 👤 **Персональный дашборд** - агрегированная статистика
- 🔐 **Безопасная аутентификация** - JWT + Refresh Tokens

---

## 📁 Структура проекта

```
vivaform-health-pers/
├── apps/
│   ├── backend/          # NestJS API сервер
│   ├── web/              # React веб-приложение
│   └── mobile/           # Expo React Native приложение
├── packages/
│   └── shared/           # Общие типы и утилиты
├── PROJECT_STATUS.md     # Полный статус проекта
├── DEPLOYMENT.md         # Руководство по deployment
├── QUICK_START.md        # Быстрый старт для разработчиков
└── FINAL_REPORT.md       # Отчет о последних исправлениях
```

---

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- pnpm 10.19+
- PostgreSQL 14+
- Stripe account (test mode)

### Установка

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd vivaform-health-pers

# 2. Установить зависимости
pnpm install

# 3. Настроить environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
# Отредактируйте .env файлы

# 4. Применить миграции и seeds
pnpm db:migrate
pnpm db:seed

# 5. Запустить все приложения
pnpm dev
```

📖 **Подробная инструкция:** [QUICK_START.md](QUICK_START.md)

---

## Локальная настройка

1. Установите Node.js LTS и pnpm.
2. Склонируйте репозиторий и выполните:

```bash
pnpm install
pnpm dev
```
3. Переменные окружения:
   - `VITE_API_URL` для web
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` для backend
   - `DATABASE_URL` для Prisma
4. Запустите миграции и сиды (опционально):
```bash
pnpm prisma:migrate
pnpm prisma:seed
```
5. Откройте http://localhost:5173 (web) и http://localhost:4000 (API health check: /health).

## Подписка

Флоу VivaForm+:
1. Пользователь авторизуется.
2. На странице `/premium` выбирает план и инициирует Stripe Checkout (`POST /subscriptions/checkout`).
3. После успешной оплаты Stripe возвращает на `successUrl` (`/app?premium=success&session_id=...`).
4. В `AppShell` при наличии `premium=success` и `session_id` вызывается `syncCheckoutSession`, подписка синхронизируется, показывается тост успешной активации.
5. Webhook Stripe (endpoint `/webhooks/stripe`) обновляет подписку и создает лог в истории.
6. История доступна на `/premium/history` (фильтры: действия, диапазон дат, пресеты 7/30/90 дней). Финансовые данные подтягиваются через `invoice.payment_succeeded`.

---

## 🧪 Тестирование (расширено)

Используем Vitest + Testing Library.
- Общие моки вынесены в `apps/web/src/test/mocks/common-mocks.ts`.
- Настройка окружения тестов: `apps/web/src/test/setup.ts` (мок IntersectionObserver, fetch, requestAnimationFrame).

Запуск:
```bash
# Все тесты web и backend
pnpm test:run
# Только web
pnpm --filter @vivaform/web test -- --run
# Только backend
pnpm --filter @vivaform/backend test -- --run
```

Добавлены тесты:
- Защита маршрута /premium (`premium-route.test.tsx`)
- Отсутствие вызова syncCheckoutSession без session_id (`dashboard-no-session.test.tsx`)

## Тестирование → E2E

- Установка браузера для Playwright (один раз):

```cmd
pnpm --filter @vivaform/web install-browsers
```

- Запуск dev-серверов (в разных окнах):

```cmd
pnpm --filter @vivaform/backend dev
pnpm --filter @vivaform/web dev
```

- Запуск e2e-тестов:

```cmd
pnpm run e2e
```

По умолчанию используется baseURL http://localhost:5173 (см. `apps/web/playwright.config.ts`).

---
## 💎 Подписка (Stripe)

Подписки реализованы через Stripe Checkout и Webhook:
- Endpoint создания сессии: `POST /subscriptions/checkout` (JWT required)
- Endpoint синхронизации после успешного Checkout: `POST /subscriptions/sync-session`
- Портал управления (отмена / смена плана): `POST /subscriptions/portal` (требует премиум, Guard)

Статусы синхронизируются через вебхуки Stripe (см. `webhooks` module). После успешной активации пользователь получает параметр `?premium=success&session_id=...` и фронтенд вызывает `syncCheckoutSession`.

### Guard для премиума
`StripeSubscriptionGuard` защищает эндпоинты с декоратором:
```ts
@PremiumOnly()
@UseGuards(StripeSubscriptionGuard)
```

### Обновление плана
Переход на премиум вызывает аудит лог `SUBSCRIPTION_UPGRADED`, успешная синхронизация создаёт `SUBSCRIPTION_CREATED`, отмена - `SUBSCRIPTION_CANCELLED`.

---

---

## 🛠️ Технологический стек

### Backend
- **NestJS 11** - Node.js framework
- **Prisma 6** - ORM и type-safe DB access
- **PostgreSQL** - реляционная БД
- **JWT** - аутентификация
- **Stripe** - payment processing
- **Expo Server SDK** - push notifications
- **Vitest** - unit testing

### Frontend (Web)
- **React 19** - UI library
- **Vite 6** - build tool
- **TanStack Query** - server state management
- **Zustand** - client state management
- **Tailwind CSS 4** - styling
- **Radix UI** - accessible components

### Mobile
- **Expo** - React Native framework
- **Expo Router** - navigation
- **Expo Notifications** - push notifications
- **Expo SecureStore** - secure token storage

### DevOps
- **Turborepo** - monorepo build system
- **pnpm** - package manager
- **TypeScript 5.7** - type safety
- **ESLint** - code quality

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [QUICK_START.md](QUICK_START.md) | Быстрый старт для разработчиков |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Полный статус проекта и roadmap |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [FINAL_REPORT.md](FINAL_REPORT.md) | Отчет о последних исправлениях |
| [apps/mobile/PUSH_NOTIFICATIONS.md](apps/mobile/PUSH_NOTIFICATIONS.md) | Настройка push-уведомлений |
| [ROADMAP.md](ROADMAP.md) | Product roadmap |

### API Documentation

Backend API документация доступна через Swagger:
```
http://localhost:4000/docs
```

---

## 🔧 Полезные команды

```bash
# Development
pnpm dev                    # Запустить все приложения
pnpm build                  # Собрать все packages

# Testing
pnpm test:run              # Запустить все тесты
pnpm health                # Health check проекта

# Database
pnpm db:migrate            # Применить миграции (dev)
pnpm db:migrate:prod       # Применить миграции (prod)
pnpm db:seed               # Заполнить тестовыми данными
pnpm db:studio             # Открыть Prisma Studio

# Individual apps
pnpm --filter @vivaform/backend dev
pnpm --filter @vivaform/web dev
pnpm --filter @vivaform/mobile start
```

---

## 🎯 Статус проекта

### ✅ Готово к production
- [x] Аутентификация (JWT + Refresh Tokens)
- [x] Email verification
- [x] Quiz для анонимных пользователей
- [x] Premium подписки через Stripe
- [x] Food search с autocomplete
- [x] Meal planning
- [x] Water/Weight tracking
- [x] Push notifications инфраструктура
- [x] Admin panel
- [x] Stripe webhooks

### ⚠️ Требуется настройка
- [ ] Expo Push Notifications (projectId)
- [ ] Email сервис (SendGrid/AWS SES)
- [ ] Production environment variables
- [ ] CI/CD pipeline

📊 **Детальный статус:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Backend Lead:** [Your Name]
- **Frontend Lead:** [Your Name]
- **Mobile Lead:** [Your Name]

---

## 📞 Support

Есть вопросы? Обращайтесь:
- 📧 Email: support@vivaform.com
- 💬 Telegram: @vivaform_support
- 📖 Docs: [Documentation](PROJECT_STATUS.md)

---

## 🧪 Demo/Mocks (DEV)

- В DEV доступны моки API:
  - Принудительно: `VITE_API_MOCKS=1` — мокаем `/auth/*`, `/subscriptions/*`, `/quiz/*`.
  - Автоматически: `VITE_AUTO_AUTH_MOCKS=1` — если бэкенд недоступен (Network/5xx), автоматически включим моки для `/auth/*` и расширенных эндпойнтов `/subscriptions/*`, `/quiz/*` для стабильного демо.
  - При активных моках в UI отображается бейдж “API mocks are active (demo mode)”.
  - При необходимости приглушить логи: `VITE_SILENCE_MOCK_LOGS=1`.

## 📈 Аналитика

- Маркетинговая аналитика (пиксели) включается только при consent.marketing.
- Продуктовая аналитика включается только при consent.analytics и поддерживает провайдеры:
  - `VITE_PRODUCT_ANALYTICS_PROVIDER=beacon|fetch|amplitude|posthog`
  - `VITE_PRODUCT_ANALYTICS_ENDPOINT` (для beacon/fetch)
  - `VITE_AMPLITUDE_API_KEY` (для amplitude)
  - `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` (для posthog)
- В DEV можно приглушить логи аналитики: `VITE_SILENCE_ANALYTICS_LOGS=1`.

---

## 🔧 Полезные переменные окружения (web)

- `VITE_API_URL` — адрес API в проде (обязателен)
- `VITE_API_MOCKS` — принудительные моки API в DEV
- `VITE_AUTO_AUTH_MOCKS` — авто-моки при недоступности бэкенда (DEV)
- `VITE_SILENCE_MOCK_LOGS` — приглушить логи моков
- `VITE_META_PIXEL_ID`, `VITE_GOOGLE_ADS_ID` — маркетинговые пиксели
- `VITE_PRODUCT_ANALYTICS_PROVIDER`, `VITE_PRODUCT_ANALYTICS_ENDPOINT`, `VITE_AMPLITUDE_API_KEY`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`
- `VITE_DEV_TOOLBOX` — включить React Buddy DevToolbox в DEV
````
