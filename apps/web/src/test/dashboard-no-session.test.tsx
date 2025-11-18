import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import renderWithProviders, { createTestQueryClient } from '@/test/render-helper';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { applyCommonMocks } from '@/test/mocks/common-mocks';

applyCommonMocks();

function renderDash(url: string) {
  const qc = createTestQueryClient();
  return renderWithProviders(
    <Routes>
      <Route path="/app" element={<DashboardPage />} />
    </Routes>,
    { router: { initialEntries: [url] }, client: qc }
  );
}

describe('DashboardPage no session sync', () => {
  it('does not call syncCheckoutSession without session_id', async () => {
    const subs = await import('../api/subscriptions');
    const spy = vi.spyOn(subs, 'syncCheckoutSession');
    renderDash('/app?premium=success');
    // Small wait to let the effect run
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
