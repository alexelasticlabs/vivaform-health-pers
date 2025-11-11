import { vi } from 'vitest';

export function applyCommonMocks() {
  vi.mock('@/api/subscriptions', () => ({
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://checkout.example.com' }),
    syncCheckoutSession: vi.fn().mockResolvedValue({ status: 'ok' })
  }));

  vi.mock('@/api', () => ({
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

  vi.mock('@/api/weight', () => ({ fetchWeightHistory: vi.fn().mockResolvedValue([]) }));

  vi.mock('@/api/quiz', () => ({ tryGetQuizProfile: vi.fn().mockResolvedValue(null) }));

  vi.mock('@/store/user-store', async () => {
    const mockState = { profile: { tier: 'FREE', name: 'Test', email: 't@e.com' }, tokens: null };
    const api = {
      useUserStore: (selector: any) => selector(mockState),
    } as any;
    api.useUserStore.getState = () => ({
      ...mockState,
      setTier: (tier: string) => { mockState.profile.tier = tier; }
    });
    return api;
  });
}
