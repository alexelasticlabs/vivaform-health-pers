import { hasMarketingConsent, loadConsent } from "@/lib/consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    vfProductAnalytics?: {
      inited?: boolean;
      endpoint?: string;
      track: (event: string, payload?: Record<string, unknown>) => void;
    };
  }
}

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const PRODUCT_ENDPOINT = import.meta.env.VITE_PRODUCT_ANALYTICS_ENDPOINT as string | undefined;

const SILENCE = import.meta.env.VITE_SILENCE_ANALYTICS_LOGS === '1';

let marketingInitialized = false;
let productInitialized = false;

const loadMetaPixel = (id: string) => {
  if (typeof window === "undefined") return;
  if (document.getElementById("meta-pixel")) return;
  const script = document.createElement("script");
  script.id = "meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.onload = () => {
    if (typeof window.fbq === "function") {
      window.fbq("init", id);
      window.fbq("track", "PageView");
    }
  };
  document.head.appendChild(script);
};

const loadGoogleAds = (id: string) => {
  if (typeof window === "undefined" || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
  if (document.getElementById("google-ads")) return;
  const script = document.createElement("script");
  script.id = "google-ads";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
};

// MARKETING
export const initMarketingAnalytics = () => {
  if (marketingInitialized) return;
  const consent = loadConsent();
  if (!consent?.marketing) {
    if (import.meta.env.DEV && !SILENCE) {
      console.debug("[analytics] Marketing consent not granted. Skipping marketing pixels.");
    }
    return;
  }
  if (!META_PIXEL_ID && !GOOGLE_ADS_ID) {
    if (import.meta.env.DEV && !SILENCE) {
      console.debug("[analytics] No marketing pixel IDs configured. Skipping.");
    }
    return;
  }
  if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID);
  if (GOOGLE_ADS_ID) loadGoogleAds(GOOGLE_ADS_ID);
  marketingInitialized = true;
};

export const trackMarketing = (event: string, payload?: Record<string, unknown>) => {
  const consent = loadConsent();
  if (!consent?.marketing) return;
  if (import.meta.env.DEV && !SILENCE) console.debug(`[marketing] ${event}`, payload);
  if (META_PIXEL_ID && window.fbq) window.fbq("trackCustom", event, payload ?? {});
  if (GOOGLE_ADS_ID && window.gtag) window.gtag("event", event, payload ?? {});
};

// PRODUCT
const PROVIDER = (import.meta.env.VITE_PRODUCT_ANALYTICS_PROVIDER || 'beacon') as 'beacon' | 'fetch' | 'amplitude' | 'posthog';
const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.posthog.com';

function getAnonId() {
  try {
    const k = 'vf_anon_id';
    const v = localStorage.getItem(k);
    if (v) return v;
    const nid = 'vf_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(k, nid);
    return nid;
  } catch {
    return 'vf_anon';
  }
}

function providerTrack(event: string, payload?: Record<string, unknown>) {
  const body = { event, payload, ts: Date.now(), anonId: getAnonId() };
  // choose provider
  if (PROVIDER === 'beacon' && PRODUCT_ENDPOINT && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try { (navigator as any).sendBeacon(PRODUCT_ENDPOINT, JSON.stringify(body)); return; } catch {}
  }
  if (PROVIDER === 'fetch' && PRODUCT_ENDPOINT) {
    try { void fetch(PRODUCT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }); return; } catch {}
  }
  if (PROVIDER === 'amplitude' && AMPLITUDE_API_KEY) {
    try {
      const ampBody = { api_key: AMPLITUDE_API_KEY, events: [{ event_type: event, user_id: getAnonId(), event_properties: payload ?? {}, time: Date.now() }] };
      void fetch('https://api2.amplitude.com/2/httpapi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ampBody), keepalive: true });
      return;
    } catch {}
  }
  if (PROVIDER === 'posthog' && POSTHOG_KEY) {
    try {
      const phBody = { api_key: POSTHOG_KEY, event: event, properties: { distinct_id: getAnonId(), ...(payload ?? {}) }, timestamp: new Date().toISOString() } as any;
      // PostHog expects { api_key, event, properties } or batch; we use capture endpoint
      void fetch(`${POSTHOG_HOST.replace(/\/$/, '')}/capture/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(phBody), keepalive: true });
      return;
    } catch {}
  }
  if (!SILENCE && import.meta.env.DEV) {
    console.debug(`[product:${PROVIDER}] ${event}`, payload);
  }
}

export const initProductAnalytics = () => {
  if (productInitialized) return;
  const consent = loadConsent();
  if (!consent?.analytics) {
    if (import.meta.env.DEV && !SILENCE) {
      console.debug("[analytics] Product analytics consent not granted. Skipping product analytics.");
    }
    return;
  }
  window.vfProductAnalytics = window.vfProductAnalytics || {
    inited: false,
    endpoint: PRODUCT_ENDPOINT,
    track: providerTrack
  };
  window.vfProductAnalytics.inited = true;
  productInitialized = true;
};

export const trackProduct = (event: string, payload?: Record<string, unknown>) => {
  const consent = loadConsent();
  if (!consent?.analytics) return;
  if (!window.vfProductAnalytics || !window.vfProductAnalytics.inited) {
    initProductAnalytics();
  }
  window.vfProductAnalytics?.track(event, payload);
};

// Back-compat: существующие события квиза используют trackConversion
export const trackConversion = (event: string, payload?: Record<string, unknown>) => {
  trackProduct(event, payload);
};

// Quiz events далее используют trackConversion (продуктовая аналитика)
export const logQuizStart = (clientId: string) => {
  trackProduct("quiz_start", { clientId, timestamp: new Date().toISOString() });
};

export const logQuizSectionCompleted = (clientId: string, sectionId: string, progress: number) => {
  trackProduct("quiz_section_completed", { clientId, sectionId, progress, timestamp: new Date().toISOString() });
};

export const logQuizSubmitSuccess = (clientId: string, userId?: string, durationSeconds?: number) => {
  trackProduct("quiz_submit_success", { clientId, userId, durationSeconds, timestamp: new Date().toISOString() });
};

export const logQuizSubmitError = (clientId: string, error: string) => {
  trackProduct("quiz_submit_error", { clientId, error, timestamp: new Date().toISOString() });
};

export const logQuizStepViewed = (clientId: string, stepId: string) => {
  trackProduct("quiz_step_viewed", { clientId, stepId, timestamp: new Date().toISOString() });
};

export const logQuizOptionSelected = (clientId: string, stepId: string, field: string, value: unknown) => {
  trackProduct("quiz_option_selected", { clientId, stepId, field, value, timestamp: new Date().toISOString() });
};

export const logQuizSliderChanged = (clientId: string, stepId: string, field: string, value: number) => {
  trackProduct("quiz_slider_changed", { clientId, stepId, field, value, timestamp: new Date().toISOString() });
};

export const logQuizToggleChanged = (clientId: string, stepId: string, field: string, value: boolean) => {
  trackProduct("quiz_toggle_changed", { clientId, stepId, field, value, timestamp: new Date().toISOString() });
};

export const logQuizPreviewSaved = (clientId: string) => {
  trackProduct("quiz_preview_saved", { clientId, timestamp: new Date().toISOString() });
};

export const logQuizFinalStepViewed = (clientId: string) => {
  trackProduct("quiz_final_step_viewed", { clientId, timestamp: new Date().toISOString() });
};

export const logQuizNextClicked = (clientId: string, stepId: string) => {
  trackProduct("quiz_next_clicked", { clientId, stepId, timestamp: new Date().toISOString() });
};

export const logQuizBackClicked = (clientId: string, stepId: string) => {
  trackProduct("quiz_back_clicked", { clientId, stepId, timestamp: new Date().toISOString() });
};

export const logQuizCtaClicked = (
  clientId: string,
  placement: 'desktop_nav' | 'mobile_sticky' | 'landing' | 'other',
  label: string,
  stepId?: string,
) => {
  trackProduct("quiz_cta_clicked", { clientId, placement, label, stepId, timestamp: new Date().toISOString() });
};

export const logUserMenuOpened = (source: 'marketing' | 'app') => {
  trackProduct('user_menu_opened', { source, timestamp: new Date().toISOString() });
};

export const logUserMenuItemClicked = (source: 'marketing' | 'app', item: string) => {
  trackProduct('user_menu_item_clicked', { source, item, timestamp: new Date().toISOString() });
};