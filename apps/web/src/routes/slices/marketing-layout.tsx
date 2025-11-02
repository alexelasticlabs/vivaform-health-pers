import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { MarketingShell } from "../../components/layouts/marketing-shell";

export const MarketingLayout = () => {
  return (
    <MarketingShell>
      <Suspense fallback={<div className="p-6">Loading VivaForm…</div>}>
        <Outlet />
      </Suspense>
    </MarketingShell>
  );
};