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

  const isDev = import.meta.env.DEV;

  return (
    <Theme accentColor="blue" appearance={theme} radius="large">
      <QueryClientProvider client={queryClient}>
        <AuthBootstrapper />
        <AnalyticsBootstrapper />
        {children}
        <ConsentBanner />
        <StatusBanner />
        <Toaster richColors position="top-center" />
        {isDev ? <ReactQueryDevtools position={"bottom-right" as any} /> : null}
      </QueryClientProvider>
    </Theme>
  );
};
