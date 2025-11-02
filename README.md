# VivaForm Monorepo

Кроссплатформенная платформа VivaForm для осознанного питания и ЗОЖ.

## Структура

- `apps/web` — веб-клиент на Vite + React 19
- `apps/backend` — NestJS 11 API с Prisma и Stripe
- `apps/mobile` — Expo / React Native приложение
- `packages` — общие пакеты (пока пусто)

## Быстрый старт

```bash
pnpm install
pnpm dev # запускает все приложения через Turborepo
```

### Запуск по отдельности

- `pnpm --filter @vivaform/web dev`
- `pnpm --filter @vivaform/backend dev`
- `pnpm --filter @vivaform/mobile start`

## Дополнительно

- Используется Turborepo + pnpm
- Tailwind CSS 4 и Radix UI на вебе
- Expo Router и SecureStore на мобильном клиенте
- NestJS + Prisma и JWT/Stripe на backend
- Реализованы бэкенд-модули: питание, вода, вес, рекомендации, агрегированный дашборд