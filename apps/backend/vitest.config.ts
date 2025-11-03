import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts", "src/test/e2e/**/*.e2e-spec.ts"],
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage"
    },
    testTimeout: 30000 // 30 seconds for e2e tests
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    conditions: ["node"]
  },
  server: {
    deps: {
      inline: ["dotenv"]
    }
  }
});