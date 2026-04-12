import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isAdminSessionAuthorized } from '@/lib/auth';

const LOGIN_PATH = '/admin/login';
const LOGIN_API_PATH = '/admin/api/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === LOGIN_PATH ||
    pathname === LOGIN_API_PATH ||
    pathname.startsWith(`${LOGIN_API_PATH}/`)
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/admin') &&
    !isAdminSessionAuthorized(request.cookies.get('admin_session')?.value)
  ) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
