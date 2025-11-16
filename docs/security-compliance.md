# Безопасность и соответствие

## Технические меры
- Helmet CSP, strict connectSrc
- Rate limiting (Throttler): short/medium/long окна
- Request ID middleware
- AllExceptionsFilter

## Данные
- Пароли хэшируются (argon2)
- Секреты — через Kubernetes Secrets/внешние секрет-менеджеры

## Соответствие
- GDPR: отзыв согласия, баннер ConsentBanner на web
- Логирование: Loki с retention; собирать только необходимые данные

## Рекомендации
- Подключить Sentry DSN в прод
- Регулярные обновления зависимостей
- Пентест/сканеры (OWASP ZAP) в CI по расписанию

