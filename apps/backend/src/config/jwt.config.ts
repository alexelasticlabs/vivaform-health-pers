﻿import { registerAs } from "@nestjs/config";

export const jwtConfig = registerAs("jwt", () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!secret || !refreshSecret) {
    const nodeEnv = process.env.NODE_ENV || 'development';
    throw new Error(`JWT secrets are missing for NODE_ENV=${nodeEnv}. Set JWT_SECRET and JWT_REFRESH_SECRET.`);
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