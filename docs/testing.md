# Тестирование

## Unit и интеграционные тесты
- Web (Vitest + Testing Library):
```bash
pnpm --filter @vivaform/web test:run -- --reporter dot
```
- Backend (Vitest):
```bash
pnpm --filter @vivaform/backend test -- --run --reporter dot
```

## E2E (Playwright)
- Seed E2E-пользователь создаётся при prisma:seed:
  - Email: seed-user@example.com (или E2E_USER_EMAIL)
  - Пароль: SeedPass123! (или E2E_USER_PASSWORD)
- Запуск:
```bash
pnpm --filter @vivaform/web run e2e
```

## Отчёты
- coverage/ и отчёты Vitest доступны после запуска соответствующих скриптов.

