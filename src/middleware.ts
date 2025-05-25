
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { StoredUser } from '@/types/user';

const PROTECTED_PATHS_USER = ['/dashboard', '/checkout']; 
const PROTECTED_PATHS_ADMIN = ['/admin'];
const AUTH_PAGE_PATHS = ['/auth/login', '/auth/register'];
const PUBLIC_PATHS = ['/', '/shop', '/cart', '/contacts', '/blog/brake-pads', '/blog/oil-changes']; // Added /part to public paths

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('user-session');
  let currentUser: StoredUser | null = null;

  if (sessionCookie && sessionCookie.value) {
    try {
      currentUser = JSON.parse(sessionCookie.value);
      if (!currentUser || !currentUser.id || typeof currentUser.isAdmin !== 'boolean') { 
        currentUser = null; 
        // If cookie is malformed, clear potentially bad client cookies
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('isLoggedIn');
        response.cookies.delete('loggedInUser');
        response.cookies.delete('user-session');
        return response;
      }
    } catch (e) {
      console.error("Middleware: Error parsing user-session cookie", e);
      currentUser = null;
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('isLoggedIn');
      response.cookies.delete('loggedInUser');
      response.cookies.delete('user-session');
      return response;
    }
  }

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.isAdmin === true;

  // If user is logged in and tries to access login/register, redirect to homepage
  if (isLoggedIn && AUTH_PAGE_PATHS.some(path => currentPath.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin routes
  if (PROTECTED_PATHS_ADMIN.some(path => currentPath.startsWith(path))) {
    if (!isLoggedIn || !isAdmin) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', currentPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect user-specific routes
  if (PROTECTED_PATHS_USER.some(path => currentPath.startsWith(path))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', currentPath);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Allow access to product detail pages for everyone
  if (currentPath.startsWith('/part/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
