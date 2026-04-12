/** @jest-environment node */

import { NextRequest } from 'next/server';
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from 'next/experimental/testing/server';
import { createSessionToken } from '@/lib/auth';
import { config, proxy } from '../../../proxy';

describe('admin proxy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ADMIN_SECRET: 'test-secret-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('matches protected admin routes', () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: 'https://example.com/admin',
      })
    ).toBe(true);

    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: 'https://example.com/admin/edit/post-123',
      })
    ).toBe(true);
  });

  it('does not match non-admin routes', () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: 'https://example.com/',
      })
    ).toBe(false);
  });

  it('redirects unauthorized admin requests to login', () => {
    const response = proxy(new NextRequest('https://example.com/admin'));

    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe('https://example.com/admin/login');
  });

  it('allows the login page and login API without a session', () => {
    const loginPageResponse = proxy(
      new NextRequest('https://example.com/admin/login')
    );
    const loginApiResponse = proxy(
      new NextRequest('https://example.com/admin/api/login', {
        method: 'POST',
      })
    );

    expect(loginPageResponse.status).toBe(200);
    expect(loginApiResponse.status).toBe(200);
    expect(getRedirectUrl(loginPageResponse)).toBeNull();
    expect(getRedirectUrl(loginApiResponse)).toBeNull();
  });

  it('allows authorized admin requests', () => {
    const token = createSessionToken();
    const request = new NextRequest('https://example.com/admin', {
      headers: {
        cookie: `admin_session=${token}`,
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(getRedirectUrl(response)).toBeNull();
  });
});
