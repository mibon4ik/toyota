import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { StoredUser } from '@/types/user';

const PROTECTED_PATHS_USER = ['/dashboard', '/checkout', '/cart']; // Cart and checkout might need auth
const PROTECTED_PATHS_ADMIN = ['/admin'];
const AUTH_PAGE_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('user-session');
  let currentUser: StoredUser | null = null;

  if (sessionCookie && sessionCookie.value) {
    try {
      currentUser = JSON.parse(sessionCookie.value);
      if (!currentUser || !currentUser.id) { // Basic validation
        currentUser = null;
      }
    } catch (e) {
      console.error("Middleware: Error parsing user-session cookie", e);
      currentUser = null;
      // If cookie is malformed, consider it as logged out and clear potentially bad client cookies
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('isLoggedIn');
      response.cookies.delete('loggedInUser');
      return response;
    }
  }

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.isAdmin === true;

  // If logged in, redirect from auth pages
  if (isLoggedIn && AUTH_PAGE_PATHS.includes(currentPath)) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
  }

  // Protect admin routes
  if (PROTECTED_PATHS_ADMIN.some(path => currentPath.startsWith(path))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (!isAdmin) {
      // Non-admin trying to access admin page, redirect to their dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect user routes
  if (PROTECTED_PATHS_USER.some(path => currentPath.startsWith(path))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};