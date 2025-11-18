/**
 * Clear analytics identifiers on logout
 * Called from logout() in user-store
 */
export function cleanupAnalyticsIdentifiers(): void {
  try {
    // Remove anonymous product analytics ID
    localStorage.removeItem('vf_anon_id');

    // Remove quiz client ID
    localStorage.removeItem('vivaform-quiz-clientId');

    // Reset Meta Pixel (if initialized)
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('init', ''); // reset
      } catch {}
    }

    // Clear Google Analytics client ID (if available via gtag)
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('config', '', { client_id: undefined });
      } catch {}
    }

    console.debug('[analytics-cleanup] Identifiers cleared on logout');
  } catch (e) {
    console.warn('[analytics-cleanup] Failed to clear identifiers:', e);
  }
}

