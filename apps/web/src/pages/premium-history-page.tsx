import { useEffect } from 'react';

const PremiumHistoryPage = () => {
  useEffect(() => {
    // TODO: загрузить историю покупок/счетов через API когда будет готово
  }, []);

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Premium history</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your VivaForm+ receipts and subscription changes will appear here.</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No data yet.
      </div>
    </section>
  );
};

export default PremiumHistoryPage;

