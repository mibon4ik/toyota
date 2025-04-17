import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const path = request.nextUrl.pathname;

  if (path === '/auth/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isLoggedIn && (path === '/cart' || path === '/checkout')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart', '/checkout', '/auth/login'],
};
