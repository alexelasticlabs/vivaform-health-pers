-- CreateTable
CREATE TABLE IF NOT EXISTS "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_processedAt_idx" ON "ProcessedWebhookEvent"("processedAt");

-- Cleanup old events (retention 7 days)
-- CREATE OR REPLACE FUNCTION cleanup_old_webhook_events() RETURNS void AS $$
-- BEGIN
--   DELETE FROM "ProcessedWebhookEvent" WHERE "processedAt" < NOW() - INTERVAL '7 days';
-- END;
-- $$ LANGUAGE plpgsql;

