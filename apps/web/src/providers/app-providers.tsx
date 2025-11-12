import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/query-client";
import { useThemeStore } from "@/store/theme-store";
import { AuthBootstrapper } from "@/providers/auth-bootstrapper";
import { AnalyticsBootstrapper } from "@/providers/analytics-bootstrapper";
import { ConsentBanner } from "@/components/consent-banner";

export const AppProviders = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Используем compile-time флаг Vite, чтобы прод-сборка смогла удалить devtools из бандла
  const isDev = import.meta.env.DEV;
  const mocksOn = isDev && (import.meta.env.VITE_API_MOCKS === '1' || import.meta.env.VITE_AUTO_AUTH_MOCKS === '1');

  return (
    <Theme accentColor="blue" appearance={theme} radius="large">
      <QueryClientProvider client={queryClient}>
        <AuthBootstrapper />
        <AnalyticsBootstrapper />
        {children}
        <ConsentBanner />
        <Toaster richColors position="top-center" />
        {isDev ? <ReactQueryDevtools position={"bottom-right" as any} /> : null}
        {mocksOn && (
          <div data-testid="mocks-banner" className="fixed bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-md bg-amber-100 px-3 py-1 text-xs text-amber-800 shadow">
            API mocks are active (demo mode)
          </div>
        )}
      </QueryClientProvider>
    </Theme>
  );
};
