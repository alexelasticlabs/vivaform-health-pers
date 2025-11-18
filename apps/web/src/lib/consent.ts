export type ConsentPreferences = {
  marketing: boolean;
  analytics: boolean; // reserved for future separation
  updatedAt: number;
};

const KEY = 'vivaform-consent';

const read = (): ConsentPreferences | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
};

export const hasMarketingConsent = () => {
  const prefs = read();
  return !!prefs?.marketing;
};

export const saveConsent = (prefs: Partial<ConsentPreferences>) => {
  const existing = read();
  const next: ConsentPreferences = {
    marketing: prefs.marketing ?? existing?.marketing ?? false,
    analytics: prefs.analytics ?? existing?.analytics ?? false,
    updatedAt: Date.now()
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

export const loadConsent = () => read();

