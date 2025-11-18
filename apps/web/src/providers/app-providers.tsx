import type { PropsWithChildren } from "react";
import { useEffect, lazy, Suspense } from "react";
import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
// React Query Devtools: lazy-load in dev to keep prod bundle clean
import { Toaster } from "sonner";

import { queryClient } from "@/lib/query-client";
import { useThemeStore } from "@/store/theme-store";
import { AuthBootstrapper } from "@/providers/auth-bootstrapper";
import { AnalyticsBootstrapper } from "@/providers/analytics-bootstrapper";
import { ConsentBanner } from "@/components/consent-banner";
import { StatusBanner } from "@/components/status-banner";

export const AppProviders = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Devtools are hidden by default, even in dev. Enable via:
  // - env: VITE_SHOW_RQ_DEVTOOLS=true
  // - query: ?rqdevtools=1
  // - localStorage: VIVA_SHOW_RQ_DEVTOOLS=1
  const enableRQDevtools = (() => {
    try {
      const envFlag = (import.meta as any)?.env?.VITE_SHOW_RQ_DEVTOOLS === 'true';
      if (envFlag) return true;
      if (typeof window === 'undefined') return false;
      const qs = new URLSearchParams(window.location.search);
      if (qs.get('rqdevtools') === '1') return true;
      if (window.localStorage.getItem('VIVA_SHOW_RQ_DEVTOOLS') === '1') return true;
      return false;
    } catch {
      return false;
    }
  })();

  const Devtools = enableRQDevtools
    ? lazy(() => import("@tanstack/react-query-devtools").then(m => ({ default: m.ReactQueryDevtools })))
    : null as unknown as React.ComponentType<any>;

  return (
    <Theme accentColor="blue" appearance={theme} radius="large">
      <QueryClientProvider client={queryClient}>
        <AuthBootstrapper />
        <AnalyticsBootstrapper />
        {children}
        <ConsentBanner />
        <StatusBanner />
        <Toaster richColors position="top-center" />
        {enableRQDevtools && Devtools ? (
          <Suspense fallback={null}>
            <Devtools initialIsOpen={false} position={"bottom-right" as any} />
          </Suspense>
        ) : null}
      </QueryClientProvider>
    </Theme>
  );
};
