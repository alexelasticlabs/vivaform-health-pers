import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

// Универсальный error boundary для маршрутов react-router
export function RouteErrorBoundary() {
  const error = useRouteError();
  let title = 'Something went wrong';
  let message: string | React.ReactNode = 'Unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Часто встречающаяся проблема: динамический импорт не загрузился (например, перезапуск dev сервера)
  const isDynamicImportError = typeof message === 'string' && /Failed to fetch dynamically imported module/i.test(message);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h1>
      <div style={{ marginBottom: '1rem', color: '#555' }}>{message}</div>
      {isDynamicImportError && (
        <div style={{ marginBottom: '1rem', background: '#fffbe6', border: '1px solid #ffe58f', padding: '0.75rem', borderRadius: 8 }}>
          <strong>Tip:</strong> Это часто происходит, когда dev‑сервер перезапустился и браузер держит старые ссылки на модули. Попробуйте обновить страницу (Ctrl+R). Если используете Service Worker или SW кеш браузера – очистите кеш.
        </div>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#10b981',
          color: '#fff',
            border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: 12,
          cursor: 'pointer',
          fontWeight: 600
        }}
      >Reload</button>
    </div>
  );
}

