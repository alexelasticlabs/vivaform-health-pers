import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { KpiCard } from '../kpi-card';
import { render } from '@testing-library/react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const HydrationWidget = ({ fail }: { fail?: boolean }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hydration-demo'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 1));
      if (fail) throw new Error('Network');
      return { totalMl: 500, goal: 2000 };
    }
  });
  if (isLoading) return <KpiCard title="Hydration" value={<span>Loading…</span>} />;
  if (isError) return <KpiCard title="Hydration" value={<span>Error</span>} />;
  return <KpiCard title="Hydration" value={<span>{data!.totalMl} ml</span>} subtitle={`/${data!.goal} ml`} progressPercent={(data!.totalMl / data!.goal) * 100} />;
};

describe('KpiCard with React Query', () => {
  it('renders loading state', () => {
    const { getAllByText } = render(<Wrapper><HydrationWidget /></Wrapper>);
    expect(getAllByText(/Loading…/i)[0]).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const { findAllByText } = render(<Wrapper><HydrationWidget fail /></Wrapper>);
    const nodes = await findAllByText(/Error/i);
    expect(nodes[0]).toBeInTheDocument();
  });

  it('renders data state', async () => {
    const { findAllByText, getByTestId } = render(<Wrapper><HydrationWidget /></Wrapper>);
    await findAllByText(/500 ml/);
    expect(getByTestId('kpi-value-hydration')).toHaveTextContent('500 ml');
  });
});
