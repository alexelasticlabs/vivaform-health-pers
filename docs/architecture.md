# Архитектура VivaForm

## Обзор монорепозитория
- Менеджер пакетов: pnpm (workspaces)
- apps/backend — NestJS (Prisma, Stripe, Redis, Prometheus, Throttler)
- apps/web — React + Vite + React Query + Zustand
- apps/mobile — Expo (React Native)
- packages/shared — Общие типы/утилиты
- charts/vivaform — Helm chart для Kubernetes
- monitoring/ — конфиги Prometheus/Grafana/Alertmanager (docker-compose локально)

## Потоки данных
1. Пользователь (Web/Mobile) → API (REST, JWT auth) → Prisma (Postgres)
2. Подписки: Web → Stripe Checkout → Webhook (backend/webhooks/stripe) → SubscriptionsService → БД, обновление tier пользователя.
3. Метрики: Interceptor (HTTP) + BusinessMetricsService → prom-client → /metrics
4. Логи: в Kubernetes через promtail → Loki (опционально); локально — stdout + docker-compose.
5. Кеш Stripe цен и админских агрегатов: Redis.

## Основные модули backend
- AuthModule — JWT, refresh, verify email, password reset.
- SubscriptionsModule — Создание checkout/portal, синхронизация, история (audit лог).
- AdminModule — KPI, revenue trend, распределение, heatmap, тикеты и модерация продуктов.
- Nutrition/Water/Weight — Трекинг данных пользователя.
- Recommendations — Персональные рекомендации.
- StripeModule — Клиент Stripe + нормализация цен.
- WebhooksModule — Приём событий Stripe.
- AuditModule — Запись audit log действий подписок.

## Безопасность
- Rate limiting (Throttler): короткие/средние/длинные окна.
- Helmet + строгий CSP (connectSrc дополняется доменами аналитики).
- Глобальный AllExceptionsFilter для единого формата ошибок.
- Request ID middleware для трассировки.

## Кеши
- Redis: stripe:price:<priceId> (ценовые нормализованные данные), admin:* (агрегаты для панели администратора).
- TTL: цены (1ч), агрегаты (60–300 сек в зависимости от типа).

## Расширения
- HPA (CPU) для backend/web.
- PrometheusRule для алертов по ошибкам, латентности и бизнес метрикам.
- Loki/Promtail для агрегации логов.

## Диагностика
- /health — быстрый JSON {status, ts}
- /metrics — Prometheus формат (http_* + бизнес метрики).

## Обновление подписок
Sequence (checkout.session.completed):
1. Пользователь инициирует оплату → Stripe Checkout Session.
2. Stripe webhook → WebhooksController.handleStripeWebhook.
3. SubscriptionsService.handleCheckoutCompleted → upsert subscription + обновление tier пользователя.
4. Invalidation admin:* кешей.
5. BusinessMetricsService через плановый интервал обновит MRR.

## Диаграмма высокоуровневая (текст)
[Client] → [API Gateway NestJS] → [Prisma/Postgres]
[API] → [Stripe] (checkout) ↔ [Webhook → API]
[API] ↔ [Redis] (кеши)
[API] → [/metrics → Prometheus → Grafana]
[k8s Pods stdout] → [Promtail] → [Loki] → [Grafana Explore]

