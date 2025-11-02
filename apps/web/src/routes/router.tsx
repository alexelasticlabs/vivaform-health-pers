import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./slices/app-layout";
import { MarketingLayout } from "./slices/marketing-layout";
import { RequireAuth } from "./require-auth";
import { DashboardPage } from "../pages/dashboard/dashboard-page";
import { LandingPage } from "../pages/landing-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";
import { RegisterPage } from "../pages/register-page";
import { ProgressPage } from "../pages/progress-page";
import { RecommendationsPage } from "../pages/recommendations-page";
import { SettingsPage } from "../pages/settings-page";

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
        }
      ]
    },
    {
      path: "/app",
      element: (
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
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
          path: "settings",
          element: <SettingsPage />
        }
      ]
    },
    {
      path: "*",
      element: <NotFoundPage />
    }
  ]);