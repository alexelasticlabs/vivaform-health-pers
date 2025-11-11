import { describe, it, beforeEach } from 'vitest';
import { RouterProvider } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../providers/app-providers';
import { createAppRouter } from '../routes/router';
import { useUserStore } from '../store/user-store';
import { applyCommonMocks } from '../test/mocks/common-mocks';

applyCommonMocks();

function resetStore() {
  useUserStore.setState({ profile: null, tokens: null, isAuthenticated: false });
}

describe('premium route protection', () => {
  beforeEach(() => resetStore());

  it('redirects unauthenticated user to /login', async () => {
    // установить начальный URL
    window.history.pushState({}, '', '/premium');
    const router = createAppRouter();
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    const matches = await view.findAllByText(/log in|sign in/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('allows authenticated user to see premium content', async () => {
    useUserStore.setState({
      profile: { id: 'u1', email: 'a@b.c', tier: 'FREE' } as any,
      tokens: { accessToken: 'x', refreshToken: 'y' },
      isAuthenticated: true
    });
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
