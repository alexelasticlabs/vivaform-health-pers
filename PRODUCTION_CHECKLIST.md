# VivaForm Production Checklist

Чеклист для запуска VivaForm в production.

## ✅ Backend Security & Infrastructure

### Rate Limiting ✅
- [x] ThrottlerModule настроен (5 req/s, 20 req/10s, 100 req/min)
- [x] @SkipThrottle для webhooks и health endpoints
- [x] Global ThrottlerGuard активирован

### Security Headers ✅
- [x] Helmet middleware с Content Security Policy
- [x] CORS настроен для production origins
- [x] CSP директивы для защиты от XSS

### Audit Logging ✅
- [x] AuditService для критичных событий (auth, payments, GDPR)
- [x] Structured logging для Sentry/CloudWatch integration
- [x] Таблица `AuditLog` добавлена и сохранение включено (prisma migration)

### Stripe Integration ✅
- [x] Boot-time config validation (OnModuleInit)
- [x] Захват priceId и metadata в webhooks
- [x] Расширенное логирование переходов статусов подписок
- [x] Webhook signature verification

### Email Service ✅
- [x] Dual-mode support: SendGrid + SMTP
- [x] Email verification flow (tokens JWT type=email_verification, 24h TTL)
- [x] Password reset flow
- [x] Welcome emails (suppressed in test mode)
- [x] Subscription confirmation emails
- [x] Dev endpoint /auth/test-email is protected by JWT guard

### Push Notifications ✅
- [x] Retry-логика с exponential backoff (3 попытки)
- [x] Логирование DeviceNotRegistered токенов
- [x] Валидация Expo push tokens
- [x] Периодическая очистка невалидных токенов из БД (cron + немедленное удаление)

### Quiz Endpoints ✅
- [x] /quiz/preview - анонимный доступ, расчёт BMR/TDEE/BMI + рекомендации; авторизованным сохраняем драфт
- [x] /quiz/submit - требует аутентификацию для сохранения результатов

---

## ✅ Frontend (Web)

### Premium Checkout ✅
- [x] API вызов `/subscriptions/checkout` с success_url и cancel_url
- [x] Loading states во время создания сессии
- [x] Error handling с визуальными уведомлениями
- [x] Отмена подписки через Stripe Customer Portal

### Settings Page ✅
- [x] Отображение текущей подписки
- [x] Кнопки upgrade с loading states
- [x] Toast notifications для ошибок
- [x] Refresh subscription status

---

## 🔄 In Progress / TODO

### Integration Tests (Task #6)
- [ ] E2E тесты: Auth flow (register → verify → login)
- [ ] E2E тесты: Quiz endpoints (/preview анонимный, /submit авторизованный)
- [ ] E2E тесты: Subscription lifecycle (checkout → webhook → tier upgrade)
- [ ] E2E тесты: Push notifications delivery
- [ ] Supertest + test database setup

### Infrastructure & Observability (Task #8)
- [ ] Sentry для error tracking (frontend + backend)
- [ ] Health check endpoints с метриками
- [ ] Response time monitoring
- [ ] Secrets management: AWS Secrets Manager / Doppler
- [ ] Deployment runbook:
  - [ ] Database migrations workflow
  - [ ] Rollback план
  - [ ] Zero-downtime deployment strategy

### GDPR Compliance (Task #9)
- [ ] Политика конфиденциальности (Privacy Policy)
- [ ] Медицинский disclaimer: "Не заменяет медицинскую консультацию"
- [ ] Data export endpoint (GDPR право на portability)
- [ ] Consent tracking для marketing emails
- [ ] Cookie banner и preferences
- [ ] Right to be forgotten (account deletion flow)

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vivaform

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_QUARTERLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Email Service
EMAIL_SERVICE=sendgrid  # or 'smtp'
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@vivaform.app
EMAIL_FROM_NAME=VivaForm

# Frontend URL
FRONTEND_URL=https://vivaform.app

# CORS Origins
CORS_ORIGINS=https://vivaform.app,https://www.vivaform.app
```

### Web (.env)
```bash
VITE_API_URL=https://api.vivaform.app
```

### Mobile (app.config.ts/env)
```bash
EXPO_PUBLIC_API_URL=https://api.vivaform.app
EXPO_PUBLIC_EAS_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Database Migrations

### Pending Migrations
- [x] **AuditLog table** - для audit logging системы (применена)

### Migration Commands
```bash
# Generate migration
pnpm --filter @vivaform/backend prisma migrate dev --name add_audit_log

# Apply in production
pnpm --filter @vivaform/backend prisma migrate deploy
```

---

## Deployment Steps

### Pre-deployment
1. ✅ Все тесты проходят (backend: 13/13)
2. ✅ TypeScript компиляция чистая
3. [ ] Integration тесты проходят
4. [ ] Security scan (npm audit, Snyk)
5. [ ] Environment variables настроены

### Deployment
1. Run database migrations: `prisma migrate deploy`
2. Build backend: `pnpm --filter @vivaform/backend build`
3. Build web: `pnpm --filter @vivaform/web build`
4. Deploy backend (with health check)
5. Deploy frontend (CDN/static hosting)
6. Verify health endpoints
7. Test critical flows:
   - Auth (login/register)
   - Subscription checkout
   - Webhook processing

### Post-deployment
1. Monitor error rates (Sentry)
2. Check logs for warnings
3. Verify Stripe webhooks working
4. Test push notifications
5. Monitor database performance

---

## Performance Targets

- API response time: < 200ms (p95)
- Page load time: < 2s (First Contentful Paint)
- Database query time: < 50ms (p95)
- Uptime: 99.9%

---

## Monitoring & Alerting

### Critical Alerts
- API error rate > 1%
- Database connection errors
- Failed Stripe webhooks
- Email delivery failures
- Push notification errors > 5%

### Dashboards
- User signups & conversions
- Subscription metrics (MRR, churn)
- API performance & error rates
- Database performance

---

## Support & Documentation

- [ ] User documentation (Help Center)
- [ ] API documentation (Swagger at /docs)
- [ ] Developer onboarding guide
- [ ] Incident response playbook
- [ ] Support ticket system

---

## Legal & Compliance

- [ ] Terms of Service
- [ ] Privacy Policy (GDPR compliant)
- [ ] Cookie Policy
- [ ] Medical Disclaimer
- [ ] Data Processing Agreement (DPA)

---

**Last Updated**: 2025-11-03
**Status**: 5/9 tasks completed, ready for integration testing phase
