import { Injectable, ForbiddenException } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

import { ensureCsrfCookie, CSRF_HEADER_NAME } from '../security/csrf-token.util';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF protection middleware для state-changing запросов.
 * Проверяет совпадение Origin/Referer с разрешёнными origins и валидирует custom CSRF header.
 */
@Injectable()
export class CsrfCheckMiddleware implements NestMiddleware {
  private readonly allowedOrigins: Set<string>;

  constructor() {
    const origins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    this.allowedOrigins = new Set(origins);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method.toUpperCase();

    // Webhooks валидируются отдельно, пропускаем
    if (req.path.startsWith('/webhooks/')) {
      return next();
    }

    // Убеждаемся, что у клиента есть CSRF-cookie (для любых запросов)
    const csrfToken = ensureCsrfCookie(req, res);

    if (!MUTATING_METHODS.has(method)) {
      return next();
    }

    this.assertOriginAllowed(req);

    const headerToken = this.readHeaderToken(req);
    if (!headerToken) {
      if (process.env.NODE_ENV !== 'production') {
        return next();
      }
      throw new ForbiddenException('Missing CSRF token header');
    }

    if (!csrfToken || headerToken !== csrfToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return next();
  }

  private readHeaderToken(req: Request): string | undefined {
    const header = req.headers[CSRF_HEADER_NAME] as string | undefined;
    return typeof header === 'string' ? header : undefined;
  }

  private assertOriginAllowed(req: Request) {
    const origin = req.headers.origin;
    if (origin) {
      if (this.allowedOrigins.has(origin)) {
        return;
      }
      throw new ForbiddenException('Origin not allowed');
    }

    const referer = req.headers.referer;
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (this.allowedOrigins.has(refererOrigin)) {
          return;
        }
      } catch {}
      throw new ForbiddenException('Referer not allowed');
    }

    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    throw new ForbiddenException('Missing Origin or Referer header');
  }
}

