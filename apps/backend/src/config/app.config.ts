import { registerAs } from "@nestjs/config";

const parseOrigins = (value?: string) =>
  value?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? ["http://localhost:5173"];

export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  enableSwagger: process.env.ENABLE_SWAGGER !== "false"
}));