import "reflect-metadata";
import { config } from "dotenv";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.test" });

process.setMaxListeners?.(20);