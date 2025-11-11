import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export type RenderHelperOptions = { router?: MemoryRouterProps; client?: QueryClient };

export function createTestQueryClient(): QueryClient {
  const defaultQueryFn = (globalThis as any).__TEST_DEFAULT_QUERY_FN__ as (() => Promise<unknown>) | undefined;
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
        queryFn: defaultQueryFn ?? (async () => ({} as any))
      }
    }
  });
}

export function renderWithProviders(ui: ReactElement, options?: RenderHelperOptions) {
  const client = options?.client ?? createTestQueryClient();
  const routerProps = options?.router ?? {};
  return render(
    <MemoryRouter {...routerProps}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

export default renderWithProviders;
