import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUserStore } from "../store/user-store";

export const RequireAuthOutlet = () => {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const hasHydrated = useUserStore.persist?.hasHydrated?.() ?? true;
	const location = useLocation();

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

// Временная совместимость: старый компонент остаётся как обёртка
export const RequireAuth = ({ children }: PropsWithChildren) => {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const hasHydrated = useUserStore.persist?.hasHydrated?.() ?? true;
	const location = useLocation();

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

	return children;
};