import { describe, it, expect } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { StripeSubscriptionGuard } from './stripe-subscription.guard';

function makeContext(user?: { userId?: string; tier?: string }) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user })
    }),
    getHandler: () => ({}),
    getClass: () => ({}) // test helper only
  } as any;
}

describe('StripeSubscriptionGuard', () => {
  it('allows when premium is not required', async () => {
    const reflector = { get: (_key: string) => false } as any;
    const guard = new StripeSubscriptionGuard(reflector);
    const result = await guard.canActivate(makeContext({ userId: 'u1', tier: 'FREE' }));
    expect(result).toBe(true);
  });

  it('throws when no user', async () => {
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(reflector);
    await expect(guard.canActivate(makeContext({}))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when user is not premium', async () => {
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(reflector);
    await expect(guard.canActivate(makeContext({ userId: 'u1', tier: 'FREE' }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows when user is premium', async () => {
    const reflector = { get: (_: string) => true } as any;
    const guard = new StripeSubscriptionGuard(reflector);
    await expect(guard.canActivate(makeContext({ userId: 'u1', tier: 'PREMIUM' }))).resolves.toBe(true);
  });
});
