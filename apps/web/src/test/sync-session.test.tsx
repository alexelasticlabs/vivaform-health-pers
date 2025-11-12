import { describe, it, beforeEach, expect, vi } from 'vitest';
import { AppShell } from '@/components/layouts/app-shell';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useUserStore } from '@/store/user-store';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { syncCheckoutSession } from '@/api/subscriptions';

vi.mock('@/api/subscriptions', () => ({
  syncCheckoutSession: vi.fn().mockResolvedValue({ success: true })
}));

function mountWithPath(path: string) {
  window.history.pushState({}, '', path);
  const qc = createQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/app" element={<AppShell><div>App</div></AppShell>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('syncCheckoutSession on premium=success', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: { id: 'u1', email: 'a@b.c', tier: 'FREE' } as any,
      accessToken: 'x',
      isAuthenticated: true
    } as any);
    vi.clearAllMocks();
  });

  it('does not call syncCheckoutSession if session_id is missing', async () => {
    const ui = mountWithPath('/app?premium=success');
    render(ui);
    await screen.findByText('App');
    expect(syncCheckoutSession).not.toHaveBeenCalled();
  });
});
