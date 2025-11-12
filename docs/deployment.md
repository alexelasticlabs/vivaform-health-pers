# Деплой и инфраструктура

Поддерживаются два пути:
- Docker Compose (локальная разработка)
- Kubernetes (Helm chart charts/vivaform, CI/CD через GitHub Actions)

## Локально (Docker Compose)
```bash
docker compose up --build
# Web: http://localhost:5173
# Backend: http://localhost:4000
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
# Alertmanager: http://localhost:9093
```

Переменные окружения docker-compose:
- STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MONTHLY/QUARTERLY/ANNUAL
- SMTP_USER/SMTP_PASSWORD (или SendGrid ключ)
- DATABASE_URL (уже настроен на db)
- REDIS_URL (redis://redis:6379)

## Kubernetes (Helm)
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm dependency update charts/vivaform

helm install vivaform charts/vivaform \
  --set image.registry=<registry> \
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

### CI/CD
- .github/workflows/cd.yml: build & push Docker images (latest, sha), SSH deploy (compose pull/up), миграции, health-check.
- Для K8s: можно добавить job миграций и helm upgrade шага; при необходимости подготовлю отдельный workflow.

### Секреты
- Helm: templates/secrets.yaml, все чувствительные env подключаются через secretKeyRef.
- Рекомендация: использовать ExternalSecrets/Vault для прод.

### Обновления/Откаты
```bash
helm upgrade vivaform charts/vivaform --set image.tag=<new-sha>
helm rollback vivaform <revision>
```

