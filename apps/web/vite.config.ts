import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vivaform/shared": path.resolve(__dirname, "../../packages/shared/src")
    }
  },
  server: {
    port: 5173,
    open: true
  },
  // Vitest picks up this block; TypeScript does not include it in Vite's config type yet.
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
} as import("vite").UserConfig);