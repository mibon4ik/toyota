import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const path = request.nextUrl.pathname;

  if (path === '/auth/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
    if (path === '/auth/register' && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }
  if ((path === '/cart' || path === '/checkout') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico
     */
    '/((?!_next|static|favicon\\.ico).*)',
  ],
};

