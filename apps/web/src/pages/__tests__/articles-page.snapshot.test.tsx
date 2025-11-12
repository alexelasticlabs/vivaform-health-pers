import { describe, it, expect } from 'vitest';
import { ArticlesPage } from '@/pages/articles-page';
import renderWithProviders from '@/test/render-helper';

describe('ArticlesPage', () => {
  it('renders default layout snapshot', () => {
    const { container } = renderWithProviders(<ArticlesPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
