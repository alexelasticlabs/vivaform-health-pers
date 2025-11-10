CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NULL,
  "metadata" TEXT NULL,
  "ip" TEXT NULL,
  "userAgent" TEXT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog" ("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");

