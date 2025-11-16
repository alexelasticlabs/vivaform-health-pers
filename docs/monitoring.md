# Мониторинг, алерты и логи

## Метрики
- HTTP: http_requests_total, http_request_duration_seconds_bucket/quantiles
- Бизнес: vivaform_mrr_monthly{currency}, vivaform_active_subscriptions, vivaform_total_users, vivaform_premium_ratio
- Точки: /metrics и /health

## Prometheus в k8s
- ServiceMonitor включается values.monitoring.serviceMonitor=true
- Правила алертов — PrometheusRule (templates/prometheusrule.yaml), включается values.alerting.enabled=true
  - HighErrorRate (warning/critical)
  - HighLatencyP95/P99
  - BusinessMRRZero / BusinessMRRDrop
  - PremiumRatioDrop
  - DeadmanNoMetrics

## Grafana
- Docker Compose: provisioning datasource и dashboards из monitoring/
- Kubernetes: используйте kube-prometheus-stack или импортируйте dashboards вручную; можно добавить provisioning как отдельный шаг.

## Логи (Loki)
- В Helm: dependencies grafana/loki и grafana/promtail
- Включение: values.logging.loki.enabled=true, values.logging.promtail.enabled=true
- Retention 7 дней (настраивается)
- Просмотр: Grafana → Explore → источник Loki

