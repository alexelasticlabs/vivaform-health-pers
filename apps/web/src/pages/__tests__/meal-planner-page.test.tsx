import { describe, it, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { MealPlannerPage } from '../meal-planner-page';
import { useUserStore } from '@/store/user-store';

vi.mock('../../api', async () => {
  const mod = await vi.importActual<any>('../../api');
  return {
    ...mod,
    getMealPlan: vi.fn().mockResolvedValue({
      days: [
        { date: new Date().toISOString(), meals: [], dailyTotals: { calories: 1800, protein: 120, fat: 60, carbs: 200 } },
        { date: new Date(Date.now()+86400000).toISOString(), meals: [], dailyTotals: { calories: 1900, protein: 130, fat: 65, carbs: 210 } },
      ],
      weeklyAverages: { calories: 1850, protein: 125, fat: 62, carbs: 205 },
      targetMacros: { calories: 2000, protein: 150, fat: 70, carbs: 230 }
    })
  };
});

describe('MealPlannerPage', () => {
  it('renders and switches days', async () => {
    useUserStore.setState({ profile: { id: 'u1', tier: 'PREMIUM' } } as any);
    const { findByText, getAllByRole } = renderWithProviders(<MealPlannerPage />);
    await findByText(/Weekly Averages/i);
    const dayButtons = getAllByRole('button');
    if (dayButtons.length > 1) {
      await dayButtons[1].click();
    }
    await findByText(/Daily Totals/i);
  });

  it('matches snapshot of initial render and shows daily totals block', async () => {
    useUserStore.setState({ profile: { id: 'u1', tier: 'PREMIUM' } } as any);
    const { findByText, container } = renderWithProviders(<MealPlannerPage />);
    await findByText(/Weekly Averages/i);
    expect(container).toMatchSnapshot();
  });
});
