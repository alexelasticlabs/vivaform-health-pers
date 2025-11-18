import { registerAs } from "@nestjs/config";

const parseOrigins = (value?: string) => {
  const fromEnv = value?.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (fromEnv && fromEnv.length) return fromEnv;
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  // In dev, default to localhost; in prod, require explicit CORS_ORIGINS
  return isProd ? [] : ["http://localhost:5173", "http://localhost:5174"];
};

export const appConfig = registerAs("app", () => ({
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  enableSwagger: process.env.ENABLE_SWAGGER !== "false"
}));