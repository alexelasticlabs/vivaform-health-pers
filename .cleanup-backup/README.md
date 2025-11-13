# VivaForm

Монорепозиторий приложения для питания и здоровья.

Полная документация перенесена в папку `docs/` и объединяет ранее разрозненные файлы.

- Быстрый старт: см. `docs/README.md`
- Архитектура: `docs/architecture.md`
- Деплой (Docker/Helm), CI/CD: `docs/deployment.md`
- Мониторинг/Алерты/Логи: `docs/monitoring.md`
- Тестирование: `docs/testing.md`
- Подписки Stripe: `docs/subscription.md`
- Почта: `docs/email.md`
- Безопасность/GDPR: `docs/security-compliance.md`
- Чек-листы: `docs/checklists.md`

Команды (Windows cmd):
```bat
pnpm i
pnpm --filter @vivaform/backend dev
pnpm --filter @vivaform/web dev
```
