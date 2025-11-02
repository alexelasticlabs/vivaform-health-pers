# VivaForm Mobile

Expo (SDK 54) мобильное приложение с Expo Router и TanStack Query.

## Скрипты

- `pnpm start` — запуск Expo Dev Tools
- `pnpm android` / `pnpm ios` — сборка для платформ
- `pnpm lint` — ESLint
- `pnpm test` — Vitest + React Native Testing Library (плейсхолдер)

## Переменные окружения

Укажите `EXPO_PUBLIC_API_URL` для связи с backend.
Дополнительно можно задать `EXPO_PUBLIC_CHECKOUT_SUCCESS_URL` и `EXPO_PUBLIC_CHECKOUT_CANCEL_URL`, если нужен собственный редирект после Stripe Checkout.