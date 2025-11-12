import { describe, it, expect } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '@/providers/app-providers';
import { createAppRouter } from '@/routes/router';

describe('landing hero', () => {
  it('renders landing page and shows primary CTA', async () => {
    const router = createAppRouter();
    // эмулируем навигацию на главную
    window.history.pushState({}, '', '/');
    const view = render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    const ctas = await view.findAllByText(/get started|start quiz|sign up/i);
    expect(ctas.length).toBeGreaterThan(0);
  });
});
