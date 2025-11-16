import { Injectable, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Reflector } from '@nestjs/core';

// Ключ метаданных для пометки премиум-эндпоинтов
export const PREMIUM_ONLY_KEY = 'premium_only';

@Injectable()
export class StripeSubscriptionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPremiumRequired = this.reflector.get<boolean>(PREMIUM_ONLY_KEY, context.getHandler());
    if (!isPremiumRequired) return true;

    const req = context.switchToHttp().getRequest<any>();
    const user = req?.user;
    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.tier !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
