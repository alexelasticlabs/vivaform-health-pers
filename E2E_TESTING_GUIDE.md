# E2E Testing Guide — VivaForm Health

## Оглавление
- Архитектура
- Quick Start
- Helper Functions
- Best Practices
- Troubleshooting
- Примеры
- Fixtures
- Page Objects
- Real checkout (Stripe)

---

## Архитектура

### Структура e2e тестов
```
apps/web/e2e/
├── _helpers.ts              # Общие утилиты (моки API, auth)
├── fixtures.ts              # Общая фикстура с auth и моками
├── auth-flow.spec.ts        # Аутентификация
├── dashboard-ui.spec.ts     # Dashboard UI
├── dashboard-modals.spec.ts # Модалки (meal, water, weight)
├── hydration-kpi.spec.ts    # KPI гидратация
├── premium-*.spec.ts        # Премиум flow
└── articles-*.spec.ts       # Статьи
```

### Playwright конфигурация (пример)
```ts
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  webServer: { command: 'pnpm build && pnpm preview --port 5173', url: 'http://localhost:5173', reuseExistingServer: true }
});
```

---

## Quick Start

1) Установка браузеров
```cmd
pnpm --filter @vivaform/web run install-browsers
```

2) Запуск всех e2e
```cmd
pnpm --filter @vivaform/web run e2e
```

3) Запуск конкретного теста
```cmd
pnpm --filter @vivaform/web exec playwright test -g "Articles combo"
```

---

## Helper Functions

### `applyAuthAndDashboardMocks(page, options?)`

Применяет стандартные моки и авторизацию для приватных роутов.

ВАЖНО: Zustand user-store теперь хранится в sessionStorage (не localStorage).

- Устанавливает `sessionStorage['vivaform-auth']` в формате `{ state: { profile, accessToken, isAuthenticated }, version }`
- Выставляет флаг `__E2E_AUTH_OVERRIDE__` для обхода `RequireAuthOutlet`
- Мокает ключевые API:
  - `GET /api/auth/me`
  - `GET /api/dashboard/daily*`
  - `POST/GET /api/water`
  - `GET/POST /api/quiz/preview`, `GET /api/quiz/profile`
  - `GET /api/subscriptions/premium-view`
  - `POST /api/subscriptions/checkout`
  - `POST /api/subscriptions/sync-session`
  - `GET /api/subscriptions/history*`
  - catch-all `**/api/*`

Пример:
```ts
import { test, expect } from './fixtures';

test('Dashboard hydration', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/app');
  await expect(authenticatedPage.getByTestId('kpi-value-hydration')).toBeVisible();
});
```

---

## Fixtures

Используйте `apps/web/e2e/fixtures.ts` и импортируйте `test, expect` из него в любыми спеках, которые заходят на `/app` или `/premium`.

- Фикстура добавляет auth + централизованные моки.
- Значения по умолчанию: tier=FREE, waterTotal=0.

```ts
import { test, expect } from './fixtures';

test('example', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/app');
  await expect(authenticatedPage.getByText(/Dashboard/i)).toBeVisible();
});
```

---

## Best Practices

1) Ставьте моки ДО `goto()`
2) Для приватных роутов используйте общую фикстуру
3) Для квиза заполняйте обязательные поля (см. canGoNext()) либо примайте стор
4) Для UI проверок предпочитайте `data-testid`

---

## Troubleshooting

- Если редиректит на /login, значит нет auth override (проверьте, что тест импортирует `./fixtures`).
- Если видите оффлайн-баннер, значит API не мокнуты: добавьте маршруты до `goto` или используйте фикстуру.

---

## Real checkout (Stripe)

`premium-purchase.real.spec.ts` остаётся пропущенным по умолчанию. Запускайте вручную при наличии реальных ключей Stripe.

---

# Перенесено

Актуальная версия: docs/testing.md
