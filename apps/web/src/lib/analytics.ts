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

// Extended funnel
export const logQuizStepViewed = (clientId: string, stepId: string) => {
  trackConversion("quiz_step_viewed", {
    clientId,
    stepId,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizOptionSelected = (clientId: string, stepId: string, field: string, value: unknown) => {
  trackConversion("quiz_option_selected", {
    clientId,
    stepId,
    field,
    value,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizSliderChanged = (clientId: string, stepId: string, field: string, value: number) => {
  trackConversion("quiz_slider_changed", {
    clientId,
    stepId,
    field,
    value,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizToggleChanged = (clientId: string, stepId: string, field: string, value: boolean) => {
  trackConversion("quiz_toggle_changed", {
    clientId,
    stepId,
    field,
    value,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizPreviewSaved = (clientId: string) => {
  trackConversion("quiz_preview_saved", {
    clientId,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizFinalStepViewed = (clientId: string) => {
  trackConversion("quiz_final_step_viewed", {
    clientId,
    timestamp: new Date().toISOString(),
  });
};

// Navigation & CTA clicks
export const logQuizNextClicked = (clientId: string, stepId: string) => {
  trackConversion("quiz_next_clicked", {
    clientId,
    stepId,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizBackClicked = (clientId: string, stepId: string) => {
  trackConversion("quiz_back_clicked", {
    clientId,
    stepId,
    timestamp: new Date().toISOString(),
  });
};

export const logQuizCtaClicked = (
  clientId: string,
  placement: 'desktop_nav' | 'mobile_sticky' | 'landing' | 'other',
  label: string,
  stepId?: string,
) => {
  trackConversion("quiz_cta_clicked", {
    clientId,
    placement,
    label,
    stepId,
    timestamp: new Date().toISOString(),
  });
};

// Header user menu analytics
export const logUserMenuOpened = (source: 'marketing' | 'app') => {
  trackConversion('user_menu_opened', {
    source,
    timestamp: new Date().toISOString(),
  });
};

export const logUserMenuItemClicked = (source: 'marketing' | 'app', item: string) => {
  trackConversion('user_menu_item_clicked', {
    source,
    item,
    timestamp: new Date().toISOString(),
  });
};