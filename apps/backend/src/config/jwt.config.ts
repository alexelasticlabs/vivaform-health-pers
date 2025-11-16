﻿import { registerAs } from "@nestjs/config";

const MIN_SECRET_LENGTH = 32;

function requireSecret(envKey: "JWT_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[envKey];
  if (!value) {
    const nodeEnv = process.env.NODE_ENV || "development";
    throw new Error(`Missing ${envKey} in ${nodeEnv} environment`);
  }

  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(`${envKey} must be at least ${MIN_SECRET_LENGTH} characters`);
  }

  return value;
}

export const jwtConfig = registerAs("jwt", () => {
  const secret = requireSecret("JWT_SECRET");
  const refreshSecret = requireSecret("JWT_REFRESH_SECRET");

  return {
    secret,
    refreshSecret,
    accessTokenTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
    refreshTokenTtl: Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 30)
  };
});

// Тип настроек JWT, удобный для импорта как type-only
export type JwtConfig = ReturnType<typeof jwtConfig>;