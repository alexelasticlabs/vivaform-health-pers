import { Injectable, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Guard для проверки наличия активной Premium подписки
 * Использует tier из JWT токена для избежания N+1 запросов к БД
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Use tier from JWT payload (already included during token generation)
    // This avoids N+1 DB queries on every request
    if (user.tier !== 'PREMIUM') {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
