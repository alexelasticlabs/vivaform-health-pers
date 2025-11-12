import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/providers/app-providers';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/marketing.css';
import { initSentry } from '@/lib/sentry';

const MarketingLayout = React.lazy(() => import('./routes/slices/marketing-layout').then(m => ({ default: m.MarketingLayout })));
const LandingPage = React.lazy(() => import('@/pages/landing-page').then(m => ({ default: m.LandingPage })));
const PrivacyPage = React.lazy(() => import('@/pages/privacy-page').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('@/pages/terms-page').then(m => ({ default: m.TermsPage })));
const ArticlesPage = React.lazy(() => import('@/pages/articles-page').then(m => ({ default: m.ArticlesPage })));
const ArticleDetailPage = React.lazy(() => import('@/pages/article-detail-page').then(m => ({ default: m.ArticleDetailPage })));

const suspense = (el: React.ReactElement) => <React.Suspense fallback={<div className="p-4">Loading...</div>}>{el}</React.Suspense>;

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
