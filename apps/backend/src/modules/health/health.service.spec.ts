import { describe, expect, it, vi, beforeEach } from "vitest";

import { HealthService } from "./health.service";
import type { PrismaService } from "../../common/prisma/prisma.service";

describe("HealthService", () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
      user: {
        count: vi.fn().mockResolvedValue(42)
      },
      subscription: {
        count: vi.fn().mockResolvedValue(10)
      }
    } as any;

    service = new HealthService(prismaService);
  });

  it("возвращает статус ok когда БД доступна", async () => {
    const status = await service.getStatus();
    
    expect(status.status).toBe("ok");
    expect(status.database.status).toBe("ok");
    expect(status.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("возвращает статус ok при явном пропуске проверки БД", async () => {
    const previous = process.env.HEALTH_SKIP_DB_CHECK;
    process.env.HEALTH_SKIP_DB_CHECK = "true";
    prismaService.$queryRaw = vi.fn();

    try {
      const status = await service.getStatus();
      expect(status.status).toBe("ok");
      expect(status.database.status).toBe("skipped");
      expect(prismaService.$queryRaw).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) {
        delete process.env.HEALTH_SKIP_DB_CHECK;
      } else {
        process.env.HEALTH_SKIP_DB_CHECK = previous;
      }
    }
  });

  it("возвращает статус degraded когда БД недоступна", async () => {
    prismaService.$queryRaw = vi.fn().mockRejectedValue(new Error("Connection failed"));
    
    const status = await service.getStatus();
    
    expect(status.status).toBe("degraded");
    expect(status.database.status).toBe("error");
  });

  it("возвращает метрики приложения", async () => {
    const metrics = await service.getMetrics();
    
    expect(metrics.active_users_24h).toBe(42);
    expect(metrics.subscriptions_active).toBe(10);
    expect(metrics.timestamp).toBeDefined();
  });
});