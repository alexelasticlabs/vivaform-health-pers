import { registerAs } from "@nestjs/config";

export const jwtConfig = registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET ?? "super-secret",
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? "super-refresh-secret",
  accessTokenTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
  refreshTokenTtl: Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 30)
}));