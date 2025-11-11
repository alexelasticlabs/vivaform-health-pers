import { describe, it, expect } from 'vitest';
import renderWithProviders from '../../../test/render-helper';
import { KpiCard } from '../../dashboard/kpi-card';

// Minimal tests for loading/error via footer and placeholder value

describe('KpiCard states', () => {
  it('renders value and subtitle and footer', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <KpiCard title="Hydration" value={<span>0 ml</span>} subtitle="/ 2000 ml" footer={<div>footer</div>} />
    );
    expect(getByTestId('kpi-value-hydration')).toHaveTextContent('0 ml');
    expect(getByText('/ 2000 ml')).toBeInTheDocument();
    expect(getByText('footer')).toBeInTheDocument();
  });

  it('can be clickable when onClick provided', () => {
    let clicked = false;
    const { getByRole } = renderWithProviders(
      <KpiCard title="Weight" value={<span>—</span>} onClick={() => { clicked = true; }} />
    );
    getByRole('button').click();
    expect(clicked).toBe(true);
  });
});

