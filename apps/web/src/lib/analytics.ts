declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;

let initialized = false;

const loadMetaPixel = (id: string) => {
  if (typeof window === "undefined") {
    return;
  }

  if (document.getElementById("meta-pixel")) {
    return;
  }

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
  if (typeof window === "undefined" || window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);

  if (document.getElementById("google-ads")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "google-ads";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
};

export const initAnalytics = () => {
  if (initialized) {
    return;
  }

  if (!META_PIXEL_ID && !GOOGLE_ADS_ID) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[analytics] Meta Pixel and Google Ads IDs are not provided. Skipping initialization.");
    }
    return;
  }

  if (META_PIXEL_ID) {
    loadMetaPixel(META_PIXEL_ID);
  }

  if (GOOGLE_ADS_ID) {
    loadGoogleAds(GOOGLE_ADS_ID);
  }

  initialized = true;
};

export const trackConversion = (event: string, payload?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event}`, payload);
  }

  if (META_PIXEL_ID && window.fbq) {
    window.fbq("trackCustom", event, payload ?? {});
  }

  if (GOOGLE_ADS_ID && window.gtag) {
    window.gtag("event", event, payload ?? {});
  }
};

// Quiz-specific analytics events
export const logQuizStart = (clientId: string) => {
  trackConversion("quiz_start", {
    clientId,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizSectionCompleted = (clientId: string, sectionId: string, progress: number) => {
  trackConversion("quiz_section_completed", {
    clientId,
    sectionId,
    progress, // 0-100
    timestamp: new Date().toISOString(),
  });
};

export const logQuizSubmitSuccess = (clientId: string, userId?: string, durationSeconds?: number) => {
  trackConversion("quiz_submit_success", {
    clientId,
    userId,
    durationSeconds,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizSubmitError = (clientId: string, error: string) => {
  trackConversion("quiz_submit_error", {
    clientId,
    error,
    timestamp: new Date().toISOString(),
  });
};