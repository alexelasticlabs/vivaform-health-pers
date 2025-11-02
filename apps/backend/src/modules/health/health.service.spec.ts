import { describe, expect, it } from "vitest";

import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("возвращает статус ok", () => {
    const service = new HealthService();
    expect(service.getStatus().status).toBe("ok");
  });
});