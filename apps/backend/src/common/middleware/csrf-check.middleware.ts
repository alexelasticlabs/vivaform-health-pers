import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection middleware для state-changing запросов.
 * Проверяет совпадение Origin/Referer с разрешёнными origins из CORS.
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

    // Только для мутирующих запросов
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next();
    }

    // Пропускаем публичные endpoints (webhooks имеют свою проверку)
    if (req.path.startsWith('/webhooks/')) {
      return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Если есть Origin — проверяем его
    if (origin) {
      if (this.allowedOrigins.has(origin)) {
        return next();
      }
      throw new ForbiddenException('Origin not allowed');
    }

    // Если Origin нет, проверяем Referer
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (this.allowedOrigins.has(refererOrigin)) {
          return next();
        }
      } catch {}
      throw new ForbiddenException('Referer not allowed');
    }

    // В dev режиме пропускаем (для инструментов типа Postman)
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    throw new ForbiddenException('Missing Origin or Referer header');
  }
}

