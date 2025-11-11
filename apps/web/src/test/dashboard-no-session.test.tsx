import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import { applyCommonMocks } from './mocks/common-mocks';

applyCommonMocks();

function renderDash(url: string) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/app" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage no session sync', () => {
  it('не вызывает syncCheckoutSession без session_id', async () => {
    const subs = await import('../api/subscriptions');
    const spy = vi.spyOn(subs, 'syncCheckoutSession');
    renderDash('/app?premium=success');
    // небольшой таймер чтобы эффект прошёл
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
