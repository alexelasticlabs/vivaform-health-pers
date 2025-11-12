import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AppShell } from "@/components/layouts/app-shell";
import { PageSkeleton } from "@/components/ui/skeleton";

export const AppLayout = () => {
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};