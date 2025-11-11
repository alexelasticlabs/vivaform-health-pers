import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  it('renders value and progress bar', () => {
    const { getByText, container } = render(<KpiCard title="Hydration" value="500 ml" progressPercent={25} />);
    expect(getByText(/Hydration/i)).toBeInTheDocument();
    expect(getByText(/500 ml/i)).toBeInTheDocument();
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeTruthy();
  });

  it('renders footer content', () => {
    const { getByText } = render(<KpiCard title="Calories" value="1200" footer={<div>Footer</div>} />);
    expect(getByText(/Footer/i)).toBeInTheDocument();
  });

  it('wraps in button when onClick provided', () => {
    const { getByRole } = render(<KpiCard title="Weight" value="70 kg" onClick={() => {}} />);
    expect(getByRole('button')).toBeInTheDocument();
  });
});

