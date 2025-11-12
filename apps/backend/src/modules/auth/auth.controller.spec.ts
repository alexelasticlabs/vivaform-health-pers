import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';

class AuthServiceMock {
  testEmail = vi.fn();
}

describe('AuthController test-email route protection', () => {
  let controller: AuthController;
  let service: AuthServiceMock;

  beforeEach(() => {
    service = new AuthServiceMock();
    controller = new AuthController(service as any);
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_TEST_EMAIL;
  });

  it('testEmail throws Forbidden outside development', () => {
    expect(() => controller.testEmail({ email: 'x@y.com' })).toThrow(/Route disabled/);
    expect(service.testEmail).not.toHaveBeenCalled();
  });

  it('testEmail works in development', () => {
    process.env.NODE_ENV = 'development';
    controller.testEmail({ email: 'x@y.com' });
    expect(service.testEmail).toHaveBeenCalledWith('x@y.com');
  });

  it('testEmail can be enabled in production via ALLOW_TEST_EMAIL', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_TEST_EMAIL = 'true';
    controller.testEmail({ email: 'x@y.com' });
    expect(service.testEmail).toHaveBeenCalledWith('x@y.com');
  });
});
