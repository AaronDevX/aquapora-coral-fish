import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  const isLoginRoute = pathname === '/admin/login';

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (!isLoginRoute && !session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
