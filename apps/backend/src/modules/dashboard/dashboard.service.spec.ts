import { describe, expect, it, beforeEach, vi } from "vitest";

import { DashboardService } from "./dashboard.service";
import type { NutritionService } from "../nutrition/nutrition.service";
import type { WaterService } from "../water/water.service";
import type { WeightService } from "../weight/weight.service";
import type { RecommendationsService } from "../recommendations/recommendations.service";

const createDependencies = () => ({
  nutritionService: {
    findDaily: vi.fn()
  } as unknown as NutritionService,
  waterService: {
    findDaily: vi.fn()
  } as unknown as WaterService,
  weightService: {
    getLatest: vi.fn(),
    getProgress: vi.fn()
  } as unknown as WeightService,
  recommendationsService: {
    findDaily: vi.fn()
  } as unknown as RecommendationsService
});

describe("DashboardService", () => {
  let service: DashboardService;
  let deps: ReturnType<typeof createDependencies>;

  beforeEach(() => {
    deps = createDependencies();
    service = new DashboardService(
      deps.nutritionService,
      deps.waterService,
      deps.weightService,
      deps.recommendationsService
    );
  });

  it("агрегирует дневные данные", async () => {
    deps.nutritionService.findDaily = vi.fn().mockResolvedValue([
      { id: "1", calories: 500, protein: 20, fat: 10, carbs: 60 },
      { id: "2", calories: 400, protein: 15, fat: 12, carbs: 40 }
    ]);
    deps.waterService.findDaily = vi.fn().mockResolvedValue([
      { id: "w1", amountMl: 500 },
      { id: "w2", amountMl: 700 }
    ]);
    deps.weightService.getLatest = vi.fn().mockResolvedValue({ id: "weight", weightKg: 70, date: new Date() });
    deps.weightService.getProgress = vi.fn().mockResolvedValue({ delta: -1, start: null, end: null });
    deps.recommendationsService.findDaily = vi.fn().mockResolvedValue([{ id: "r1", title: "test", body: "body" }]);

    const result = await service.getDailyOverview("user-1", { date: "2025-02-11" });

    expect(result.nutrition.summary).toEqual({ calories: 900, protein: 35, fat: 22, carbs: 100 });
    expect(result.water.totalMl).toBe(1200);
    expect(result.recommendations).toHaveLength(1);
    expect(deps.nutritionService.findDaily).toHaveBeenCalledWith("user-1", "2025-02-11");
  });

  it("использует текущую дату, если не передана", async () => {
    deps.nutritionService.findDaily = vi.fn().mockResolvedValue([]);
    deps.waterService.findDaily = vi.fn().mockResolvedValue([]);
    deps.weightService.getLatest = vi.fn().mockResolvedValue(null);
    deps.weightService.getProgress = vi.fn().mockResolvedValue({ delta: 0, start: null, end: null });
    deps.recommendationsService.findDaily = vi.fn().mockResolvedValue([]);

    const result = await service.getDailyOverview("user-1", {});

    expect(result.date).toBeTruthy();
  });
});