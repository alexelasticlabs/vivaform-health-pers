import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

// Error boundary for React Router routes
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

  // Detect dynamic import failures (common during dev server restarts)
  const isDynamicImportError = typeof message === 'string' && /Failed to fetch dynamically imported module/i.test(message);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h1>
      <div style={{ marginBottom: '1rem', color: '#555' }}>{message}</div>
      {isDynamicImportError && (
        <div style={{ marginBottom: '1rem', background: '#fffbe6', border: '1px solid #ffe58f', padding: '0.75rem', borderRadius: 8 }}>
          <strong>Tip:</strong> This usually happens after a dev server restart when the browser keeps stale module links. Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). If a Service Worker is enabled, clear it and reload.
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
      >Reload Page</button>
    </div>
  );
}

