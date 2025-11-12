import { useEffect } from 'react';
import { initMarketingAnalytics, initProductAnalytics } from '@/lib/analytics';
import { loadConsent } from '@/lib/consent';

// Инициализирует аналитику только при наличии согласия
export const AnalyticsBootstrapper = () => {
  useEffect(() => {
    const prefs = loadConsent();
    if (prefs?.marketing) initMarketingAnalytics();
    if (prefs?.analytics) initProductAnalytics();

    // Подписка на событие изменения consent (если баннер диспатчит его)
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
