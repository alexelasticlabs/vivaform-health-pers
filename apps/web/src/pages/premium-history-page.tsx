import { useState } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { format } from 'date-fns';

import { fetchSubscriptionHistory, type SubscriptionHistoryResponse } from '../api';

const PremiumHistoryPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Applied filters (used in the query)
  const [actions, setActions] = useState<string[]>([]);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // Pending filters (edited in UI)
  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [pendingFrom, setPendingFrom] = useState<string>('');
  const [pendingTo, setPendingTo] = useState<string>('');

  const applyFilters = () => {
    setPage(1);
    setActions(pendingActions);
    setFrom(pendingFrom);
    setTo(pendingTo);
  };
  const resetFilters = () => {
    setPendingActions([]);
    setPendingFrom('');
    setPendingTo('');
    setPage(1);
    setActions([]);
    setFrom('');
    setTo('');
  };

  const query = useQuery<SubscriptionHistoryResponse>({
    queryKey: ['subscription-history', page, actions, from, to],
    queryFn: () => fetchSubscriptionHistory(page, pageSize, {
      actions: actions.length ? actions : undefined,
      from: from || undefined,
      to: to || undefined
    })
  }) as UseQueryResult<SubscriptionHistoryResponse>;

  const { data, isLoading, isError } = query;
  const history = data as SubscriptionHistoryResponse | undefined;

  const emptyState = (!isLoading && !isError && history && history.items.length === 0) ? (
    <div className="text-muted-foreground" data-testid="premium-history-empty">No subscription events yet.</div>
  ) : null;
  const listState = (!isLoading && !isError && history && history.items.length > 0) ? (
    <ul className="space-y-3" data-testid="premium-history-list">
      {history.items.map((item) => (
        <li key={item.id} data-testid="premium-history-item" className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium" data-testid="premium-history-action">
              {item.action.replace('SUBSCRIPTION_', '').toLowerCase()}
            </span>
            <span className="text-xs text-muted-foreground" data-testid="premium-history-date">
              {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
          {item.metadata?.priceId && (
            <span data-testid="premium-history-priceId" className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {item.metadata.priceId}
            </span>
          )}
          {item.metadata?.amount && item.metadata?.currency && (
            <span data-testid="premium-history-amount" className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {(item.metadata.amount/100).toFixed(2)} {item.metadata.currency}
            </span>
          )}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold" data-testid="premium-history-title">Premium history</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your VivaForm+ receipts and subscription changes will appear here.</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">
        {isLoading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading history">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}
        {isError && !isLoading && <div className="text-red-600">Failed to load history</div>}
        {emptyState}
        {listState}
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-background p-4 text-xs" data-testid="premium-history-filters">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Quick presets:</span>
            {[
              { label: '7 days', days: 7 },
              { label: '30 days', days: 30 },
              { label: '90 days', days: 90 }
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - p.days + 1);
                  const toStr = end.toISOString().slice(0, 10);
                  const fromStr = start.toISOString().slice(0, 10);
                  setPendingFrom(fromStr);
                  setPendingTo(toStr);
                }}
                className="rounded-md border border-border px-3 py-1 hover:bg-muted"
              >{p.label}</button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {['SUBSCRIPTION_CREATED','SUBSCRIPTION_UPGRADED','SUBSCRIPTION_CANCELLED'].map(a => (
              <label key={a} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={pendingActions.includes(a)}
                  onChange={() => setPendingActions(f => f.includes(a) ? f.filter(x => x!==a) : [...f,a])}
                />
                <span>{a.replace('SUBSCRIPTION_','').toLowerCase()}</span>
              </label>
            ))}
          </div>

          {/* Date range + actions */}
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col">
              <span>From</span>
              <input type="date" value={pendingFrom} onChange={e=> setPendingFrom(e.target.value)} className="rounded-md border border-border px-2 py-1 bg-card" />
            </label>
            <label className="flex flex-col">
              <span>To</span>
              <input type="date" value={pendingTo} onChange={e=> setPendingTo(e.target.value)} className="rounded-md border border-border px-2 py-1 bg-card" />
            </label>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md border border-border px-3 py-1 hover:bg-muted"
              >Reset</button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-md bg-primary px-3 py-1 text-primary-foreground"
              >Apply</button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            data-testid="premium-history-prev"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground" data-testid="premium-history-page">Page {page}</span>
          <button
            data-testid="premium-history-next"
            disabled={!history?.hasNext || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default PremiumHistoryPage;
