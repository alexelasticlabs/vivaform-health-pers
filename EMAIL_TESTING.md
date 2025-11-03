# ✅ Email Configuration - РАБОТАЕТ!

## Текущая конфигурация Mailtrap

```env
EMAIL_SERVICE=smtp
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@vivaform.app
EMAIL_FROM_NAME=VivaForm Health
```

## ✅ Подтверждение работы

**Сервер запущен успешно:**
```
✅ SMTP connection verified successfully
📤 SMTP email service initialized (from: VivaForm Health <noreply@vivaform.app>)
```

**Email уже отправлен:**
```
✅ Email sent via SMTP to aleks.valmus2001@gmail.com: Your temporary VivaForm password
📧 Message ID: <3a27a952-5702-f42a-d56e-3004671483c1@vivaform.app>
```

## 🧪 Как тестировать email

### 1. Через Swagger UI
Открыть: http://localhost:4000/api

Найти endpoint: `POST /auth/test-email`

Body:
```json
{
  "email": "your-test@email.com"
}
```

### 2. Через PowerShell
```powershell
$body = @{ email = 'test@example.com' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:4000/auth/test-email' -Method Post -Body $body -ContentType 'application/json'
```

### 3. Через восстановление пароля
**Вариант 1: Reset Link**
```
POST http://localhost:4000/auth/forgot-password
{
  "email": "aleks.valmus2001@gmail.com"
}
```

**Вариант 2: Temporary Password**
```
POST http://localhost:4000/auth/request-temp-password
{
  "email": "aleks.valmus2001@gmail.com"
}
```

## 📬 Проверка в Mailtrap

1. Открыть: https://mailtrap.io/inboxes
2. Войти как: **alexelasticlabs**
3. Выбрать: **My Sandbox**
4. Все письма будут там!

## 📧 Типы email, которые отправляются

| Тип | Когда | Endpoint |
|-----|-------|----------|
| **Welcome Email** | После регистрации | Автоматически |
| **Email Verification** | После регистрации | `POST /auth/verify-email` |
| **Password Reset Link** | Запрос восстановления | `POST /auth/forgot-password` |
| **Temporary Password** | Запрос временного пароля | `POST /auth/request-temp-password` |
| **Test Email** | Ручная проверка | `POST /auth/test-email` |

## 🎨 Шаблоны email

Все шаблоны находятся в: `apps/backend/src/modules/email/email.service.ts`

- **Welcome Email**: Градиент blue→green, список функций, кнопка "Go to Dashboard"
- **Password Reset**: Зелёный градиент, кнопка "Reset Password", таймер 60 минут
- **Temp Password**: Крупный моноширинный шрифт пароля, инструкции, таймер 15 минут
- **Test Email**: Простой дизайн с галочкой ✅

## 🔍 Логи сервера

При отправке email в консоли появляется:
```
[EmailService] ✅ Email sent via SMTP to user@example.com: Subject
[EmailService] 📧 Message ID: <random-id@vivaform.app>
[EmailService] 📬 Check Mailtrap inbox: https://mailtrap.io/inboxes
```

## ⚠️ Важно

- В production замените на реальный SMTP (SendGrid, AWS SES, etc.)
- Mailtrap только для тестирования!
- Все email отправляются синхронно, для больших нагрузок используйте очереди (Bull, RabbitMQ)
