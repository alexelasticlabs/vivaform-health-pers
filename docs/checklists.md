# Чек-листы

## Перед продакшен деплоем
- [ ] Все переменные окружения заполнены (Stripe, SMTP/SendGrid, DB, Redis)
- [ ] Миграции применены (`prisma migrate deploy`)
- [ ] /health → ok, /metrics доступен
- [ ] Grafana дашборды установлены
- [ ] Алерты Prometheus активны (нет статус UNKNOWN)
- [ ] Loki логи видны
- [ ] CI/CD workflow прошёл без ошибок
- [ ] Нагрузочный тест (минимальный) пройден (latency < целевых порогов)

## Перед релизом новой версии
- [ ] image.tag обновлён на commit SHA
- [ ] helm upgrade выполнен, pods в Ready
- [ ] Нет новых критических алертов
- [ ] Rollback сценарий задокументирован

## Инцидент
- [ ] Зафиксировать время и симптомы
- [ ] Проверить DeadmanNoMetrics, HighErrorRateCritical, HighLatencyP99
- [ ] Просмотреть логи в Loki (фильтр по component)
- [ ] Проверить redis доступность (latency, errors)
- [ ] Применить runbook из алерта

