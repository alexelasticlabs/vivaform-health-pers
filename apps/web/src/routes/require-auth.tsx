﻿import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUserStore } from "@/store/user-store";

const allowE2EOverride =
	(import.meta.env.MODE === "test") || import.meta.env?.VITE_ALLOW_E2E_AUTH_OVERRIDE === "true";

export const RequireAuthOutlet = () => {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const location = useLocation();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const persistPlugin = useUserStore.persist;
		if (!persistPlugin) {
			setHydrated(true);
			return;
		}

		// Check if already hydrated
		if (persistPlugin.hasHydrated?.()) {
			setHydrated(true);
		}

		// Subscribe to hydration completion
		const unsubFinish = persistPlugin.onFinishHydration?.(() => setHydrated(true));
		return () => {
			unsubFinish?.();
		};
	}, []);

	const e2eOverride =
		allowE2EOverride && typeof window !== "undefined" && Boolean((window as any).__E2E_AUTH_OVERRIDE__ || (window as any).E2E_AUTH_OVERRIDE);
	if (e2eOverride) {
		return <Outlet />;
	}

	// If user is authenticated, hydration is complete (state was just set)
	if (isAuthenticated) {
		return <Outlet />;
	}

	// If not authenticated and still hydrating, show loading
	if (!hydrated) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
				Loading your profile…
			</div>
		);
	}

	// Not authenticated and hydration complete - redirect to login
	return <Navigate to="/login" replace state={{ from: location }} />;
};

// Legacy RequireAuth removed; use <RequireAuthOutlet /> in routers.
