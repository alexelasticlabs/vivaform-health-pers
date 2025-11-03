# Deployment Checklist

## Pre-Deployment

### 1. Environment Setup ☐

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-token-secret-different-from-jwt"
JWT_ACCESS_TOKEN_TTL=900         # 15 minutes
JWT_REFRESH_TOKEN_TTL=2592000    # 30 days

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

# Frontend
FRONTEND_URL="https://yourdomain.com"

# Email (optional but recommended)
EMAIL_SERVICE_PROVIDER="sendgrid"  # or ses, mailgun
EMAIL_API_KEY="your-email-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Optional
NODE_ENV="production"
PORT=4000
```

#### Frontend (.env)
```bash
VITE_API_URL="https://api.yourdomain.com"
VITE_STRIPE_PUBLIC_KEY="pk_live_..."
```

#### Mobile (app.config.ts)
```typescript
export default {
  expo: {
    extra: {
      apiUrl: "https://api.yourdomain.com",
      eas: {
        projectId: "your-expo-project-id"
      }
    }
  }
}
```

### 2. Security Review ☐

- [ ] Все секреты в environment variables (не в коде)
- [ ] CORS настроен только для production доменов
- [ ] Rate limiting включен на всех endpoints
- [ ] Helmet.js настроен для security headers
- [ ] Database credentials rotation готов
- [ ] SSL/TLS сертификаты установлены

### 3. Database ☐

- [ ] Production PostgreSQL настроен
- [ ] Connection pooling (PgBouncer/RDS Proxy)
- [ ] Automated backups включены
- [ ] Миграции протестированы на staging
- [ ] Seeds готовы для initial data

**Запустить миграции:**
```bash
pnpm db:migrate:prod
```

### 4. Stripe ☐

- [ ] Production mode включен
- [ ] Products и Prices созданы в production
- [ ] Webhook endpoint зарегистрирован в Stripe Dashboard
  - URL: `https://api.yourdomain.com/webhooks/stripe`
  - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Webhook secret получен и добавлен в .env
- [ ] Test payment в production проведен успешно

### 5. Expo Push Notifications ☐

- [ ] Проект создан в https://expo.dev/
- [ ] projectId добавлен в app.config.ts
- [ ] projectId обновлен в use-push-notifications.ts
- [ ] APNs credentials загружены (iOS)
  - P8 key от Apple Developer
- [ ] FCM credentials загружены (Android)
  - google-services.json
- [ ] Test notification отправлено успешно

### 6. Email Service ☐

- [ ] Email провайдер выбран (SendGrid/AWS SES/Mailgun)
- [ ] API credentials получены
- [ ] Domain verification завершен
- [ ] SPF/DKIM/DMARC записи настроены
- [ ] Email templates созданы:
  - Welcome email
  - Email verification
  - Password reset
  - Subscription confirmation

## Deployment Steps

### Backend Deployment

#### Option A: Docker
```bash
cd apps/backend
docker build -t vivaform-backend .
docker push your-registry/vivaform-backend:latest
```

#### Option B: Node.js Server
```bash
cd apps/backend
pnpm install --prod
pnpm build
pnpm db:migrate:prod
node dist/main.js
```

#### Recommended: PM2
```bash
pm2 start dist/main.js --name vivaform-backend
pm2 save
pm2 startup
```

### Frontend Deployment

#### Static Hosting (Vercel/Netlify/Cloudflare Pages)
```bash
cd apps/web
pnpm build
# Upload dist/ folder
```

#### Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/vivaform/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Mobile Deployment

#### iOS (TestFlight)
```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios
```

#### Android (Google Play)
```bash
cd apps/mobile
eas build --platform android --profile production
eas submit --platform android
```

## Post-Deployment

### 1. Health Checks ☐

```bash
# Backend
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
curl https://yourdomain.com
# Expected: 200 OK

# Database
pnpm --filter @vivaform/backend prisma db pull
# Should show no schema changes
```

### 2. Monitoring Setup ☐

- [ ] Error tracking (Sentry)
  ```bash
  npm install @sentry/node @sentry/react
  ```
- [ ] Application metrics (Prometheus/Grafana)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Database monitoring (pg_stat_statements)
- [ ] Log aggregation (CloudWatch/Datadog)

### 3. Alerts Configuration ☐

- [ ] API errors > 100/hour → notify team
- [ ] Database CPU > 80% → notify ops
- [ ] Stripe webhook failures → notify dev
- [ ] Cron job failures → notify dev
- [ ] SSL certificate expiry < 30 days → notify ops

### 4. Performance ☐

- [ ] CDN настроен для static assets
- [ ] Database indexes проверены
- [ ] Query performance проверен (< 100ms p95)
- [ ] API response time < 200ms p95
- [ ] Frontend bundle size < 1MB

### 5. User Acceptance Testing ☐

- [ ] Registration flow
- [ ] Quiz submission (anonymous + authenticated)
- [ ] Login/logout
- [ ] Premium checkout → payment → tier upgrade
- [ ] Email verification link
- [ ] Push notification delivery
- [ ] Meal plan generation
- [ ] Food search autocomplete
- [ ] Water/weight tracking
- [ ] Admin panel access

### 6. Documentation ☐

- [ ] API documentation published (Swagger/Postman)
- [ ] Admin runbook created
- [ ] Incident response procedure
- [ ] Rollback procedure
- [ ] Database backup restore tested

## Rollback Plan

### Backend
```bash
# Revert to previous version
docker pull your-registry/vivaform-backend:previous
docker restart vivaform-backend

# Or with PM2
pm2 stop vivaform-backend
git checkout previous-tag
pnpm build
pm2 restart vivaform-backend
```

### Database
```bash
# Rollback migration
cd apps/backend
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### Frontend
```bash
# Redeploy previous version
vercel rollback
# Or manually upload previous dist/
```

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor API response times
- Review Stripe webhook deliveries

**Weekly:**
- Database backup verification
- Security patch updates
- User metrics review

**Monthly:**
- SSL certificate check
- Dependency updates
- Performance audit
- Cost optimization review

### Backup Strategy

**Database:**
- Automated daily backups (retained 30 days)
- Weekly full backups (retained 3 months)
- Point-in-time recovery enabled

**Code:**
- Git tags for each production release
- Docker images versioned and retained

---

## Emergency Contacts

- **DevOps Lead:** [contact]
- **Backend Lead:** [contact]
- **Product Owner:** [contact]
- **Stripe Support:** support@stripe.com
- **Database Admin:** [contact]

---

## Success Criteria

- [ ] Zero downtime deployment
- [ ] All health checks passing
- [ ] Error rate < 0.1%
- [ ] API response time p95 < 200ms
- [ ] At least one successful test payment
- [ ] Push notifications working
- [ ] Email delivery confirmed
- [ ] User can complete full signup → payment flow

---

**Last Updated:** 2025-11-03  
**Reviewed By:** [Your Name]  
**Approved By:** [Approver Name]
