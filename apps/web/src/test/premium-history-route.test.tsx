import { describe, it } from 'vitest';
import { RouterProvider } from 'react-router-dom';
import { render } from '@testing-library/react';
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
    window.history.pushState({}, '', '/premium/history');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    const matches = await view.findAllByText(/log in|sign in/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('allows authenticated user to see premium history', async () => {
    useUserStore.setState({
      profile: { id: 'u1', email: 'a@b.c', tier: 'FREE' } as any,
      accessToken: 'x',
      isAuthenticated: true
    } as any);

    window.history.pushState({}, '', '/premium/history');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    await view.findAllByText(/Premium history/i);
  });
});
