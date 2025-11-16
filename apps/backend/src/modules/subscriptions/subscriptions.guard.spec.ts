import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { StripeSubscriptionGuard } from '../../common/middleware/stripe-subscription.guard';
import type { Reflector } from '@nestjs/core';

describe('StripeSubscriptionGuard', () => {
  let guard: StripeSubscriptionGuard;
  let reflector: { get: (metaKey: string, target: any) => any };

  beforeEach(async () => {
    reflector = { get: vi.fn() as any } as any;
    guard = new StripeSubscriptionGuard(reflector as unknown as Reflector);
  });

  const makeContext = (user: any) => ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({})
  }) as unknown as ExecutionContext;

  it('пропускает маршрут если не отмечен как премиум', async () => {
    (reflector.get as any).mockReturnValue(false);
    const can = await guard.canActivate(makeContext({ userId: 'u1', tier: 'FREE' }));
    expect(can).toBe(true);
  });

  it('блокирует если нет пользователя', async () => {
    (reflector.get as any).mockReturnValue(true);
    await expect(guard.canActivate(makeContext(null))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('блокирует если пользователь не премиум', async () => {
    (reflector.get as any).mockReturnValue(true);
    await expect(guard.canActivate(makeContext({ userId: 'u1', tier: 'FREE' }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('пропускает если пользователь премиум', async () => {
    (reflector.get as any).mockReturnValue(true);
    const can = await guard.canActivate(makeContext({ userId: 'u1', tier: 'PREMIUM' }));
    expect(can).toBe(true);
  });
});
