﻿import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Environment validation: enforce VITE_API_URL for production builds
const requireEnvForProd = () => {
  // Check only for explicit production builds (not dev, not test)
  const command = process.env.npm_lifecycle_event || '';
  const isProdBuild = command === 'build' && !process.env.VITE_API_URL && process.env.NODE_ENV !== 'development';

  // In CI/CD and production deploy, VITE_API_URL must be provided
  if (process.env.CI && command === 'build' && !process.env.VITE_API_URL) {
    throw new Error("[build] VITE_API_URL is required for production builds in CI");
  }
};
requireEnvForProd();

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://api.vivaform.app https://api.vivaform.health https://www.google-analytics.com https://stats.g.doubleclick.net",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join("; ");

const DEV_CSP = [
  "default-src 'self' blob: data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173 https://api.vivaform.app https://api.vivaform.health",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'"
].join("; ");

const createSecurityHeaders = (isDev: boolean) => {
  const headers: Record<string, string> = {
    "Content-Security-Policy": isDev ? DEV_CSP : PROD_CSP,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin"
  };
  if (!isDev) {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
};

const devHeaders = createSecurityHeaders(true);
const prodHeaders = createSecurityHeaders(false);
const enableSourceMaps = process.env.VITE_ENABLE_SOURCEMAP === 'true';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: enableSourceMaps,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        marketing: path.resolve(__dirname, 'marketing.html')
      }
    },
    cssCodeSplit: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vivaform/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@/test": path.resolve(__dirname, "./src/test"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/api": path.resolve(__dirname, "./src/api"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/utils": path.resolve(__dirname, "./src/utils")
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    headers: devHeaders,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true,
        rewrite: (pathStr) => pathStr.replace(/^\/api/, ""),
        ws: true
      }
    }
  },
  preview: {
    headers: prodHeaders
  },
  // Vitest picks up this block; TypeScript does not include it in Vite's config type yet.
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
} as import("vite").UserConfig);