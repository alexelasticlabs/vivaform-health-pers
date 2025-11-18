import { useEffect } from 'react';
import { initMarketingAnalytics, initProductAnalytics } from '@/lib/analytics';
import { loadConsent } from '@/lib/consent';

// Initialize analytics only when user consent is present
export const AnalyticsBootstrapper = () => {
  useEffect(() => {
    const prefs = loadConsent();
    if (prefs?.marketing) initMarketingAnalytics();
    if (prefs?.analytics) initProductAnalytics();

    // Subscribe to consent change events (if banner dispatches it)
    const onConsentChanged = () => {
      const next = loadConsent();
      if (next?.marketing) initMarketingAnalytics();
      if (next?.analytics) initProductAnalytics();
    };
    window.addEventListener('vivaform:consent:changed', onConsentChanged);
    return () => window.removeEventListener('vivaform:consent:changed', onConsentChanged);
  }, []);

  return null;
};
