import { randomBytes } from "crypto";
import type { Request, Response } from "express";

export const CSRF_COOKIE_NAME = "csrfToken";
export const CSRF_HEADER_NAME = "x-csrf-token";
const MIN_TOKEN_LENGTH = 32;

const sharedCookieOptions = () => ({
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 // 1 day validity
});

export function readCsrfTokenFromRequest(req: Request): string | undefined {
  const candidate = req.cookies?.[CSRF_COOKIE_NAME];
  if (typeof candidate === "string" && candidate.length >= MIN_TOKEN_LENGTH) {
    return candidate;
  }
  return undefined;
}

export function issueCsrfCookie(res: Response, existingToken?: string): string {
  const token = existingToken?.length ? existingToken : randomBytes(MIN_TOKEN_LENGTH).toString("hex");
  res.cookie(CSRF_COOKIE_NAME, token, sharedCookieOptions());
  return token;
}

export function ensureCsrfCookie(req: Request, res: Response): string {
  const current = readCsrfTokenFromRequest(req);
  if (current) {
    // Refresh cookie to extend lifetime even if token already exists
    res.cookie(CSRF_COOKIE_NAME, current, sharedCookieOptions());
    return current;
  }
  return issueCsrfCookie(res);
}
