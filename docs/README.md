# VivaForm — Документация

Добро пожаловать в документацию VivaForm. Этот репозиторий — монорепо (pnpm workspaces) с вебом (React/Vite), бэкендом (NestJS), мобильным приложением (Expo), общим пакетом и инфраструктурой (Docker/Helm).

Содержание:
- Архитектура: ./architecture.md
- Деплой и инфраструктура (Docker Compose, Kubernetes/Helm, CI/CD): ./deployment.md
- Мониторинг, алерты и логи (Prometheus, Grafana, Alertmanager, Loki): ./monitoring.md
- Тестирование (unit/e2e, seed-пользователь): ./testing.md
- Подписки и Stripe (оплата, вебхуки, кеш): ./subscription.md
- Почта (SMTP/SendGrid) и проверка письма: ./email.md
- Безопасность и соответствие (CSP, rate limit, GDPR): ./security-compliance.md
- Чек-листы для продакшена и релиза: ./checklists.md

Объединены и заменяют: ADMIN_DASHBOARD_DESIGN.md, DEPLOYMENT.md, E2E_TESTING_GUIDE.md, EMAIL_SETUP.md, EMAIL_TESTING.md, GDPR_COMPLIANCE.md, INFRASTRUCTURE.md, PRODUCTION_CHECKLIST.md, PRODUCTION_DEPLOYMENT_CHECKLIST.md, QUICK_START.md, ROADMAP.md, SUBSCRIPTION_* и прочие, теперь содержание перенесено в файлы выше.

Быстрый старт:
- Web dev: `pnpm --filter @vivaform/web dev`
- Backend dev: `pnpm --filter @vivaform/backend dev`
- Полный стек в Docker (локально): `docker compose up --build`
- Тесты web/backend: см. ./testing.md

Полезное:
- Helm-чарт: charts/vivaform
- Гайд по деплою и секретам: ./deployment.md
- Endpoints мониторинга: /metrics, /health
