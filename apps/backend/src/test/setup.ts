import "reflect-metadata";

// Environment variables are loaded by vitest
if (process.setMaxListeners) {
  process.setMaxListeners(20);
}