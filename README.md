# 🥗 VivaForm

**Платформа для здоровья и персонализированного питания**

Монорепозиторий (Turborepo) с полным стеком приложений: backend (NestJS), web (React), mobile (React Native).

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Запуск backend
pnpm --filter @vivaform/backend dev

# Запуск web
pnpm --filter @vivaform/web dev
```

**Полная инструкция:** [QUICK_START.md](./QUICK_START.md)

---

## 📚 Документация

**📖 [Полный индекс документации](./DOCUMENTATION_INDEX.md)** ← Начните здесь!

### 🎯 Основные документы
- **[Быстрый старт](./QUICK_START.md)** - Настройка окружения за 5 минут
- **[Текущий статус](./PROJECT_AUDIT_REPORT.md)** - Аудит проекта (2025-01-13)
- **[Roadmap](./ROADMAP.md)** - Планы развития

### 💻 Реализованные фичи
- **[Квиз-воронка](./ENHANCED_QUIZ_IMPLEMENTATION.md)** - 25 шагов с gamification
- **[Админ-панель](./ADMIN_PANEL_GUIDE.md)** - Полное управление системой
- **[База продуктов](./FOOD_DATABASE_IMPLEMENTATION.md)** - USDA + кастом

### 📖 Техническая документация
Все в папке **[docs/](./docs/README.md)**:
- [Архитектура](./docs/architecture.md) | [Деплой](./docs/deployment.md) | [Мониторинг](./docs/monitoring.md)
- [Тестирование](./docs/testing.md) | [Подписки](./docs/subscription.md) | [Email](./docs/email.md)
- [Безопасность](./docs/security-compliance.md) | [Чеклисты](./docs/checklists.md)

---

## 🏗️ Структура проекта

```
vivaform-health-pers/
├── apps/
│   ├── backend/          # NestJS API (PostgreSQL + Prisma)
│   ├── web/             # React + Vite SPA
│   └── mobile/          # React Native приложение
├── packages/
│   └── shared/          # Общий код
├── docs/                # Техническая документация
├── charts/              # Helm charts для Kubernetes
└── monitoring/          # Prometheus + Grafana конфиги
```

---

## ✨ Ключевые фичи

### ✅ Реализовано
- 🎯 **Интерактивный квиз** - 25 шагов с badges, exit intent, прогресс-бар
- 👥 **Админ-панель** - 7 страниц (users, foods, subscriptions, articles, support, settings)
- 💳 **Подписки Stripe** - monthly/quarterly/annual планы
- 📧 **Email система** - Mailgun + transactional templates
- 🔐 **JWT Auth** - Access + refresh tokens, роли
- 🍎 **Food DB** - USDA integration + custom foods + moderation
- 📊 **Мониторинг** - Prometheus + Grafana + алерты
- 🧪 **Тесты** - 27/27 backend tests passing

### 🔄 В разработке
- 📱 Мобильное приложение
- 🤖 AI рекомендации по питанию
- 🏋️ Интеграция с фитнес-трекерами

---

## 🧪 Тестирование

```bash
# Backend unit tests
pnpm --filter @vivaform/backend test

# Web E2E tests
pnpm --filter @vivaform/web test:e2e

# Backend E2E tests
pnpm --filter @vivaform/backend test:e2e
```

**Статус:** ✅ 27/27 тестов проходят

---

## 🚀 Деплой

### Development
```bash
docker-compose up
```

### Production (Kubernetes)
```bash
helm upgrade --install vivaform ./charts/vivaform -f values.prod.yaml
```

**Подробнее:** [DEPLOYMENT.md](./DEPLOYMENT.md) и [docs/deployment.md](./docs/deployment.md)

---

## 📊 Статус проекта

| Метрика | Статус |
|---------|--------|
| **TypeScript ошибки** | ✅ 0 |
| **Backend тесты** | ✅ 27/27 passing |
| **Квиз шагов** | ✅ 25/25 implemented |
| **Админ страниц** | ✅ 7/7 complete |
| **Production ready** | ✅ YES |

**Последний аудит:** 2025-01-13 ([детали](./PROJECT_AUDIT_REPORT.md))

---

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте feature branch
3. Следуйте [стандартам коммитов](./COMMIT_AND_PR_TEMPLATE.md)
4. Напишите тесты
5. Создайте Pull Request

**Руководства:**
- [Commit Guidelines](./COMMIT_AND_PR_TEMPLATE.md)
- [E2E Testing](./E2E_TESTING_GUIDE.md)
- [Backend E2E](./apps/backend/E2E_TESTING.md)

---

## 📄 Лицензия

Private

---

## 📞 Дополнительная информация

- **Полная документация:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **Быстрый старт:** [QUICK_START.md](./QUICK_START.md)
- **Техподдержка:** См. [docs/README.md](./docs/README.md)

