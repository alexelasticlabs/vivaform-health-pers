/**
 * Router V2
 * Updated routing with separate admin portal and new dashboard
 */

import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import { RouteErrorBoundary } from './error-boundary';
import { PageSkeleton } from '@/components/ui/skeleton';

// Lazy loading utility with retry
function lazyWithRetry<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      return await loader();
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (/Failed to fetch dynamically imported module|Importing a module script failed/i.test(msg)) {
        try {
          const key = 'vivaform:dynamic-import-reloaded';
          const already = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : '1';
          if (!already && typeof window !== 'undefined') {
            window.sessionStorage.setItem(key, '1');
            window.location.reload();
          }
        } catch {
          /* ignore */
        }
      }
      throw e;
    }
  });
}

// Layouts
const MarketingLayout = lazyWithRetry(
  () => import('./slices/marketing-layout').then((m) => ({ default: m.MarketingLayout })) as any
);
const AppLayout = lazyWithRetry(
  () => import('./slices/app-layout').then((m) => ({ default: m.AppLayout })) as any
);
const AdminLayoutV2 = lazyWithRetry(
  () => import('@/components/admin/admin-layout-v2').then((m) => ({ default: m.AdminLayoutV2 })) as any
);

// Guards
const RequireAuthOutlet = lazyWithRetry(
  () => import('./require-auth').then((m) => ({ default: m.RequireAuthOutlet })) as any
);
const AdminGuard = lazyWithRetry(
  () => import('@/routes/slices/admin-guard').then((m) => ({ default: m.AdminGuard })) as any
);

// Public Pages
const LandingPage = lazyWithRetry(
  () => import('@/pages/landing-page').then((m) => ({ default: m.LandingPage })) as any
);
const LoginPage = lazyWithRetry(
  () => import('@/pages/login-page').then((m) => ({ default: m.LoginPage })) as any
);
const RegisterPage = lazyWithRetry(
  () => import('@/pages/register-page').then((m) => ({ default: m.RegisterPage })) as any
);
const QuizPage = lazyWithRetry(() => import('@/pages/quiz-page').then((m) => ({ default: m.QuizPage })) as any);
const ForgotPasswordPage = lazyWithRetry(
  () => import('@/pages/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage })) as any
);
const ResetPasswordPage = lazyWithRetry(
  () => import('@/pages/reset-password-page').then((m) => ({ default: m.ResetPasswordPage })) as any
);
const ForceChangePasswordPage = lazyWithRetry(
  () => import('@/pages/force-change-password-page').then((m) => ({ default: m.ForceChangePasswordPage })) as any
);
const EmailVerificationPage = lazyWithRetry(
  () => import('@/pages/email-verification-page').then((m) => ({ default: m.EmailVerificationPage })) as any
);
const PremiumPage = lazyWithRetry(() => import('@/pages/premium-page') as any);
const ArticlesPage = lazyWithRetry(
  () => import('@/pages/articles-page').then((m) => ({ default: m.ArticlesPage })) as any
);
const ArticleDetailPage = lazyWithRetry(
  () => import('@/pages/article-detail-page').then((m) => ({ default: m.ArticleDetailPage })) as any
);
const PrivacyPage = lazyWithRetry(
  () => import('@/pages/privacy-page').then((m) => ({ default: m.PrivacyPage })) as any
);
const TermsPage = lazyWithRetry(() => import('@/pages/terms-page').then((m) => ({ default: m.TermsPage })) as any);
const NotFoundPage = lazyWithRetry(
  () => import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })) as any
);

// User Pages - switch to classic Dashboard
const DashboardPage = lazyWithRetry(
  () => import('@/pages/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage })) as any
);
const ProgressPage = lazyWithRetry(
  () => import('@/pages/progress-page').then((m) => ({ default: m.ProgressPage })) as any
);
const RecommendationsPage = lazyWithRetry(
  () => import('@/pages/recommendations-page').then((m) => ({ default: m.RecommendationsPage })) as any
);
const SettingsPage = lazyWithRetry(
  () => import('@/pages/settings-page').then((m) => ({ default: m.SettingsPage })) as any
);
const MealPlannerPage = lazyWithRetry(
  () => import('@/pages/meal-planner-page').then((m) => ({ default: m.MealPlannerPage })) as any
);
const MyPlanPage = lazyWithRetry(
  () => import('@/pages/my-plan-page').then((m) => ({ default: m.MyPlanPage })) as any
);
const PremiumHistoryPage = lazyWithRetry(
  () => import('@/pages/premium-history-page').then((m) => ({ default: m.default })) as any
);

// Admin Pages - NEW Login
const AdminLoginPage = lazyWithRetry(
  () => import('@/pages/admin/admin-login-page').then((m) => ({ default: m.AdminLoginPage })) as any
);
const AdminOverviewPage = lazyWithRetry(
  () => import('@/pages/admin/overview-page').then((m) => ({ default: m.AdminOverviewPage })) as any
);
const AdminUsersPage = lazyWithRetry(
  () => import('@/pages/admin/users-page').then((m) => ({ default: m.AdminUsersPage })) as any
);
const AdminFoodsPage = lazyWithRetry(
  () => import('@/pages/admin/foods-page').then((m) => ({ default: m.AdminFoodsPage })) as any
);
const AdminSubscriptionsPage = lazyWithRetry(
  () => import('@/pages/admin/subscriptions-page').then((m) => ({ default: m.AdminSubscriptionsPage })) as any
);
const AdminSupportPage = lazyWithRetry(
  () => import('@/pages/admin/support-page').then((m) => ({ default: m.AdminSupportPage })) as any
);
const AdminSettingsPage = lazyWithRetry(
  () => import('@/pages/admin/settings-page').then((m) => ({ default: m.AdminSettingsPage })) as any
);
const AdminArticlesPage = lazyWithRetry(
  () => import('@/pages/admin/articles-page').then((m) => ({ default: m.AdminArticlesPage })) as any
);
const AdminFeatureTogglesPage = lazyWithRetry(
  () => import('@/pages/admin/feature-toggles-page').then((m) => ({ default: m.FeatureTogglesPage })) as any
);
const AdminAuditLogsPage = lazyWithRetry(
  () => import('@/pages/admin/audit-logs-page').then((m) => ({ default: m.AuditLogsPage })) as any
);

// Suspense wrapper
const suspense = (el: React.ReactElement) => <React.Suspense fallback={<PageSkeleton />}>{el}</React.Suspense>;

export const createAppRouter = () =>
  createBrowserRouter([
    // ===== PUBLIC ROUTES =====
    {
      path: '/',
      element: suspense(<MarketingLayout />),
      errorElement: <RouteErrorBoundary />,
      children: [
        { index: true, element: suspense(<LandingPage />) },
        { path: 'login', element: suspense(<LoginPage />) },
        { path: 'register', element: suspense(<RegisterPage />) },
        { path: 'quiz', element: suspense(<QuizPage />) },
        { path: 'forgot-password', element: suspense(<ForgotPasswordPage />) },
        { path: 'reset-password', element: suspense(<ResetPasswordPage />) },
        { path: 'force-change-password', element: suspense(<ForceChangePasswordPage />) },
        { path: 'verify-email', element: suspense(<EmailVerificationPage />) },
        { path: 'premium', element: suspense(<PremiumPage />) },
        { path: 'articles', element: suspense(<ArticlesPage />) },
        { path: 'articles/:slug', element: suspense(<ArticleDetailPage />) },
        { path: 'privacy', element: suspense(<PrivacyPage />) },
        { path: 'terms', element: suspense(<TermsPage />) },
      ],
    },

    // ===== ADMIN PORTAL (SEPARATE from /app) =====
    {
      path: '/admin',
      children: [
        // Admin login - separate from user login
        {
          path: 'login',
          element: suspense(<AdminLoginPage />),
        },
        // Admin dashboard - protected
        {
          path: '',
          element: suspense(<RequireAuthOutlet />),
          errorElement: <RouteErrorBoundary />,
          children: [
            {
              element: suspense(<AdminGuard />),
              children: [
                {
                  element: suspense(<AdminLayoutV2 />),
                  children: [
                    { index: true, element: suspense(<AdminOverviewPage />) },
                    { path: 'users', element: suspense(<AdminUsersPage />) },
                    { path: 'foods', element: suspense(<AdminFoodsPage />) },
                    { path: 'subscriptions', element: suspense(<AdminSubscriptionsPage />) },
                    { path: 'articles', element: suspense(<AdminArticlesPage />) },
                    { path: 'support', element: suspense(<AdminSupportPage />) },
                    { path: 'settings', element: suspense(<AdminSettingsPage />) },
                    { path: 'feature-toggles', element: suspense(<AdminFeatureTogglesPage />) },
                    { path: 'audit-logs', element: suspense(<AdminAuditLogsPage />) },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ===== USER APP ROUTES =====
    {
      path: '/app',
      element: suspense(<RequireAuthOutlet />),
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          element: suspense(<AppLayout />),
          children: [
            // Classic Dashboard
            { index: true, element: suspense(<DashboardPage />) },
            { path: 'progress', element: suspense(<ProgressPage />) },
            { path: 'recommendations', element: suspense(<RecommendationsPage />) },
            { path: 'meal-planner', element: suspense(<MealPlannerPage />) },
            { path: 'settings', element: suspense(<SettingsPage />) },
            { path: 'my-plan', element: suspense(<MyPlanPage />) },
            { path: 'premium/history', element: suspense(<PremiumHistoryPage />) },
          ],
        },
        // Legacy admin routes under /app/admin (redirect to /admin)
        {
          path: 'admin/*',
          element: suspense(
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">Admin Portal Moved</h1>
                <p className="mb-4 text-slate-600">
                  The admin portal has moved to <code className="rounded bg-slate-100 px-2 py-1">/admin</code>
                </p>
                <a href="/admin" className="text-emerald-600 hover:underline">
                  Go to Admin Portal →
                </a>
              </div>
            </div>
          ),
        },
      ],
    },

    // ===== 404 =====
    { path: '*', element: suspense(<NotFoundPage />), errorElement: <RouteErrorBoundary /> },
  ]);
