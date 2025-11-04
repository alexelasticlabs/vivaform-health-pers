# VivaForm Web

Vite + React 19 приложение для VivaForm. Включает Tailwind CSS 4, Radix UI и TanStack Query.

## Скрипты

- `pnpm dev` — локальная разработка (порт 5173, strict)
- `pnpm dev:5173` — запустить на 5173
- `pnpm dev:5174` — запустить на 5174 (если 5173 занят)
- `pnpm build` — типизация и production-сборка
- `pnpm test` — unit-тесты через Vitest
- `pnpm lint` — линтинг ESLint
- `pnpm format` — проверка форматирования Prettier

Примечания
- Если 5173 занят, используйте `pnpm dev:5174` и убедитесь, что бэкенд разрешает CORS с `http://localhost:5174` (в `.env` уже добавлено).
- Избегайте одновременного открытия вкладок на разных портах — это ломает HMR.