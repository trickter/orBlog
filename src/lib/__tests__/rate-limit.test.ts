import {
  __unsafeClearRateLimitStore,
  __unsafeGetRateLimitStoreSize,
  __unsafeSetRateLimitEntry,
  checkRateLimit,
  resetRateLimit,
} from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    __unsafeClearRateLimitStore();
  });

  it('blocks after max attempts', () => {
    expect(checkRateLimit('k').allowed).toBe(true);
    expect(checkRateLimit('k').allowed).toBe(true);
    expect(checkRateLimit('k').allowed).toBe(true);
    expect(checkRateLimit('k').allowed).toBe(true);
    expect(checkRateLimit('k').allowed).toBe(true);
    expect(checkRateLimit('k').allowed).toBe(false);
  });

  it('resets key via resetRateLimit', () => {
    for (let i = 0; i < 6; i += 1) {
      checkRateLimit('k');
    }
    expect(checkRateLimit('k').allowed).toBe(false);
    resetRateLimit('k');
    expect(checkRateLimit('k').allowed).toBe(true);
  });

  it('periodically prunes expired keys', () => {
    const now = Date.now();
    __unsafeSetRateLimitEntry('expired-a', { count: 1, resetTime: now - 10 });
    __unsafeSetRateLimitEntry('expired-b', { count: 1, resetTime: now - 10 });
    __unsafeSetRateLimitEntry('active', { count: 1, resetTime: now + 60_000 });

    for (let i = 0; i < 100; i += 1) {
      checkRateLimit(`trigger-${i}`);
    }

    expect(__unsafeGetRateLimitStoreSize()).toBeGreaterThanOrEqual(1);
    expect(__unsafeGetRateLimitStoreSize()).not.toBe(103);
  });
});
