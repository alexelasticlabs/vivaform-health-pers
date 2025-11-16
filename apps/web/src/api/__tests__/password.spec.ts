import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as client from '@/api/client';
import { verifyEmail } from '@/api/password';

describe('password API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('verifyEmail encodes token in URL', async () => {
    const instance = (client as any).apiClient;
    const methodSpy = vi.spyOn(instance, 'get').mockResolvedValue({ data: { message: 'ok' } } as any);

    const token = 'abc+/=';
    await verifyEmail(token);

    expect(methodSpy).toHaveBeenCalledTimes(1);
    const calledUrl = methodSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/auth/verify-email?token=');
    expect(calledUrl).toContain(encodeURIComponent(token));
  });
});
