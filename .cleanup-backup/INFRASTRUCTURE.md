# Infrastructure & Observability Guide

Руководство по настройке production инфраструктуры для VivaForm.

## Observability Stack

### Sentry Error Tracking

#### Backend Setup

**1. Установка:**
```bash
cd apps/backend
pnpm add @sentry/node @sentry/profiling-node
```

**2. Конфигурация в `main.ts`:**
```typescript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

async function bootstrap() {
  // Initialize Sentry BEFORE creating the app
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }
        return event;
      }
    });
  }

  const app = await NestFactory.create(AppModule);
  
  // ... rest of bootstrap
}
```

**3. Global Exception Filter:**
```typescript
// src/common/filters/sentry-exception.filter.ts
import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Report to Sentry for 500 errors
    if (status >= 500) {
      Sentry.withScope((scope) => {
        scope.setUser({ id: request.user?.userId });
        scope.setTag('path', request.url);
        scope.setTag('method', request.method);
        Sentry.captureException(exception);
      });
    }

    super.catch(exception, host);
  }
}

// Apply in main.ts
app.useGlobalFilters(new SentryExceptionFilter());
```

**4. Environment Variables:**
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
```

#### Frontend Setup (Web)

**1. Установка:**
```bash
cd apps/web
pnpm add @sentry/react
```

**2. Конфигурация в `main.tsx`:**
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Wrap root component
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

**3. Error Boundary Component:**
```typescript
function ErrorFallback({ error, resetError }) {
  return (
    <div className="error-fallback">
      <h1>Что-то пошло не так</h1>
      <p>{error.message}</p>
      <button onClick={resetError}>Попробовать снова</button>
    </div>
  );
}
```

---

## Health Checks & Metrics

### Enhanced Health Endpoint

```typescript
// apps/backend/src/modules/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const startTime = Date.now();
    
    // Check database
    let dbStatus = 'ok';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'error';
    }

    // System info
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: dbStatus,
        latency: dbLatency
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      node: {
        version: process.version,
        env: process.env.NODE_ENV
      }
    };
  }

  async getMetrics() {
    // Add Prometheus-compatible metrics
    const metrics = {
      http_requests_total: await this.getRequestCount(),
      http_request_duration_seconds: await this.getAvgResponseTime(),
      active_users_total: await this.getActiveUsersCount(),
      subscriptions_active: await this.getActiveSubscriptionsCount()
    };

    return metrics;
  }

  private async getRequestCount(): Promise<number> {
    // Implement request counter (use Redis or in-memory)
    return 0;
  }

  private async getAvgResponseTime(): Promise<number> {
    // Implement response time tracking
    return 0;
  }

  private async getActiveUsersCount(): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    return count;
  }

  private async getActiveSubscriptionsCount(): Promise<number> {
    const count = await this.prisma.subscription.count({
      where: { status: 'active' }
    });
    return count;
  }
}
```

### Metrics Controller

```typescript
// apps/backend/src/modules/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthService } from "./health.service";

@SkipThrottle()
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Проверить статус API" })
  getHealth() {
    return this.healthService.getStatus();
  }

  @Get("metrics")
  @ApiOperation({ summary: "Получить метрики Prometheus" })
  async getMetrics() {
    const metrics = await this.healthService.getMetrics();
    
    // Return Prometheus format
    return Object.entries(metrics)
      .map(([key, value]) => `${key} ${value}`)
      .join('\n');
  }
}
```

---

## Secrets Management

### Option 1: AWS Secrets Manager

**1. Установка:**
```bash
cd apps/backend
pnpm add @aws-sdk/client-secrets-manager
```

**2. Secrets Service:**
```typescript
// src/common/secrets/secrets.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService implements OnModuleInit {
  private client: SecretsManagerClient;
  private secrets: Record<string, string> = {};

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      await this.loadSecrets();
    }
  }

  private async loadSecrets() {
    const secretName = process.env.AWS_SECRET_NAME || 'vivaform/production';
    
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);
      
      if (response.SecretString) {
        this.secrets = JSON.parse(response.SecretString);
        
        // Override env variables
        Object.entries(this.secrets).forEach(([key, value]) => {
          process.env[key] = value;
        });
      }
    } catch (error) {
      console.error('Failed to load secrets from AWS:', error);
      throw error;
    }
  }

  get(key: string): string | undefined {
    return this.secrets[key] || process.env[key];
  }
}
```

**3. Environment Variables:**
```bash
AWS_REGION=us-east-1
AWS_SECRET_NAME=vivaform/production
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### Option 2: Doppler

**1. Установка:**
```bash
# Install Doppler CLI
# macOS
brew install dopplerhq/cli/doppler

# Windows
scoop install doppler

# Linux
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/install.sh' | sudo bash
```

**2. Setup:**
```bash
# Login
doppler login

# Setup project
cd apps/backend
doppler setup

# Run with Doppler
doppler run -- pnpm start
```

**3. Production Deployment:**
```bash
# Generate service token
doppler configs tokens create production-api --config prd

# Use in deployment
DOPPLER_TOKEN=xxx doppler run -- node dist/main.js
```

---

## Logging Strategy

### Structured Logging

```typescript
// src/common/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.writeLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeLog('error', message, context, trace);
    
    // Report to Sentry
    Sentry.captureException(new Error(message), {
      contexts: { trace: { trace } }
    });
  }

  warn(message: string, context?: string) {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('debug', message, context);
    }
  }

  private writeLog(level: string, message: string, context?: string, trace?: string) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context,
      message,
      trace,
      env: process.env.NODE_ENV,
      version: process.env.npm_package_version
    };

    // JSON logging for production (CloudWatch, Datadog, etc.)
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}] ${context || this.context || 'App'} - ${message}`);
      if (trace) console.log(trace);
    }
  }
}
```

---

## Deployment Runbook

### Pre-Deployment Checklist

- [ ] All tests passing (unit + e2e)
- [ ] TypeScript compilation clean
- [ ] Security audit (`npm audit`, `pnpm audit`)
- [ ] Environment variables verified
- [ ] Database migrations ready
- [ ] Secrets configured in AWS/Doppler
- [ ] Sentry DSN configured
- [ ] Health check endpoints working
- [ ] Rate limits configured
- [ ] CORS origins set for production

### Database Migrations

**1. Generate Migration:**
```bash
cd apps/backend
pnpm prisma migrate dev --name add_new_feature
```

**2. Review SQL:**
```bash
cat prisma/migrations/<timestamp>_add_new_feature/migration.sql
```

**3. Apply in Production:**
```bash
# Backup first!
pg_dump -h <host> -U <user> vivaform_production > backup_$(date +%Y%m%d).sql

# Apply migration
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

**4. Rollback Plan:**
```bash
# Restore from backup
psql -h <host> -U <user> vivaform_production < backup_20251104.sql

# Or manual rollback
psql -h <host> -U <user> -d vivaform_production -f rollback.sql
```

### Deployment Steps

**1. Build Backend:**
```bash
cd apps/backend
pnpm build

# Verify build
ls -lh dist/
```

**2. Build Frontend:**
```bash
cd apps/web
pnpm build

# Verify build
ls -lh dist/
```

**3. Deploy Backend (Docker):**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @vivaform/backend build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

**4. Deploy with Zero Downtime:**
```bash
# Blue-Green Deployment
# 1. Deploy new version (green)
docker run -d --name vivaform-api-green -p 4001:4000 vivaform-api:latest

# 2. Health check
curl http://localhost:4001/health

# 3. Switch traffic (nginx/load balancer)
# Update upstream from :4000 to :4001

# 4. Stop old version (blue)
docker stop vivaform-api-blue
docker rm vivaform-api-blue

# 5. Rename green to blue
docker rename vivaform-api-green vivaform-api-blue
```

**5. Deploy Frontend (Static):**
```bash
# Upload to S3 + CloudFront
aws s3 sync apps/web/dist s3://vivaform-web-production --delete
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"

# Or Vercel
cd apps/web
vercel --prod
```

### Post-Deployment

**1. Verify Health:**
```bash
curl https://api.vivaform.app/health
```

**2. Check Logs:**
```bash
# Docker
docker logs -f vivaform-api-blue

# AWS CloudWatch
aws logs tail /aws/ecs/vivaform-api --follow

# Kubernetes
kubectl logs -f deployment/vivaform-api
```

**3. Monitor Sentry:**
- Check for new errors in Sentry dashboard
- Verify error rate hasn't spiked

**4. Test Critical Flows:**
- [ ] User registration
- [ ] Login
- [ ] Subscription checkout
- [ ] Webhook processing
- [ ] Push notifications

### Rollback Procedure

**1. Database Rollback:**
```bash
psql -h <host> -U <user> -d vivaform_production -f backup_20251104.sql
```

**2. Application Rollback:**
```bash
# Docker - revert to previous image
docker run -d --name vivaform-api-blue -p 4000:4000 vivaform-api:v1.2.3

# Kubernetes - rollback deployment
kubectl rollout undo deployment/vivaform-api

# Vercel - rollback to previous deployment
vercel rollback
```

**3. Clear CDN Cache:**
```bash
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

---

## Monitoring Alerts

### Critical Alerts

**1. Error Rate Spike:**
```yaml
# Sentry Alert Rule
alert: HighErrorRate
condition: error_count > 10 per minute
notify: slack, pagerduty
```

**2. Database Connection Errors:**
```yaml
alert: DatabaseDown
condition: health_check.database.status != 'ok'
notify: pagerduty
```

**3. High Response Time:**
```yaml
alert: SlowAPI
condition: http_request_duration_p95 > 1000ms
notify: slack
```

**4. Low Disk Space:**
```yaml
alert: DiskSpaceLow
condition: disk_usage > 85%
notify: slack
```

### Performance Monitoring

**Recommended Tools:**
- **Sentry Performance**: Transaction tracing, slow queries
- **Datadog**: APM, infrastructure monitoring
- **New Relic**: Full-stack observability
- **CloudWatch**: AWS-native monitoring
- **Prometheus + Grafana**: Self-hosted metrics

---

## Environment Variables Reference

### Backend Production
```bash
# App
NODE_ENV=production
PORT=4000
CORS_ORIGINS=https://vivaform.app,https://www.vivaform.app
FRONTEND_URL=https://vivaform.app

# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/vivaform

# JWT
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>

# Stripe
STRIPE_API_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_QUARTERLY=price_xxx
STRIPE_PRICE_ANNUAL=price_xxx

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@vivaform.app
EMAIL_FROM_NAME=VivaForm

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Secrets (if using AWS)
AWS_REGION=us-east-1
AWS_SECRET_NAME=vivaform/production
```

### Frontend Production
```bash
VITE_API_URL=https://api.vivaform.app
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

**Last Updated**: 2025-11-04
**Status**: Infrastructure guide готов для production deployment
