﻿import { registerAs } from "@nestjs/config";

export const jwtConfig = registerAs("jwt", () => {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET ?? "super-secret";
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "super-refresh-secret";

  // Warn in production if using default secrets (env validator will catch this earlier)
  if (isProd && (secret === "super-secret" || refreshSecret === "super-refresh-secret")) {
    throw new Error('Default JWT secrets detected in production! Set JWT_SECRET and JWT_REFRESH_SECRET.');
  }

  return {
    secret,
    refreshSecret,
    accessTokenTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
    refreshTokenTtl: Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 30)
  };
});

// Тип настроек JWT, удобный для импорта как type-only
export type JwtConfig = ReturnType<typeof jwtConfig>;