import "reflect-metadata";
import { config } from "dotenv";
import path from "path";

// Load .env.test for E2E tests BEFORE any modules load
const result = config({ path: path.resolve(__dirname, "../../.env.test") });

if (result.error) {
  console.error("Failed to load .env.test:", result.error);
} else {
  console.log("✅ Loaded .env.test with", Object.keys(result.parsed || {}).length, "variables");
}

if (process.setMaxListeners) {
  process.setMaxListeners(20);
}
