# VivaForm Health

🥗 Кроссплатформенная платформа для осознанного питания и здорового образа жизни

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-29%20passing-green)](.)

---

## 🎯 О проекте

VivaForm Health - это комплексное решение для управления питанием, отслеживания здоровья и достижения фитнес-целей. Приложение включает веб-версию, мобильные приложения для iOS/Android и мощный backend с интеграциями Stripe и push-уведомлениями.

### ✨ Основные возможности

- 📊 **Персонализированные планы питания** - на основе quiz и целей пользователя
- 🍎 **База продуктов** - 60+ продуктов с макронутриентами и калориями
- 💧 **Трекинг воды** - напоминания о регидратации
- ⚖️ **Отслеживание веса** - динамика и тренды
- 💎 **Premium подписки** - через Stripe с автоматическим биллингом
- 🔔 **Push-уведомления** - напоминания и мотивация
- 👤 **Персональный дашборд** - агрегированная статистика
- 🔐 **Безопасная аутентификация** - JWT + Refresh Tokens

---

## 📁 Структура проекта

```
vivaform-health-pers/
├── apps/
│   ├── backend/          # NestJS API сервер
│   ├── web/              # React веб-приложение
│   └── mobile/           # Expo React Native приложение
├── packages/
│   └── shared/           # Общие типы и утилиты
├── PROJECT_STATUS.md     # Полный статус проекта
├── DEPLOYMENT.md         # Руководство по deployment
├── QUICK_START.md        # Быстрый старт для разработчиков
└── FINAL_REPORT.md       # Отчет о последних исправлениях
```

---

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- pnpm 10.19+
- PostgreSQL 14+
- Stripe account (test mode)

### Установка

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd vivaform-health-pers

# 2. Установить зависимости
pnpm install

# 3. Настроить environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
# Отредактируйте .env файлы

# 4. Применить миграции и seeds
pnpm db:migrate
pnpm db:seed

# 5. Запустить все приложения
pnpm dev
```

📖 **Подробная инструкция:** [QUICK_START.md](QUICK_START.md)

---

## 🧪 Тестирование

```bash
# Все тесты
pnpm test:run

# Backend тесты
cd apps/backend && pnpm test

# Frontend тесты
cd apps/web && pnpm test

# Health check всего проекта
pnpm health
```

**Статус:** ✅ 29/29 тестов проходят

---

## 🛠️ Технологический стек

### Backend
- **NestJS 11** - Node.js framework
- **Prisma 6** - ORM и type-safe DB access
- **PostgreSQL** - реляционная БД
- **JWT** - аутентификация
- **Stripe** - payment processing
- **Expo Server SDK** - push notifications
- **Vitest** - unit testing

### Frontend (Web)
- **React 19** - UI library
- **Vite 6** - build tool
- **TanStack Query** - server state management
- **Zustand** - client state management
- **Tailwind CSS 4** - styling
- **Radix UI** - accessible components

### Mobile
- **Expo** - React Native framework
- **Expo Router** - navigation
- **Expo Notifications** - push notifications
- **Expo SecureStore** - secure token storage

### DevOps
- **Turborepo** - monorepo build system
- **pnpm** - package manager
- **TypeScript 5.7** - type safety
- **ESLint** - code quality

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [QUICK_START.md](QUICK_START.md) | Быстрый старт для разработчиков |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Полный статус проекта и roadmap |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [FINAL_REPORT.md](FINAL_REPORT.md) | Отчет о последних исправлениях |
| [apps/mobile/PUSH_NOTIFICATIONS.md](apps/mobile/PUSH_NOTIFICATIONS.md) | Настройка push-уведомлений |
| [ROADMAP.md](ROADMAP.md) | Product roadmap |

### API Documentation

Backend API документация доступна через Swagger:
```
http://localhost:4000/api
```

---

## 🔧 Полезные команды

```bash
# Development
pnpm dev                    # Запустить все приложения
pnpm build                  # Собрать все packages

# Testing
pnpm test:run              # Запустить все тесты
pnpm health                # Health check проекта

# Database
pnpm db:migrate            # Применить миграции (dev)
pnpm db:migrate:prod       # Применить миграции (prod)
pnpm db:seed               # Заполнить тестовыми данными
pnpm db:studio             # Открыть Prisma Studio

# Individual apps
pnpm --filter @vivaform/backend dev
pnpm --filter @vivaform/web dev
pnpm --filter @vivaform/mobile start
```

---

## 🎯 Статус проекта

### ✅ Готово к production
- [x] Аутентификация (JWT + Refresh Tokens)
- [x] Email verification
- [x] Quiz для анонимных пользователей
- [x] Premium подписки через Stripe
- [x] Food search с autocomplete
- [x] Meal planning
- [x] Water/Weight tracking
- [x] Push notifications инфраструктура
- [x] Admin panel
- [x] Stripe webhooks

### ⚠️ Требуется настройка
- [ ] Expo Push Notifications (projectId)
- [ ] Email сервис (SendGrid/AWS SES)
- [ ] Production environment variables
- [ ] CI/CD pipeline

📊 **Детальный статус:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Backend Lead:** [Your Name]
- **Frontend Lead:** [Your Name]
- **Mobile Lead:** [Your Name]

---

## 📞 Support

Есть вопросы? Обращайтесь:
- 📧 Email: support@vivaform.com
- 💬 Telegram: @vivaform_support
- 📖 Docs: [Documentation](PROJECT_STATUS.md)

---

**Made with ❤️ by VivaForm Team**