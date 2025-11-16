import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { MarketingShell } from "@/components/layouts/marketing-shell";
import { PageSkeleton } from "@/components/ui/skeleton";

export const MarketingLayout = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const authPaths = new Set([
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/force-change-password",
    "/verify-email",
  ]);

  const isAuthPage = authPaths.has(pathname);

  if (isAuthPage) {
    // Render auth pages without the marketing header/footer; AuthLayout handles background/staging
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    );
  }

  return (
    <MarketingShell>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </MarketingShell>
  );
};