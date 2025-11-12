import { createBrowserRouter } from "react-router-dom";
import React from "react";

const MarketingLayout = React.lazy(() => import("./slices/marketing-layout").then(m => ({ default: m.MarketingLayout })));
const RequireAuthOutlet = React.lazy(() => import("./require-auth").then(m => ({ default: m.RequireAuthOutlet })));
const DashboardPage = React.lazy(() => import("@/pages/dashboard/dashboard-page").then(m => ({ default: m.DashboardPage })));
const LandingPage = React.lazy(() => import("@/pages/landing-page").then(m => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import("@/pages/login-page").then(m => ({ default: m.LoginPage })));
const NotFoundPage = React.lazy(() => import("@/pages/not-found-page").then(m => ({ default: m.NotFoundPage })));
const RegisterPage = React.lazy(() => import("@/pages/register-page").then(m => ({ default: m.RegisterPage })));
const ProgressPage = React.lazy(() => import("@/pages/progress-page").then(m => ({ default: m.ProgressPage })));
const RecommendationsPage = React.lazy(() => import("@/pages/recommendations-page").then(m => ({ default: m.RecommendationsPage })));
const SettingsPage = React.lazy(() => import("@/pages/settings-page").then(m => ({ default: m.SettingsPage })));
const QuizPage = React.lazy(() => import("@/pages/quiz-page").then(m => ({ default: m.QuizPage })));
const ForgotPasswordPage = React.lazy(() => import("@/pages/forgot-password-page").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import("@/pages/reset-password-page").then(m => ({ default: m.ResetPasswordPage })));
const ForceChangePasswordPage = React.lazy(() => import("@/pages/force-change-password-page").then(m => ({ default: m.ForceChangePasswordPage })));
const EmailVerificationPage = React.lazy(() => import("@/pages/email-verification-page").then(m => ({ default: m.EmailVerificationPage })));
const PremiumPage = React.lazy(() => import("@/pages/premium-page"));
const PremiumHistoryPage = React.lazy(() => import("@/pages/premium-history-page").then(m => ({ default: m.default })));
const MealPlannerPage = React.lazy(() => import("@/pages/meal-planner-page").then(m => ({ default: m.MealPlannerPage })));
const AdminGuard = React.lazy(() => import("@/routes/slices/admin-guard").then(m => ({ default: m.AdminGuard })));
const ArticlesPage = React.lazy(() => import("@/pages/articles-page").then(m => ({ default: m.ArticlesPage })));
const ArticleDetailPage = React.lazy(() => import("@/pages/article-detail-page").then(m => ({ default: m.ArticleDetailPage })));
const PrivacyPage = React.lazy(() => import("@/pages/privacy-page").then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import("@/pages/terms-page").then(m => ({ default: m.TermsPage })));
const MyPlanPage = React.lazy(() => import("@/pages/my-plan-page").then(m => ({ default: m.MyPlanPage })));
const AppLayout = React.lazy(() => import("./slices/app-layout").then(m => ({ default: m.AppLayout })));

// Обёртка Suspense
const suspense = (el: React.ReactElement) => <React.Suspense fallback={<div className="p-4">Loading...</div>}>{el}</React.Suspense>;

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: "/",
      element: suspense(<MarketingLayout />),
      children: [
        { index: true, element: suspense(<LandingPage />) },
        { path: "login", element: suspense(<LoginPage />) },
        { path: "register", element: suspense(<RegisterPage />) },
        { path: "quiz", element: suspense(<QuizPage />) },
        { path: "forgot-password", element: suspense(<ForgotPasswordPage />) },
        { path: "reset-password", element: suspense(<ResetPasswordPage />) },
        { path: "force-change-password", element: suspense(<ForceChangePasswordPage />) },
        { path: "verify-email", element: suspense(<EmailVerificationPage />) },
        { path: "premium", element: suspense(<PremiumPage />) },
        // { path: "premium/history", element: suspense(<PremiumHistoryPage />) }, // moved under auth
        { path: "articles", element: suspense(<ArticlesPage />) },
        { path: "articles/:slug", element: suspense(<ArticleDetailPage />) },
        { path: "privacy", element: suspense(<PrivacyPage />) },
        { path: "terms", element: suspense(<TermsPage />) }
      ]
    },
    {
      path: "/app",
      element: suspense(<RequireAuthOutlet />),
      children: [
        {
          element: suspense(<AppLayout />),
          children: [
            { index: true, element: suspense(<DashboardPage />) },
            { path: "progress", element: suspense(<ProgressPage />) },
            { path: "recommendations", element: suspense(<RecommendationsPage />) },
            { path: "meal-planner", element: suspense(<MealPlannerPage />) },
            { path: "admin", element: suspense(<AdminGuard />) },
            { path: "settings", element: suspense(<SettingsPage />) },
            { path: "my-plan", element: suspense(<MyPlanPage />) },
            { path: "premium/history", element: suspense(<PremiumHistoryPage />) } // moved under auth
          ]
        }
      ]
    },
    { path: "*", element: suspense(<NotFoundPage />) }
  ]);
