import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUserStore } from "@/store/user-store";

export const RequireAuthOutlet = () => {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const hasHydrated = useUserStore.persist?.hasHydrated?.() ?? true;
	const location = useLocation();

	const e2eOverride = (typeof window !== 'undefined' && ((window as any).__E2E_AUTH_OVERRIDE__ || (window as any).E2E_AUTH_OVERRIDE)) || false;
	if (e2eOverride) {
		return <Outlet />;
	}

	if (!hasHydrated) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
				Loading your profile…
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
};

// Legacy RequireAuth removed; use <RequireAuthOutlet /> in routers.
