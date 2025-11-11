import { vi } from 'vitest';

export function applyCommonMocks() {
  vi.mock('../../api/subscriptions', () => ({
    syncCheckoutSession: vi.fn().mockResolvedValue({ success: true })
  }));

  vi.mock('../../api', () => ({
    fetchDailyDashboard: vi.fn().mockResolvedValue({
      nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
      water: { totalMl: 0 },
      weight: { latest: null },
      recommendations: []
    }),
    createWaterEntry: vi.fn().mockResolvedValue({}),
    createNutritionEntry: vi.fn().mockResolvedValue({}),
    createWeightEntry: vi.fn().mockResolvedValue({})
  }));

  vi.mock('../../api/weight', () => ({
    fetchWeightHistory: vi.fn().mockResolvedValue([])
  }));

  vi.mock('../../api/quiz', () => ({
    getQuizProfile: vi.fn().mockResolvedValue({ recommendedCalories: 2000, heightCm: 175 }),
    tryGetQuizProfile: vi.fn().mockResolvedValue({ recommendedCalories: 2000, heightCm: 175 })
  }));

  vi.mock('../../store/user-store', async () => {
    return {
      useUserStore: (selector: any) =>
        selector({ profile: { tier: 'FREE', name: 'Test', email: 't@e.com' } })
    };
  });
}

