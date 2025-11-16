import { describe, it, expect } from 'vitest';
import { RouterProvider } from 'react-router-dom';
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
    // Проверяем наличие ключевых CTA по role и name (стабильные селекторы)
    const quizLink = await view.findByRole('link', { name: /take the quiz/i }, { timeout: 3000 });
    const loginLink = view.getByRole('link', { name: /log in/i });
    expect(quizLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
  });
});
