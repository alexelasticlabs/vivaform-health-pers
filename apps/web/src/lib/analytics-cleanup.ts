/**
 * Очистка аналитических идентификаторов при logout
 * Вызывается из logout() в user-store
 */
export function cleanupAnalyticsIdentifiers(): void {
  try {
    // Удаляем анонимный ID product analytics
    localStorage.removeItem('vf_anon_id');

    // Удаляем quiz client ID
    localStorage.removeItem('vivaform-quiz-clientId');

    // Очищаем Meta Pixel (если был инициализирован)
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('init', ''); // reset
      } catch {}
    }

    // Очищаем Google Analytics client ID (если доступен через gtag)
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

