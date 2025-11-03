import { describe, expect, it, vi, beforeEach } from "vitest";

import { HealthService } from "./health.service";
import { PrismaService } from "../../common/prisma/prisma.service";

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