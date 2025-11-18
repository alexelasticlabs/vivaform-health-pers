import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/consent', () => {
  let stored: any = null;
  return {
    saveConsent: (c: any) => { stored = c; return stored; },
    loadConsent: () => stored
  };
});
import * as consentMod from '@/lib/consent';

import { ConsentBanner } from '@/components/consent-banner';

beforeEach(() => {
  // reset stored prefs in mocked module
  (consentMod as any).saveConsent(null);
});

describe('ConsentBanner defaults', () => {
  it('shows banner when no prefs and checkboxes default to false', async () => {
    render(<ConsentBanner />);
    await screen.findByText(/We use cookies/i);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
    checkboxes.forEach(cb => expect((cb as HTMLInputElement).checked).toBe(false));
  });

  it('saving without toggling keeps false values', async () => {
    render(<ConsentBanner />);
    await screen.findByText(/We use cookies/i);
    fireEvent.click(screen.getByText('Save'));
    expect(consentMod.loadConsent()).toEqual({ marketing: false, analytics: false });
  });

  it('accept all sets both true', async () => {
    render(<ConsentBanner />);
    await screen.findByText(/We use cookies/i);
    // Small pause to allow useEffect to run
    await new Promise(r=>setTimeout(r,10));
    const acceptBtn = screen.getByRole('button', { name: /accept all/i });
    fireEvent.click(acceptBtn);
    expect(consentMod.loadConsent()).toEqual({ marketing: true, analytics: true });
  });
});
