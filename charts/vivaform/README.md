# VivaForm Helm Chart

Простой Helm Chart для деплоя VivaForm (backend + web + Postgres + Redis) с интеграцией метрик, логов и алертов.

## Особенности
- Backend + Web деплой с readiness/liveness probes
- Опциональные Postgres и Redis
- Secrets для чувствительных переменных (DATABASE_URL, STRIPE_* и др.)
- Ingress (Nginx) + альтернативный Traefik IngressRoute
- ServiceMonitor для Prometheus Operator
- PrometheusRule (алерты: 5xx, p95 latency, MRR zero, premium ratio drop)
- Loki + Promtail (опционально) для централизованных логов
- HPA для backend/web (CPU)

## Установка
```bash
helm dependency update charts/vivaform
helm install vivaform charts/vivaform \
  --set image.registry=ghcr.io/your-org \
  --set image.backendRepository=vivaform-backend \
  --set image.webRepository=vivaform-web \
  --set image.tag=<commit-sha> \
  --set backend.env.DATABASE_URL=postgresql://vivaform:vivaform@vivaform-postgres:5432/vivaform \
  --set backend.env.STRIPE_API_KEY=sk_test_xxx \
  --set backend.env.STRIPE_WEBHOOK_SECRET=whsec_xxx \
  --set backend.env.STRIPE_PRICE_MONTHLY=price_monthly \
  --set backend.env.STRIPE_PRICE_QUARTERLY=price_quarterly \
  --set backend.env.STRIPE_PRICE_ANNUAL=price_annual \
  --set backend.env.REDIS_URL=redis://vivaform-redis:6379 \
  --set ingress.host=prod.your-domain.com \
  --set monitoring.serviceMonitor=true \
  --set alerting.enabled=true \
  --set logging.loki.enabled=true \
  --set logging.promtail.enabled=true
```

## Обновление
```bash
helm upgrade vivaform charts/vivaform --set image.tag=<new-sha>
```

## Откат
```bash
helm rollback vivaform <revision>
```

## Отключение компонентов
```bash
--set postgres.enabled=false --set redis.enabled=false --set logging.loki.enabled=false --set logging.promtail.enabled=false --set alerting.enabled=false
```

## Настройка Ingress (Traefik)
```bash
--set ingress.traefikEnabled=true --set ingress.host=prod.your-domain.com
```

## Метрики
Экспортируются на /metrics backend:
- http_requests_total, http_request_duration_seconds_bucket (стандартные)
- vivaform_mrr_monthly{currency}
- vivaform_active_subscriptions
- vivaform_total_users
- vivaform_premium_ratio

## Логи
Promtail собирает stdout контейнеров и отправляет в Loki. Retention 7 дней (настраивается через values.logging.loki.config.table_manager.retention_period).

## Алерты (PrometheusRule)
- HighErrorRate (>5% 5xx за 5m)
- HighLatencyP95 (>800ms p95)
- BusinessMRRZero (ActiveSubs >0, но MRR=0)
- PremiumRatioDrop (падение >0.2 vs avg за 30m)

## Следующие шаги (рекомендации)
- Перейти на Secrets через внешние секрет-хранилища (ExternalSecrets, Vault)
- Добавить ingress аннотации для security headers / gzip
- Настроить Grafana dashboards через helm provisioning (уже готово для docker-compose; адаптируйте для k8s)
- Добавить PrometheusRule группировку по severity + маршруты Alertmanager
