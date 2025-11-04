import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PREMIUM_KEY = 'requiresPremium';

/**
 * Декоратор для пометки эндпоинтов, требующих Premium подписку
 * Используется в связке с PremiumGuard
 * 
 * @example
 * ```typescript
 * @RequiresPremium()
 * @Get('premium-feature')
 * async getPremiumFeature() {
 *   return this.service.getPremiumData();
 * }
 * ```
 */
export const RequiresPremium = () => SetMetadata(REQUIRES_PREMIUM_KEY, true);
