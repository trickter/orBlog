import { getClientRateLimitKey } from '@/lib/client-ip';

describe('getClientRateLimitKey', () => {
  it('prefers x-real-ip when present', () => {
    const headers = new Headers({
      'x-real-ip': '10.0.0.9',
      'x-forwarded-for': '1.1.1.1, 2.2.2.2',
    });

    expect(getClientRateLimitKey(headers)).toBe('10.0.0.9');
  });

  it('uses right-most forwarded value', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3',
    });

    expect(getClientRateLimitKey(headers)).toBe('3.3.3.3');
  });

  it('returns unknown when no headers exist', () => {
    const headers = new Headers();
    expect(getClientRateLimitKey(headers)).toBe('unknown');
  });
});
