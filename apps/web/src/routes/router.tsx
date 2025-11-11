import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./slices/app-layout";
import { MarketingLayout } from "./slices/marketing-layout";
import { RequireAuth, RequireAuthOutlet } from "./require-auth";
import { DashboardPage } from "../pages/dashboard/dashboard-page";
import { LandingPage } from "../pages/landing-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";
import { RegisterPage } from "../pages/register-page";
import { ProgressPage } from "../pages/progress-page";
import { RecommendationsPage } from "../pages/recommendations-page";
import { SettingsPage } from "../pages/settings-page";
import { QuizPage } from "../pages/quiz-page";
import { ForgotPasswordPage } from "../pages/forgot-password-page";
import { ResetPasswordPage } from "../pages/reset-password-page";
import { ForceChangePasswordPage } from "../pages/force-change-password-page";
import { EmailVerificationPage } from "../pages/email-verification-page";
import PremiumPage from "../pages/premium-page";
import { MealPlannerPage } from "../pages/meal-planner-page";
import { AdminPage } from "../pages/admin-page";
import { ArticlesPage } from "../pages/articles-page";
import { ArticleDetailPage } from "../pages/article-detail-page";
import { PrivacyPage } from "../pages/privacy-page";
import { TermsPage } from "../pages/terms-page";
import { MyPlanPage } from "../pages/my-plan-page";

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: "/",
      element: <MarketingLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />
        },
        {
          path: "login",
          element: <LoginPage />
        },
        {
          path: "register",
          element: <RegisterPage />
        },
        {
          path: "quiz",
          element: <QuizPage />
        },
        {
          path: "forgot-password",
          element: <ForgotPasswordPage />
        },
        {
          path: "reset-password",
          element: <ResetPasswordPage />
        },
        {
          path: "force-change-password",
          element: <ForceChangePasswordPage />
        },
        {
          path: "verify-email",
          element: <EmailVerificationPage />
        },
        {
          element: <RequireAuthOutlet />,
          children: [
            { path: "premium", element: <PremiumPage /> }
          ]
        },
        {
          path: "articles",
          element: <ArticlesPage />
        },
        {
          path: "articles/:slug",
          element: <ArticleDetailPage />
        },
        {
          path: "privacy",
          element: <PrivacyPage />
        },
        {
          path: "terms",
          element: <TermsPage />
        }
      ]
    },
    {
      path: "/app",
      element: (
        <RequireAuthOutlet />
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />
        },
        {
          path: "progress",
          element: <ProgressPage />
        },
        {
          path: "recommendations",
          element: <RecommendationsPage />
        },
        {
          path: "meal-planner",
          element: <MealPlannerPage />
        },
        {
          path: "admin",
          element: <AdminPage />
        },
        {
          path: "settings",
          element: <SettingsPage />
        },
        {
          path: "my-plan",
          element: <MyPlanPage />
        }
      ]
    },
    {
      path: "*",
      element: <NotFoundPage />
    }
  ]);