import { useEffect, useState } from 'react';
import { saveConsent, loadConsent } from '@/lib/consent';

export const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const prefs = loadConsent();
    if (prefs) {
      setMarketing(prefs.marketing);
      setAnalytics(prefs.analytics);
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent({ marketing: true, analytics: true });
    window.dispatchEvent(new Event('vivaform:consent:changed'));
    setVisible(false);
  };

  const acceptSelected = () => {
    saveConsent({ marketing, analytics });
    window.dispatchEvent(new Event('vivaform:consent:changed'));
    setVisible(false);
  };

  const reject = () => {
    saveConsent({ marketing: false, analytics: false });
    window.dispatchEvent(new Event('vivaform:consent:changed'));
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-5xl rounded-t-2xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          We use cookies to personalize content and to analyze our traffic. You can accept or reject optional cookies.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /> Marketing
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Analytics
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={reject} className="rounded-md border px-3 py-2 text-sm">Reject all</button>
            <button onClick={acceptSelected} className="rounded-md border px-3 py-2 text-sm">Save</button>
            <button onClick={acceptAll} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white">Accept all</button>
          </div>
        </div>
      </div>
    </div>
  );
};
