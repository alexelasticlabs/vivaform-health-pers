import { vi, describe, it } from 'vitest';
// Mock providers BEFORE importing the rest of modules
vi.mock('@/providers/auth-bootstrapper', () => ({ AuthBootstrapper: () => null }));
vi.mock('@/providers/analytics-bootstrapper', () => ({ AnalyticsBootstrapper: () => null }));

import { RouterProvider } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { AppProviders } from '@/providers/app-providers';
import { createAppRouter } from '@/routes/router';
import { useUserStore } from '@/store/user-store';
import { applyCommonMocks } from '@/test/mocks/common-mocks';

applyCommonMocks();

function resetStore() {
  useUserStore.setState({ profile: null, accessToken: null, isAuthenticated: false } as any);
}

describe('premium history route protection', () => {
  it('redirects unauthenticated user to /login', async () => {
    resetStore();
    window.history.pushState({}, '', '/app/premium/history');
    const router = createAppRouter();
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    // Expect redirect to /login
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('allows authenticated user to see premium history', async () => {
    useUserStore.setState({
      profile: { id: 'u1', email: 'a@b.c', tier: 'PREMIUM' } as any,
      accessToken: 'x',
      isAuthenticated: true
    } as any);
    (useUserStore as any).persist = { hasHydrated: () => true };
    (window as any).__E2E_AUTH_OVERRIDE__ = true;

    window.history.pushState({}, '', '/app/premium/history');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/premium/history');
      expect(() => view.getByTestId('premium-history-title')).not.toThrow();
    }, { timeout: 2500 });
    delete (window as any).__E2E_AUTH_OVERRIDE__;
  });
});
