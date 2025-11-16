import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/providers/app-providers';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/marketing.css';
import { initSentry } from '@/lib/sentry';
import { PageSkeleton } from '@/components/ui/skeleton';

const MarketingLayout = React.lazy(() => import('./routes/slices/marketing-layout').then(m => ({ default: m.MarketingLayout })));
const LandingPage = React.lazy(() => import('@/pages/landing-page').then(m => ({ default: m.LandingPage })));
const PrivacyPage = React.lazy(() => import('@/pages/privacy-page').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('@/pages/terms-page').then(m => ({ default: m.TermsPage })));
const ArticlesPage = React.lazy(() => import('@/pages/articles-page').then(m => ({ default: m.ArticlesPage })));
const ArticleDetailPage = React.lazy(() => import('@/pages/article-detail-page').then(m => ({ default: m.ArticleDetailPage })));

const suspense = (el: React.ReactElement) => <React.Suspense fallback={<PageSkeleton />}>{el}</React.Suspense>;

const router = createBrowserRouter([
  {
    path: '/',
    element: suspense(<MarketingLayout />),
    children: [
      { index: true, element: suspense(<LandingPage />) },
      { path: 'articles', element: suspense(<ArticlesPage />) },
      { path: 'articles/:slug', element: suspense(<ArticleDetailPage />) },
      { path: 'privacy', element: suspense(<PrivacyPage />) },
      { path: 'terms', element: suspense(<TermsPage />) },
    ]
  }
]);

initSentry();

function getOrCreateRoot(container: HTMLElement) {
  const key = '__vivaform_marketing_root__';
  const w = window as any;
  if (!w[key]) {
    w[key] = ReactDOM.createRoot(container);
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        try { w[key]?.unmount?.(); } catch {}
        w[key] = undefined;
      });
    }
  }
  return w[key] as ReturnType<typeof ReactDOM.createRoot>;
}

const root = getOrCreateRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
