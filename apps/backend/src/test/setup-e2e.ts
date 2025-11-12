import 'reflect-metadata';
import { config } from "dotenv";
import path from "path";
import type { PrismaClient } from '@prisma/client';

// Load .env.test for E2E tests BEFORE any modules load
const result = config({ path: path.resolve(__dirname, "../../.env.test") });

if (result.error) {
  console.error("Failed to load .env.test:", result.error);
} else {
  console.log("✅ Loaded .env.test with", Object.keys(result.parsed || {}).length, "variables");
}

if (process.setMaxListeners) {
  process.setMaxListeners(20);
}

// Global helper to truncate all tables quickly between suites if needed
export async function truncateAll(prisma?: PrismaClient) {
  if (!prisma) {
    // Fallback: no-op if prisma не передан, чтобы не создавать второе соединение
    console.warn('truncateAll called without prisma client — skipping');
    return;
  }

  // Allow opt-out from truncation via environment variable (useful for debugging)
  if (process.env.E2E_SKIP_TRUNCATE === 'true') {
    console.log('E2E_SKIP_TRUNCATE=true, skipping truncateAll');
    return;
  }

  try {
    // Single statement TRUNCATE to avoid transaction/connection issues
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "AuditLog","TempPassword","PasswordResetToken","Article","Recommendation","WeightEntry","WaterEntry","NutritionEntry","Subscription","QuizProfile","Profile","User","MealTemplate","FoodItem" CASCADE'
    );
    console.log('✅ Database truncated successfully');
  } catch (err) {
    console.error('Failed to truncate tables', err);
  }
}
