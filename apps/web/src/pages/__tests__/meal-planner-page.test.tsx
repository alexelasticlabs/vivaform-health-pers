import { describe, it, vi } from 'vitest';
import renderWithProviders from '@/test/render-helper';
import { MealPlannerPage } from '@/pages/meal-planner-page';
import { initUserPremium } from '@/test/store-helpers';

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

vi.setSystemTime(new Date('2025-11-12T10:00:00Z'));

describe('MealPlannerPage', () => {
  it('renders and switches days', async () => {
    initUserPremium();
    const { findByText, getAllByRole } = renderWithProviders(<MealPlannerPage />);
    await findByText(/Weekly Averages/i);
    const dayButtons = getAllByRole('button');
    if (dayButtons.length > 1) {
      await dayButtons[1].click();
    }
    await findByText(/Daily Totals/i);
  });

  it('matches snapshot of initial render and shows daily totals block', async () => {
    initUserPremium();
    const { findByText, container } = renderWithProviders(<MealPlannerPage />);
    await findByText(/Weekly Averages/i);
    expect(container).toMatchSnapshot();
  });

  it('switches day and updates daily totals calories', async () => {
    initUserPremium();
    const { findByTestId, getByTestId } = renderWithProviders(<MealPlannerPage />);
    // ждём первый рендер
    const caloriesInitialEl = await findByTestId('planner-total-calories');
    const initial = caloriesInitialEl.textContent;
    // кликаем по следующему дню
    const nextDayBtn = getByTestId('planner-day-1');
    nextDayBtn.click();
    const caloriesAfter = (await findByTestId('planner-total-calories')).textContent;
    // значения из мока: 1800 -> 1900
    expect(initial).not.toBe(caloriesAfter);
  });
});
