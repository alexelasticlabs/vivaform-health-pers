# Production Migration Guide

## Overview
This guide covers deploying database migrations for the VivaForm production environment.

## Prerequisites
- Production database credentials
- SSH access to production server (if applicable)
- Backup of current database
- Environment variables configured

## Migration Checklist

### Pre-Migration
- [ ] **Backup Database**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] **Review Migration Files**
  ```bash
  cd apps/backend
  ls prisma/migrations/
  ```
- [ ] **Test on Staging**
  - Deploy migrations to staging first
  - Verify application works correctly
  - Check for performance issues

### Migration Steps

#### 1. Set Production Environment Variables
```bash
export DATABASE_URL="postgresql://user:password@host:5432/vivaform_prod?schema=public"
export NODE_ENV=production
```

#### 2. Generate Prisma Client (if not built)
```bash
cd apps/backend
pnpm prisma generate
```

#### 3. Run Migrations
```bash
# Dry run to see what will be applied
pnpm prisma migrate status

# Apply migrations
pnpm prisma migrate deploy
```

#### 4. Verify Migration Success
```bash
# Check migration history
pnpm prisma migrate status

# Verify tables exist
psql $DATABASE_URL -c "\dt"
```

### Post-Migration
- [ ] **Verify Application**
  - Check health endpoint: `GET /health`
  - Test admin login
  - Verify feature toggles are accessible
  
- [ ] **Monitor Logs**
  ```bash
  # Check for Prisma/database errors
  pm2 logs backend
  # or
  docker logs backend-container
  ```

- [ ] **Test New Features**
  - Access `/app/admin/feature-toggles`
  - Access `/app/admin/audit-logs`
  - Create a test feature toggle
  - Verify audit log is created

## Current Migrations

### 📅 2025-01-13: Add Feature Toggles
**File:** `prisma/migrations/XXXXXXXX_add_feature_toggles/migration.sql`

**Changes:**
- Creates `feature_toggles` table
- Adds indexes on `key` and `enabled` columns

**SQL:**
```sql
CREATE TABLE "feature_toggles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "feature_toggles_key_idx" ON "feature_toggles"("key");
CREATE INDEX "feature_toggles_enabled_idx" ON "feature_toggles"("enabled");
```

**Rollback Plan:**
```sql
DROP TABLE IF EXISTS "feature_toggles";
```

## Rollback Procedure

### If Migration Fails

#### 1. Restore from Backup
```bash
# Stop application
pm2 stop backend

# Restore database
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 start backend
```

#### 2. Mark Migration as Rolled Back
```bash
# Manually mark last migration as failed
pnpm prisma migrate resolve --rolled-back XXXXXXXX_add_feature_toggles
```

## Common Issues & Solutions

### Issue: Migration Already Applied
**Error:** `Migration XXXX has already been applied`

**Solution:**
```bash
# Check status
pnpm prisma migrate status

# If already applied in database but not marked:
pnpm prisma migrate resolve --applied XXXXXXXX_add_feature_toggles
```

### Issue: Connection Timeout
**Error:** `Can't reach database server`

**Solution:**
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall rules
- Verify SSL settings if required

### Issue: Permission Denied
**Error:** `permission denied to create table`

**Solution:**
- Verify database user has CREATE TABLE permission
- Grant necessary permissions:
  ```sql
  GRANT CREATE ON DATABASE vivaform_prod TO your_user;
  ```

## Monitoring After Migration

### Key Metrics to Watch
1. **API Response Time** — should not increase significantly
2. **Database Connections** — check for connection pool exhaustion
3. **Error Rate** — monitor Sentry for new errors
4. **Feature Toggle Queries** — check slow query log

### Health Checks
```bash
# Application health
curl https://api.vivaform.com/health

# Database health (from within backend container)
pnpm prisma db pull --schema prisma/schema.prisma
```

## Environment-Specific Notes

### Staging
```bash
DATABASE_URL="postgresql://user:pass@staging-db:5432/vivaform_staging"
pnpm prisma migrate deploy
```

### Production
```bash
DATABASE_URL="postgresql://user:pass@prod-db:5432/vivaform_prod"
pnpm prisma migrate deploy
```

### Docker/Kubernetes
Add migration step to deployment pipeline:
```yaml
# In docker-compose.yml or k8s job
migrations:
  image: vivaform/backend:latest
  command: ["pnpm", "prisma", "migrate", "deploy"]
  environment:
    DATABASE_URL: ${DATABASE_URL}
```

## Success Criteria
- ✅ `pnpm prisma migrate status` shows all migrations applied
- ✅ Application starts without errors
- ✅ `/app/admin/feature-toggles` page loads
- ✅ Can create/update feature toggles
- ✅ `/app/admin/audit-logs` page loads
- ✅ Audit logs are being created

## Support
If issues occur during migration:
1. Check logs first
2. Restore from backup if critical
3. Review this guide's troubleshooting section
4. Contact DevOps team if unresolved

## Next Migrations
Keep this file updated with each new migration for future reference.

