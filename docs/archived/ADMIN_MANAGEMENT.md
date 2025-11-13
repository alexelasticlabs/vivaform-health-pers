# 🔧 Управление администраторами VivaForm

Три способа создать и управлять администраторами в системе.

---

## 📋 Способ 1: CLI скрипты (Рекомендуется)

### Установка
```bash
cd apps/backend
pnpm install  # установит tsx автоматически
```

### Команды

#### Создать нового администратора
```bash
pnpm admin:create admin@example.com SecurePass123! "Super Admin"
```

#### Повысить существующего пользователя
```bash
pnpm admin:promote user@example.com
```

#### Показать всех администраторов
```bash
pnpm admin:list
```

#### Сбросить пароль
```bash
pnpm admin reset-password admin@example.com NewPass123!
```

#### Понизить администратора
```bash
pnpm admin demote admin@example.com
```

#### Справка
```bash
pnpm admin
```

---

## 🌱 Способ 2: Admin Seed (при запуске)

### 1. Отредактируй `.env`
```bash
ADMIN_SEED_ENABLE=1
ADMIN_SEED_EMAIL=admin@vivaform.local
ADMIN_SEED_PASSWORD=YourSecurePass123!
ADMIN_SEED_NAME=Admin User
```

### 2. Запусти backend
```bash
pnpm dev:free
```

### 3. Проверь логи
Должно появиться:
```
[AdminSeed] Создан аккаунт администратора email=admin@vivaform.local
```

### 4. Отключи seed
После создания админа закомментируй или удали:
```bash
# ADMIN_SEED_ENABLE=1
```

---

## 💾 Способ 3: Prisma Studio (GUI)

### 1. Открой Prisma Studio
```bash
cd apps/backend
pnpm prisma studio
```

Откроется http://localhost:5555

### 2. Найди пользователя
- Перейди в таблицу `User`
- Найди нужного пользователя по email

### 3. Измени роль
- Кликни на запись
- Измени поле `role` с `USER` на `ADMIN`
- Сохрани

---

## 🔍 Проверка доступа

### 1. Проверь роль в БД
```bash
cd apps/backend
pnpm prisma studio
# Или через SQL:
# SELECT id, email, role, "emailVerified" FROM "User" WHERE email = 'admin@example.com';
```

### 2. Попробуй войти
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPass123!"}'
```

Ожидаемый ответ:
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "ADMIN",
    ...
  },
  "tokens": { ... }
}
```

### 3. Проверь доступ к админке
После успешного входа:
- Открой http://localhost:5173/app/admin
- Должен открыться dashboard администратора

---

## 🐛 Решение проблем

### "Invalid email or password"

**Причина:** Email или пароль не совпадают с БД.

**Решение:**
1. Проверь email точно (регистрозависимый):
   ```bash
   pnpm admin:list
   ```

2. Сбрось пароль:
   ```bash
   pnpm admin reset-password admin@example.com NewPass123!
   ```

3. Проверь логи backend при входе (должно быть детальное логирование).

---

### "User not found"

**Причина:** Пользователь не создан.

**Решение:**
```bash
pnpm admin:create admin@example.com SecurePass123! "Admin User"
```

---

### "Access denied" в админке

**Причина:** Роль не `ADMIN` или токен устарел.

**Решение:**
1. Проверь роль:
   ```bash
   pnpm admin:list
   ```

2. Повысь пользователя:
   ```bash
   pnpm admin:promote your@email.com
   ```

3. Перелогинься на фронтенде.

---

## 📝 Best Practices

### Production
1. **Не используй Admin Seed в production** — создай админов вручную через CLI.
2. **Используй сильные пароли** — минимум 12 символов с цифрами и спецсимволами.
3. **Логируй действия админов** — все критичные операции пишутся в AuditLog.
4. **Регулярно ротируй пароли** — раз в 90 дней.

### Development
1. **Admin Seed удобен для dev** — включи в `.env.local`, выключи в `.env.example`.
2. **CLI для быстрых задач** — сброс паролей, временные админы.
3. **Prisma Studio для отладки** — визуальная проверка данных.

---

## 🔐 Безопасность

### Защита CLI скриптов
CLI требует прямого доступа к базе (`DATABASE_URL`). В production:
- Запускай только с локальной машины или bastion host.
- Не храни пароли в истории команд (используй переменные).
- Логируй выполнение CLI команд.

### Аудит
Все действия администраторов логируются:
- Логин: `AuditLog.action = USER_LOGIN`
- Изменение ролей: `AuditLog.action = ROLE_CHANGED` (если добавим)
- Запросы к админке: доступны в логах backend

---

## 📞 Поддержка

Если проблемы остались:
1. Включи debug логирование: `LOG_LEVEL=debug pnpm dev`
2. Проверь логи при попытке входа — будет детальная диагностика
3. Проверь БД напрямую через Prisma Studio

---

**Готово!** Теперь у тебя есть три способа управлять администраторами и полная диагностика проблем с авторизацией. 🎉

