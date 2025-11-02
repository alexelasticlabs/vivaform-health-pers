import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { verify as argonVerify } from "argon2";

import { jwtConfig } from "../../config";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

vi.mock("argon2", () => ({
  verify: vi.fn()
}));

const mockJwtSettings: ReturnType<typeof jwtConfig> = {
  secret: "test-secret",
  refreshSecret: "test-refresh-secret",
  accessTokenTtl: 900,
  refreshTokenTtl: 2592000
};

const createJwtService = () => ({
  signAsync: vi.fn<[], Promise<string>>(() => Promise.resolve("token")),
  verifyAsync: vi.fn<[], Promise<unknown>>()
});

const createUsersService = () => ({
  findByEmail: vi.fn(),
  findById: vi.fn()
});

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: ReturnType<typeof createUsersService>;
  let jwtService: ReturnType<typeof createJwtService>;

  beforeEach(() => {
    usersService = createUsersService();
    jwtService = createJwtService();
    authService = new AuthService(usersService as unknown as UsersService, jwtService as unknown as JwtService, mockJwtSettings);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("успешно авторизует пользователя", async () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hash",
      name: "Test",
      tier: "FREE"
    };

    usersService.findByEmail.mockResolvedValue(user);
    (argonVerify as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await authService.login({ email: "test@example.com", password: "password" });

    expect(result.user).toEqual({ id: user.id, email: user.email, name: user.name, tier: "FREE" });
    expect(result.tokens).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });
    expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("бросает UnauthorizedException при неверных данных", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(authService.login({ email: "nope", password: "secret" })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("обновляет access token по refresh", async () => {
    const payload = { sub: "user-1", email: "test@example.com", type: "refresh" };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const user = {
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      tier: "FREE"
    };
    usersService.findById.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValueOnce("new-access").mockResolvedValueOnce("new-refresh");

    const result = await authService.refresh({ refreshToken: "old" });

    expect(result.tokens.accessToken).toBe("new-access");
    expect(result.tokens.refreshToken).toBe("new-refresh");
    expect(result.user).toEqual(user);
  });

  it("очищает сессию при некорректном refresh token", async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error("invalid"));

    await expect(authService.refresh({ refreshToken: "broken" })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});