# 🎯 Как зайти в Админ Dashboard

## 📋 Пошаговая инструкция

### 1️⃣ Убедись что backend запущен

```bash
# Открой новый терминал и запусти backend
pnpm --filter @vivaform/backend dev:free
```

Должно появиться:
```
[Nest] Backend started on port 4000 (CORS: http://localhost:5173, http://localhost:8081)
```

---

### 2️⃣ Убедись что frontend запущен

```bash
# В другом терминале запусти frontend
pnpm --filter @vivaform/web dev
```

Должно появиться:
```
➜  Local:   http://localhost:5173/
```

---

### 3️⃣ Войди на сайт

Открой браузер и перейди на:
**http://localhost:5173/login**

Введи свои данные:
- **Email:** `aleks.valmus2001@gmail.com`
- **Password:** (твой текущий пароль)

> **Если не помнишь пароль** — сбрось его:
> ```bash
> cd apps/backend
> pnpm admin reset-password aleks.valmus2001@gmail.com MyNewPass123!
> ```

---

### 4️⃣ Открой админ-панель

После успешного входа, перейди на:
**http://localhost:5173/app/admin**

Или кликни на пункт меню **"Admin"** в боковой панели (если видишь его).

---

## ✅ Что ты увидишь в админке:

### Главная страница админки
- **📊 KPI метрики:**
  - Общий доход (Revenue)
  - Активные подписки
  - Новые пользователи
  - Конверсия в Premium

- **📈 Графики:**
  - Revenue Trend (динамика дохода)
  - New Users (новые юзеры)
  - Subscription Distribution (распределение по планам)
  - Activity Heatmap (активность по дням недели)

- **⚙️ System Health:**
  - Database Status
  - Redis Status
  - Email Service Status

### Доступные разделы:
- **Users Management** — управление пользователями
- **Subscriptions** — управление подписками
- **Articles** — управление статьями
- **Support Tickets** — тикеты поддержки
- **Settings** — настройки системы

---

## 🔍 Проверка доступа

Если не видишь пункт "Admin" в меню или получаешь ошибку 403 Forbidden:

### 1. Проверь роль в БД:
```bash
cd apps/backend
pnpm admin:list
```

Должно быть:
```
2. aleks.valmus2001@gmail.com
   Role: ADMIN ✅
   Email Verified: ✅
```

### 2. Проверь токен:
- Открой DevTools (F12)
- Перейди в **Application → Local Storage → http://localhost:5173**
- Найди ключ `vivaform-auth`
- Проверь что `profile.role = "ADMIN"`

Если роль `USER` — перелогинься:
1. Нажми Logout
2. Войди заново
3. Проверь снова

### 3. Проверь логи backend:
При входе должно быть:
```
[AuthService] login success: userId=xxx, email=aleks.valmus2001@gmail.com, role=ADMIN
```

Если видишь `role=USER` — проблема с БД, повтори promote:
```bash
cd apps/backend
pnpm admin:promote aleks.valmus2001@gmail.com
```

---

## 🐛 Troubleshooting

### "Access Denied" или 403 при входе в /app/admin

**Причина:** Роль не `ADMIN` или токен устарел.

**Решение:**
```bash
# 1. Проверь роль
cd apps/backend
pnpm admin:list

# 2. Повысь снова (если нужно)
pnpm admin:promote aleks.valmus2001@gmail.com

# 3. Перелогинься на фронтенде
```

---

### "Invalid email or password"

**Решение — сбрось пароль:**
```bash
cd apps/backend
pnpm admin reset-password aleks.valmus2001@gmail.com NewPass123!
```

Затем войди с новым паролем.

---

### Backend не отвечает (ECONNREFUSED)

**Решение:**
```bash
# Освободи порт и запусти заново
cd apps/backend
pnpm dev:free
```

---

### "Email not verified" (но это не должно блокировать вход)

Email теперь верифицирован ✅. Но если нужно:
```bash
cd apps/backend
pnpm tsx scripts/verify-admin-email.ts aleks.valmus2001@gmail.com
```

---

## 📱 Быстрые команды

### Проверить список админов:
```bash
cd apps/backend
pnpm admin:list
```

### Сбросить пароль:
```bash
cd apps/backend
pnpm admin reset-password aleks.valmus2001@gmail.com MyNewPass123!
```

### Верифицировать email:
```bash
cd apps/backend
pnpm tsx scripts/verify-admin-email.ts aleks.valmus2001@gmail.com
```

### Запустить всё заново:
```bash
# Терминал 1 — Backend
pnpm --filter @vivaform/backend dev:free

# Терминал 2 — Frontend
pnpm --filter @vivaform/web dev
```

---

## ✅ Твой статус:

- ✅ **Email:** aleks.valmus2001@gmail.com
- ✅ **Role:** ADMIN
- ✅ **Email Verified:** ✅
- ✅ **Доступ к админке:** Готов

---

## 🎯 Финальный чеклист:

- [ ] Backend запущен на порту 4000
- [ ] Frontend запущен на порту 5173
- [ ] Зашёл на http://localhost:5173/login
- [ ] Ввёл email: `aleks.valmus2001@gmail.com`
- [ ] Ввёл пароль (если забыл — сбросил через CLI)
- [ ] Успешно вошёл (видишь dashboard)
- [ ] Перешёл на http://localhost:5173/app/admin
- [ ] Вижу админ-панель с метриками и управлением

---

**Готово! Теперь у тебя полный доступ к админ-панели! 🚀**

Если что-то не работает — пиши, разберёмся!

