import { describe, it, expect } from "vitest";
import { buildTrend, deriveProgress } from "@/utils/progress";

describe("progress utils", () => {
  it("buildTrend produces diffs", () => {
    const trend = buildTrend([
      { id: "a", date: "2025-01-01", weightKg: 80 },
      { id: "b", date: "2025-01-02", weightKg: 79.5 },
      { id: "c", date: "2025-01-03", weightKg: 79.7 }
    ] as any);
    expect(trend[0].diff).toBeNull();
    expect(trend[1].diff).toBe(-0.5);
    expect(trend[2].diff).toBe(0.2);
  });

  it("deriveProgress returns defaults when empty", () => {
    expect(deriveProgress([] as any, null)).toEqual({ latest: null, start: null, delta: 0 });
  });

  it("deriveProgress returns latest/start and delta", () => {
    const history = [
      { id: "a", date: "2025-01-01", weightKg: 80 },
      { id: "b", date: "2025-01-02", weightKg: 79.5 }
    ] as any;
    const progress = { delta: -0.5 } as any;
    const res = deriveProgress(history, progress);
    expect(res.start?.weightKg).toBe(80);
    expect(res.latest?.weightKg).toBe(79.5);
    expect(res.delta).toBe(-0.5);
  });
});
