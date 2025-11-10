import type { ExpoConfig } from "expo/config";

type Environment = "development" | "production";

const defineConfig = (): ExpoConfig => {
  const environment: Environment = (process.env.NODE_ENV as Environment) ?? "development";

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
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
      checkoutSuccessUrl: process.env.EXPO_PUBLIC_CHECKOUT_SUCCESS_URL ?? "https://vivaform.app/checkout-success",
      checkoutCancelUrl: process.env.EXPO_PUBLIC_CHECKOUT_CANCEL_URL ?? "https://vivaform.app/checkout-cancel",
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || ""
      }
    },
    plugins: ["expo-router", "expo-secure-store", "expo-notifications"],
    experiments: {
      tsconfigPaths: true
    }
  };
};

export default defineConfig;