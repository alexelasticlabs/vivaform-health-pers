# Почта (SMTP/SendGrid)

## Режимы
- EMAIL_SERVICE=smtp: использовать SMTP_USER/SMTP_PASSWORD
- EMAIL_SERVICE=sendgrid: использовать SENDGRID_API_KEY

## Требования в прод
- Если production и EMAIL_SERVICE=sendgrid — обязателен SENDGRID_API_KEY (валидация при старте)
- Если production и EMAIL_SERVICE=smtp — обязательны SMTP_USER/SMTP_PASSWORD

## Отладка
- EMAIL_TESTING.md содержит подсказки для локальной проверки. Для прод — используйте песочницу или тестовый аккаунт.

