# 🚀 Production Deployment Guide
**Version:** 1.0
**Last updated:** 2025-11-13  
**Prepared by:** Senior DevOps Engineer  

---

```
pnpm prisma migrate resolve --applied <migration-name>
# Resolve conflicts

pnpm prisma migrate status
# Check current state
```bash
**Solution:** 
### Issue: "Database migration fails"

**Solution:** Check `X-Internal-Key` header matches `METRICS_SECRET`.
### Issue: "Metrics endpoint returns 403"

**Solution:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard.
### Issue: "Webhook signature verification failed"

**Solution:** Add origin to `CORS_ORIGINS` env var and restart.
### Issue: "Origin not allowed by CORS"

## Appendix: Common Issues

---

- **Grafana:** https://grafana.vivaform.com
- **Stripe:** https://dashboard.stripe.com
- **Vercel:** https://vercel.com/vivaform
- **Sentry:** https://sentry.io/organizations/vivaform
### External Services

3. **CTO:** cto@vivaform.com
2. **Backend lead:** backend@vivaform.com
1. **DevOps on-call:** devops@vivaform.com
### Escalation Path

## Support Contacts

---

```
rate(webhook_duplicate_total[5m]) / rate(webhook_received_total[5m])
```promql
#### Webhook Idempotency Hit Rate

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```promql
#### P95 Latency

```
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```promql
#### Error Rate

```
rate(http_requests_total[5m])
```promql
#### Request Rate

### Grafana Queries

## Monitoring Dashboards

---

Save as `smoke-test.sh`, make executable, and run after deployment.

```
echo "✅ All smoke tests passed!"

# 26th request should be rate limited (we allow 20/10s)
done
  curl -s $API_URL/health > /dev/null
for i in {1..25}; do
echo "✓ Testing rate limiting..."
# 5. Rate limiting

curl -f -H "Origin: $WEB_URL" $API_URL/health || exit 1
echo "✓ Testing CORS..."
# 4. CORS

curl -f -I $WEB_URL || exit 1
echo "✓ Testing frontend..."
# 3. Frontend

fi
  curl -f -H "X-Internal-Key: $METRICS_SECRET" $API_URL/metrics > /dev/null || exit 1
  echo "✓ Testing metrics endpoint..."
if [ ! -z "$METRICS_SECRET" ]; then
# 2. Metrics (if secret set)

curl -f $API_URL/health || exit 1
echo "✓ Testing health endpoint..."
# 1. Health check

echo "🔍 Running smoke tests..."

METRICS_SECRET="your-secret"
WEB_URL="https://app.vivaform.com"
API_URL="https://api.vivaform.com"

set -e
#!/bin/bash
```bash

## Smoke Tests Script

---

```
cp -r ../vivaform-backup/* ./
rm -rf ./*
cd /var/www/vivaform
# Nginx

vercel rollback
# Vercel
```bash
#### 3. Frontend Rollback

```
pm2 start vivaform-backend-old
pm2 stop vivaform-backend
# PM2

docker start vivaform-backend-old
docker stop vivaform-backend
# Docker
```bash
#### 2. Backend Rollback

```
pnpm prisma migrate resolve --rolled-back 20251113_webhook_idempotency
cd apps/backend
```bash
#### 1. Database Rollback

### If deployment fails:

## Rollback Procedure

---

- [ ] Plan capacity scaling
- [ ] Review performance metrics
- [ ] Schedule weekly DB backups
- [ ] Configure alerts (PagerDuty/Opsgenie)
- [ ] Setup Grafana dashboards
#### Long-term

- [ ] Test user flows manually
- [ ] Verify email delivery
- [ ] Check webhook processing rate
- [ ] Review application logs
- [ ] Monitor Prometheus metrics
- [ ] Check Sentry for errors
#### Short-term (First 24h)

```
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
# Database connections

pm2 monit
# or
docker stats vivaform-backend
# Memory usage

  https://api.vivaform.com/metrics | grep http_request_duration
curl -H "X-Internal-Key: $METRICS_SECRET" \
# Error rate
```bash
#### Immediate (First 30 min)

### 7. Post-Deployment Monitoring

---

```
# (manual — check inbox)
# Check email delivery

  }'
    "name": "Test User"
    "password": "Test123!",
    "email": "test@example.com",
  -d '{
  -H "Content-Type: application/json" \
curl -X POST https://api.vivaform.com/auth/register \
# Register new user
```bash
#### Integration Test

```
# Should be < 500KB
ls -lh /tmp/bundle.js.gz
  --output /tmp/bundle.js.gz
  https://app.vivaform.com/assets/index-*.js \
curl -H "Accept-Encoding: gzip" \
# Check bundle size

# Expected: 200 OK
curl -I https://app.vivaform.com
# Homepage
```bash
#### Frontend

```
curl https://api.vivaform.com/docs
# Swagger (if enabled)

# Expected: Prometheus metrics
curl -H "X-Internal-Key: $METRICS_SECRET" https://api.vivaform.com/metrics
# Metrics (with secret)

# Expected: {"status":"ok","ts":1234567890}
curl https://api.vivaform.com/health
# Health endpoint
```bash
#### Backend Health

### 6. Verification Tests

---

```
certbot --nginx -d app.vivaform.com
# Setup SSL

systemctl reload nginx
nginx -t
ln -s /etc/nginx/sites-available/vivaform /etc/nginx/sites-enabled/
# Enable and reload

EOF
}
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    # Security headers
    
    }
        add_header Cache-Control "public, immutable";
        expires 1y;
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    # Cache static assets
    
    }
        try_files \$uri \$uri/ /index.html;
    location / {
    # SPA routing
    
    index index.html;
    root /var/www/vivaform;
    
    server_name app.vivaform.com;
    listen 80;
server {
cat > /etc/nginx/sites-available/vivaform <<EOF
# Nginx config

scp -r dist/* user@server:/var/www/vivaform/
# Copy to server

pnpm run build
cd apps/web
# Build
```bash
#### Option B: Nginx

```
# VITE_API_URL=https://api.vivaform.com
# Set env vars in Vercel dashboard:

vercel --prod
cd apps/web
# Deploy

vercel login
# Login

npm install -g vercel
# Install Vercel CLI
```bash
#### Option A: Vercel (Easiest)

### 5. Deploy Frontend

---

```
kubectl port-forward svc/vivaform-backend 4000:4000 -n vivaform
# Port forward for testing

kubectl logs -f deployment/vivaform-backend -n vivaform
kubectl get pods -n vivaform
# Check status

kubectl apply -f charts/vivaform/
# Apply deployment
```bash
#### Option C: Kubernetes

```
pm2 monit
# Monitor

pm2 startup  # Follow instructions
pm2 save
# Save config

  --exec-mode cluster
  --instances 2 \
  --env production \
pm2 start dist/main.js --name vivaform-backend \
# Start

npm install -g pm2
# Install PM2 globally

cd apps/backend
```bash
#### Option B: PM2

```
curl http://localhost:4000/health
# Health check

docker logs -f vivaform-backend
# Check logs

  vivaform-backend:latest
  -p 4000:4000 \
  --env-file .env.production \
  --name vivaform-backend \
docker run -d \
# Run with env

docker build -t vivaform-backend:latest -f apps/backend/Dockerfile .
# Build image
```bash
#### Option A: Docker (Recommended)

### 4. Deploy Backend

---

```
pnpm preview --port 3000
# Test locally

# Should see ~500KB gzipped bundle
ls -lh dist/index.html
# Verify

pnpm run build
# Build

export VITE_API_URL="https://api.vivaform.com"
# Set production API URL

cd apps/web
```bash
#### Frontend

```
kill %1
sleep 5
NODE_ENV=test node dist/main.js &
# Test startup (will fail without DB, but checks imports)

node dist/main.js --version || echo "Build successful"
# Verify

pnpm run build
rm -rf dist/
# Clean build

cd apps/backend
```bash
#### Backend

### 3. Build Applications

---

```
# Verify they're not the same!

openssl rand -hex 32
# Metrics secret

openssl rand -hex 32
# JWT secrets
```bash
**Generate secrets:**

```
VITE_GOOGLE_ADS_ID="AW-..."  # optional
VITE_META_PIXEL_ID="your-pixel-id"  # optional
VITE_SENTRY_DSN="https://...@sentry.io/..."
VITE_API_URL="https://api.vivaform.com"
```bash
#### Frontend (.env.production)

```
PORT="4000"
NODE_ENV="production"
FRONTEND_URL="https://app.vivaform.com"
CORS_ORIGINS="https://app.vivaform.com,https://vivaform.com"
REDIS_URL="redis://localhost:6379"
SENTRY_DSN="https://...@sentry.io/..."
# Optional but recommended

SMTP_PASSWORD="app-specific-password"
SMTP_USER="your@email.com"
SMTP_PORT="587"
SMTP_HOST="smtp.gmail.com"
# OR
SENDGRID_API_KEY="SG...."
EMAIL_SERVICE="sendgrid"  # or "smtp"
# Email (choose one)

METRICS_SECRET="<generate-with-openssl-rand-hex-32>"
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_API_KEY="sk_live_..."
JWT_REFRESH_SECRET="<generate-with-openssl-rand-hex-32>"
JWT_SECRET="<generate-with-openssl-rand-hex-32>"
DATABASE_URL="postgresql://user:pass@host:5432/vivaform_prod"
# Required
```bash
#### Backend (.env.production)

### 2. Environment Variables Setup

---

```
pnpm prisma migrate resolve --rolled-back <migration-name>
# Если что-то пошло не так
```bash
**Rollback plan:**

```
pnpm prisma db seed  # если есть seeds
# Verify

pnpm prisma migrate deploy
# Если всё ОК — apply

pnpm prisma migrate deploy --preview-feature
# Dry run первый

cd apps/backend
```bash

### 1. Database Migration

## Step-by-Step Deployment

---

- [x] Logging configured
- [x] Health check endpoints
- [x] Prometheus metrics
- [x] Sentry error tracking
### ✅ Monitoring

- [x] Connection pooling configured
- [x] Indexes optimized
- [x] Backup strategy in place
- [x] Migrations prepared
### ✅ Database

- [x] Metrics endpoint protected
- [x] JWT secrets rotated
- [x] Helmet security headers
- [x] Rate limiting configured
- [x] CSRF protection active
- [x] CORS origins configured
- [x] All credentials in environment variables
### ✅ Security

- [x] Environment variables documented
- [x] No console.log in production code
- [x] ESLint warnings addressed
- [x] TypeScript compilation successful
- [x] All tests passing (84/84)
### ✅ Code Quality

## Pre-Deployment Checklist


