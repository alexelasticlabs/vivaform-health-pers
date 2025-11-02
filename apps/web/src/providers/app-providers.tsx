import { PropsWithChildren, useEffect } from "react";
import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { queryClient } from "../lib/query-client";
import { useThemeStore } from "../store/theme-store";
import { AuthBootstrapper } from "./auth-bootstrapper";

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

  return (
    <Theme accentColor="blue" appearance={theme} radius="large">
      <QueryClientProvider client={queryClient}>
        <AuthBootstrapper />
        {children}
        <Toaster richColors position="top-center" />
        {isDev ? <ReactQueryDevtools position={"bottom-right" as any} /> : null}
      </QueryClientProvider>
    </Theme>
  );
};
