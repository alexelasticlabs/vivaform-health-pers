# Подписки и Stripe

## Основное
- Цены задаются через env: STRIPE_PRICE_MONTHLY/QUARTERLY/ANNUAL
- Checkout: SubscriptionsService.createCheckoutSession → Stripe → success/cancel URL.
- Portal: SubscriptionsService.createPortalSession.

## Вебхуки Stripe
- /webhooks/stripe (raw body)
- Обработчик webhooks.controller.ts:
  - checkout.session.completed → handleCheckoutCompleted
  - invoice.payment_succeeded → handleSubscriptionUpdated
  - customer.subscription.updated → handleSubscriptionUpdated
  - customer.subscription.deleted → handleSubscriptionDeleted

## События
- Upsert subscription, обновление tier пользователя
- Audit лог (SUBSCRIPTION_CREATED / UPGRADED / CANCELLED)
- Инвалидация Redis admin:* кешей

## Кеширование цен
- Redis ключи: stripe:price:<priceId> (monthlyAmount, currency) TTL 1ч
- Нормализация интервалов (month, year, week, day)

## Бизнес метрики
- mrr: сумма нормализованных monthlyAmount всех ACTIVE подписок
- activeSubs: count ACTIVE
- premiumRatio: premiumUsers / totalUsers

