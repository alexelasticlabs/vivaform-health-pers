# VivaForm Health - Quick Start Guide

## 🚀 Первый запуск

### 1. Установка зависимостей
```bash
pnpm install
```

### 2. Настройка Backend

#### Создайте `.env` файл в `apps/backend`:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-token-secret-different-from-jwt-secret"
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=2592000

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

# Frontend
FRONTEND_URL="http://localhost:5173"

# Optional
NODE_ENV="development"
PORT=4000
# Cron timezone (используется в планировщике задач; по умолчанию UTC)
APP_TIMEZONE="Europe/Moscow"

# Разрешённые источники для CORS (обязательны в production; запятая между значениями)
# Пример: "https://vivaform.app,https://app.vivaform.health"
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"

# Сид администратора (опционально, для быстрого доступа в dev)
ADMIN_SEED_ENABLE=1
ADMIN_SEED_EMAIL="admin@vivaform.local"
ADMIN_SEED_PASSWORD="ChangeMe123!"
ADMIN_SEED_NAME="Dev Admin"
```

#### Применить миграции и seeds:
```bash
pnpm db:migrate    # Применить миграции
pnpm db:seed       # Заполнить тестовыми данными
```

### 3. Настройка Frontend

#### Создайте `.env` файл в `apps/web`:
```bash
VITE_API_URL="http://localhost:4000"
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

### 4. Настройка Mobile (опционально)

#### Обновите `apps/mobile/app.config.ts`:
```typescript
export default {
  expo: {
    extra: {
      apiUrl: "http://localhost:4000",
      // Для push notifications (получите на expo.dev):
      eas: {
        projectId: "your-expo-project-id"
      }
    }
  }
}
```

---

## 🏃 Запуск разработки

### Запустить все сервисы одновременно:
```bash
pnpm dev
```

Или по отдельности:

```bash
# Backend (http://localhost:4000)
cd apps/backend
pnpm dev

# Web (http://localhost:5173)
cd apps/web
pnpm dev

# Mobile (Expo)
cd apps/mobile
pnpm start
```

---

## 🧪 Тестирование

```bash
# Все тесты
pnpm test:run

# Только backend
cd apps/backend
pnpm test

# Только web
cd apps/web
pnpm test

# Health check всего проекта
pnpm health
```

---

## 🗄️ Работа с базой данных

```bash
# Prisma Studio (GUI для БД)
pnpm db:studio

# Создать новую миграцию
cd apps/backend
npx prisma migrate dev --name your_migration_name

# Просмотреть статус миграций
npx prisma migrate status

# Сгенерировать Prisma Client
npx prisma generate
```

---

## 🔑 Тестовые пользователи (после seed)

### Admin:
- Email: `admin@vivaform.com`
- Password: `Admin123!`
- Role: `ADMIN`

### Regular User:
- Email: `user@vivaform.com`
- Password: `User123!`
- Role: `USER`

---

## 📝 API Endpoints

### Swagger Documentation
```
http://localhost:4000/api
```

### Основные endpoints:

#### Auth
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/refresh` - Обновление токенов
- `POST /auth/verify-email?token=...` - Верификация email

#### Quiz (анонимный доступ)
- `POST /quiz/submit` - Отправка quiz (не требует auth)

#### Subscriptions
- `GET /subscriptions` - Получить подписку
- `POST /subscriptions/checkout` - Создать Stripe checkout session
- `POST /subscriptions/portal` - Создать customer portal session

#### Nutrition
- `GET /nutrition/foods/search?query=...` - Поиск продуктов
- `GET /nutrition/foods/categories` - Категории продуктов

#### Admin (требует роль ADMIN)
- `GET /admin/stats` - Статистика системы

---

## 🐛 Troubleshooting

### Backend не запускается
```bash
# Проверьте БД
psql -U postgres -d dbname

# Проверьте миграции
cd apps/backend
npx prisma migrate status

# Пересоздайте БД
npx prisma migrate reset
```

В development частая причина — отсутствует `STRIPE_SECRET_KEY`. Установите тестовый ключ `sk_test_...` или временно добавьте его в `.env`. Без ключа сервис Stripe выбросит исключение и сервер упадёт, что приводит к ошибкам `ECONNREFUSED` во фронтенде.

Если фронтенд показывает `ECONNREFUSED` на запросы `/api/...`:
1. Убедитесь, что backend действительно слушает порт (по умолчанию `4000`):
  ```bash
  pnpm --filter @vivaform/backend dev
  ```
2. Проверьте, что переменная `PORT` не занята другим процессом.
3. Убедитесь, что в браузере нет кэша старых service worker (очистите приложение).
4. В production обязательно задайте корректный `CORS_ORIGINS`, иначе ответы будут отклоняться политикой CORS.

Порт можно проверить:
```bash
netstat -ano | findstr :4000
```

### Frontend CORS ошибки
Убедитесь, что `FRONTEND_URL` в backend `.env` соответствует вашему frontend URL.

### Тесты падают
```bash
# Очистите кеш
pnpm store prune

# Переустановите зависимости
rm -rf node_modules apps/*/node_modules
pnpm install

# Проверьте TypeScript
cd apps/backend && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
```

### Stripe webhook не работает локально
### Предупреждение CSP о frame-ancestors
Если видите предупреждение о `frame-ancestors` в meta-теге: директива удалена из HTML и теперь доставляется только через заголовки (Helmet / nginx). Это ожидаемое поведение.

### React Fast Refresh отключён / DevTools shim
Сообщение обычно связано с расширением браузера React DevTools. В кодовой базе нет пользовательского переопределения `__REACT_DEVTOOLS_GLOBAL_HOOK__`. Проверьте отключение проблемных расширений, если необходимо восстановить Fast Refresh.

Используйте Stripe CLI:
```bash
stripe listen --forward-to localhost:4000/webhooks/stripe
```

---

## 📚 Полезные ссылки

- [Backend README](apps/backend/README.md)
- [Prisma Schema](apps/backend/prisma/schema.prisma)
- [Project Status](PROJECT_STATUS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Final Report](FINAL_REPORT.md)

---

## 🎯 Быстрые команды

```bash
# Разработка
pnpm dev                 # Запустить все
pnpm build              # Собрать все

# Тестирование
pnpm test:run           # Все тесты
pnpm health             # Health check

# База данных
pnpm db:migrate         # Миграции
pnpm db:seed            # Seeds
pnpm db:studio          # GUI

# Очистка
rm -rf node_modules apps/*/node_modules .turbo
pnpm install
```

---

**Готово! Приятной разработки! 🚀**
