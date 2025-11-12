import { describe, it, beforeEach } from 'vitest';
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

describe('premium route protection', () => {
  beforeEach(() => resetStore());

  it('redirects unauthenticated user to /login', async () => {
    window.history.pushState({}, '', '/premium');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    // Ищем кнопку/ссылку логина
    const matches = await view.findAllByText(/log in|sign in|login/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('allows authenticated user to see premium content', async () => {
    useUserStore.setState({
      profile: { id: 'u1', email: 'a@b.c', tier: 'FREE' } as any,
      accessToken: 'x',
      isAuthenticated: true
    } as any);
    window.history.pushState({}, '', '/premium');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    await view.findAllByText(/Unlock your personalized|Premium Access/i);
  });
});
