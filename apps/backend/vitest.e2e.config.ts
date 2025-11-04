import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/test/e2e/**/*.e2e-spec.ts"],
    setupFiles: "./src/test/setup-e2e.ts",
    testTimeout: 30000, // 30 seconds for e2e tests
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage-e2e"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    conditions: ["node"]
  }
});
