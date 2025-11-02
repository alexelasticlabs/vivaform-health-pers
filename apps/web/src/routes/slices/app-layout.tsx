import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AppShell } from "../../components/layouts/app-shell";

export const AppLayout = () => {
  return (
    <AppShell>
  <Suspense fallback={<div className="p-6">Loading data…</div>}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};