# ✅ Production Deployment Checklist

**Перед запуском в production выполните следующие шаги:**

## 🔐 Environment Variables (КРИТИЧНО)

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT (генерируйте криптографически стойкие секреты)
JWT_SECRET="<минимум-32-символа-случайная-строка>"
JWT_REFRESH_SECRET="<минимум-32-символа-другая-случайная-строка>"

# Stripe (production ключи)
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_QUARTERLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."

# Email (рекомендуется SendGrid)
EMAIL_SERVICE="sendgrid"
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="VivaForm Health"

# Мониторинг (обязательно!)
SENTRY_DSN="https://...@sentry.io/..."

# CORS (ваши production домены)
CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"

# URLs
FRONTEND_URL="https://app.yourdomain.com"
WEB_URL="https://yourdomain.com"

# Опционально
PORT=4000
NODE_ENV=production
```

### Web (.env.production)
```bash
# Backend API
VITE_API_URL="https://api.yourdomain.com"

# Stripe (публичный ключ)
VITE_STRIPE_PUBLIC_KEY="pk_live_..."

# Мониторинг
VITE_SENTRY_DSN="https://...@sentry.io/..."

# Marketing (опционально)
VITE_META_PIXEL_ID=""
VITE_GOOGLE_ADS_ID=""

# Analytics (опционально)
VITE_PRODUCT_ANALYTICS_PROVIDER="beacon"
VITE_PRODUCT_ANALYTICS_ENDPOINT=""
```

---

## 🔑 Генерация секретов

### JWT Secrets (минимум 32 символа)
```bash
# Linux/Mac
openssl rand -base64 48

# Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## ✅ Валидация перед запуском

### 1. Проверка тестов
```bash
pnpm test:run
# Ожидается: ✅ 21 passed
```

### 2. Проверка линтера
```bash
pnpm lint
# Ожидается: ✅ 0 errors, 0 warnings
```

### 3. Компиляция backend
```bash
pnpm --filter @vivaform/backend build
# Ожидается: успешная компиляция
```

### 4. Сборка web (с production env)
```bash
# Установите VITE_API_URL перед сборкой
VITE_API_URL="https://api.yourdomain.com" pnpm --filter @vivaform/web build
# Ожидается: успешная сборка
```

---

## 🗄️ База данных

### 1. Миграции
```bash
# Проверить pending миграции
pnpm db:migrate

# Production deployment (автоматически применяет миграции)
pnpm db:migrate:prod
```

### 2. Seed данных (опционально)
```bash
# Только для начальных данных (продукты, статьи)
pnpm db:seed
```

---

## 🎯 Stripe настройка

### 1. Webhook endpoint
Создайте webhook в Stripe Dashboard:
- URL: `https://api.yourdomain.com/webhooks/stripe`
- События:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 2. Price IDs
Создайте Products и Prices в Stripe Dashboard, скопируйте price IDs:
- Monthly: `price_...`
- Quarterly: `price_...`
- Annual: `price_...`

---

## 📧 Email настройка

### SendGrid (рекомендуется)
1. Создайте аккаунт на sendgrid.com
2. Верифицируйте sender email
3. Создайте API ключ
4. Установите в `SENDGRID_API_KEY`

### SMTP (альтернатива)
Настройте SMTP параметры вашего провайдера:
```bash
EMAIL_SERVICE="smtp"
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
```

---

## 🔍 Мониторинг

### Sentry
1. Создайте проекты для backend и frontend на sentry.io
2. Скопируйте DSN для каждого проекта
3. Настройте alerts для критичных ошибок

### Healthcheck
После deployment проверьте:
- ✅ `https://api.yourdomain.com/health` → status: "ok"
- ✅ `https://api.yourdomain.com/metrics` → Prometheus метрики

---

## 🚀 Deployment команды

### Backend
```bash
# Установка зависимостей
pnpm install --frozen-lockfile

# Миграции БД
pnpm db:migrate:prod

# Компиляция
pnpm --filter @vivaform/backend build

# Запуск
NODE_ENV=production pnpm --filter @vivaform/backend start
```

### Web
```bash
# Сборка
VITE_API_URL="..." pnpm --filter @vivaform/web build

# Деплой dist/ на статический хостинг (Vercel, Netlify, S3+CloudFront)
```

---

## ⚠️ КРИТИЧНЫЕ ПРОВЕРКИ

- [ ] **JWT_SECRET** установлен и минимум 32 символа
- [ ] **JWT_REFRESH_SECRET** установлен и отличается от JWT_SECRET
- [ ] **STRIPE_API_KEY** - production ключ (`sk_live_...`)
- [ ] **STRIPE_WEBHOOK_SECRET** настроен и соответствует Stripe webhook
- [ ] **DATABASE_URL** - production база данных
- [ ] **SENTRY_DSN** настроен для мониторинга ошибок
- [ ] **EMAIL_SERVICE** настроен (SendGrid или SMTP)
- [ ] **CORS_ORIGINS** содержит только production домены
- [ ] **VITE_API_URL** установлен в web production build

---

## 🧪 Smoke Tests после deployment

### 1. Backend Health
```bash
curl https://api.yourdomain.com/health
# Ожидается: {"status":"ok","database":{"status":"ok"},...}
```

### 2. API доступность
```bash
curl https://api.yourdomain.com/docs
# Ожидается: Swagger UI
```

### 3. Web доступность
Откройте в браузере: `https://yourdomain.com`
- [ ] Страница загружается
- [ ] Нет ошибок в консоли
- [ ] Регистрация работает
- [ ] Авторизация работает

### 4. Stripe integration
- [ ] Создание checkout session работает
- [ ] Webhook получает события
- [ ] Subscription статус обновляется

### 5. Email отправка
- [ ] Email verification приходит
- [ ] Welcome email приходит
- [ ] Password reset работает

---

## 🆘 Rollback Plan

При проблемах:

1. **Database** - не откатывать миграции автоматически
2. **Backend** - вернуть предыдущий деплой
3. **Web** - вернуть предыдущую сборку
4. **Логи** - проверить Sentry для ошибок

---

## 📞 Контакты поддержки

- Sentry: Мониторинг ошибок
- Stripe Dashboard: Payment issues
- Database logs: Connection/performance issues

---

**Последнее обновление:** 2025-01-12  
**Статус проекта:** ✅ Готов к production после настройки environment

