﻿import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUserStore } from "@/store/user-store";

const allowE2EOverride =
	(import.meta.env.MODE === "test") || import.meta.env?.VITE_ALLOW_E2E_AUTH_OVERRIDE === "true";

export const RequireAuthOutlet = () => {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const hasHydrated = useUserStore.persist?.hasHydrated?.() ?? true;
	const location = useLocation();

	const e2eOverride =
		allowE2EOverride && typeof window !== "undefined" && Boolean((window as any).__E2E_AUTH_OVERRIDE__ || (window as any).E2E_AUTH_OVERRIDE);
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
