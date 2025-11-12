import type { ExpoConfig } from "expo/config";

const defineConfig = (): ExpoConfig => {
  const env = ((globalThis as any)?.process?.env ?? {}) as Record<string, string | undefined>;
  const environment: Environment = (env.NODE_ENV as Environment) ?? "development";

  const projectId = env.EXPO_PUBLIC_EAS_PROJECT_ID || '';

  if (environment === 'production' && !projectId) {
    // Fail fast to prevent building without push credentials
    throw new Error('EXPO_PUBLIC_EAS_PROJECT_ID is required in production for push notifications');
  }

  return {
    name: "VivaForm",
    slug: "vivaform",
    version: "0.1.0",
    orientation: "portrait",
    scheme: "vivaform",
    userInterfaceStyle: "automatic",
    updates: {
      enabled: true
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    platforms: ["ios", "android", "web"],
    extra: {
      environment,
      apiUrl: env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
      checkoutSuccessUrl: env.EXPO_PUBLIC_CHECKOUT_SUCCESS_URL ?? "https://vivaform.app/checkout-success",
      checkoutCancelUrl: env.EXPO_PUBLIC_CHECKOUT_CANCEL_URL ?? "https://vivaform.app/checkout-cancel",
      eas: {
        projectId
      },
      push: {
        // Expose flag to runtime indicating push is fully configured
        enabled: !!projectId
      }
    },
    plugins: ["expo-router", "expo-secure-store", "expo-notifications"],
    experiments: {
      tsconfigPaths: true
    }
  };
};

export default defineConfig;