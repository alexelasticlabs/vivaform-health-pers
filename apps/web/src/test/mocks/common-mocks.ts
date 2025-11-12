import { vi } from 'vitest';

export function applyCommonMocks() {
  vi.mock('@/api/subscriptions', () => ({
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://checkout.example.com' }),
    syncCheckoutSession: vi.fn().mockResolvedValue({ status: 'ok' })
  }));

  vi.mock('@/api', async (importOriginal: any) => {
    const actual: any = await importOriginal();
    return {
      ...(actual as object),
      login: actual.login,
      registerUser: actual.registerUser,
      fetchDailyDashboard: vi.fn().mockResolvedValue({
        nutrition: { summary: { calories: 0, protein: 0, fat: 0, carbs: 0 }, entries: [] },
        water: { totalMl: 0 },
        weight: { latest: null },
        recommendations: []
      }),
      createWaterEntry: vi.fn().mockResolvedValue({}),
      createNutritionEntry: vi.fn().mockResolvedValue({}),
      createWeightEntry: vi.fn().mockResolvedValue({}),
      getArticleBySlug: vi.fn().mockImplementation((slug: string) => Promise.resolve({
        id: 'a1',
        title: 'Test',
        slug,
        excerpt: 'Ex',
        category: 'Cat',
        coverImage: null,
        tags: ['x'],
        publishedAt: new Date().toISOString(),
        viewCount: 10,
        author: { name: 'Author' },
        content: '<script>alert(1)</script><p>Safe</p>'
      }))
    };
  });

  vi.mock('@/api/weight', () => ({ fetchWeightHistory: vi.fn().mockResolvedValue([]) }));

  vi.mock('@/api/quiz', () => ({ tryGetQuizProfile: vi.fn().mockResolvedValue(null) }));

  vi.mock('@/store/user-store', async () => {
    const mockState: any = { profile: { tier: 'FREE', name: 'Test', email: 't@e.com' }, accessToken: null, isAuthenticated: false };
    const listeners: Array<(state: any) => void> = [];
    const getState = () => ({
      ...mockState,
      setTier: (tier: string) => { mockState.profile.tier = tier; notify(); },
      setAuth: (profile: any, token: string) => { mockState.profile = { ...profile, tier: profile.tier ?? 'FREE' }; mockState.accessToken = token; mockState.isAuthenticated = true; notify(); },
      logout: () => { mockState.profile = null; mockState.accessToken = null; mockState.isAuthenticated = false; notify(); }
    });
    const notify = () => { const snapshot = getState(); listeners.forEach(l => l(snapshot)); };
    const useUserStore = ((selector?: any) => {
      const state = getState();
      return typeof selector === 'function' ? selector(state) : state;
    }) as any;
    useUserStore.getState = getState;
    useUserStore.setState = (partial: any) => {
      const patch = typeof partial === 'function' ? partial(getState()) : partial;
      Object.assign(mockState, patch);
      notify();
    };
    useUserStore.subscribe = (listener: (state: any) => void) => {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    };
    useUserStore.persist = { hasHydrated: () => true } as any;
    return { useUserStore } as any;
  });
}
