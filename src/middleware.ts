
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { StoredUser } from '@/types/user';

const PROTECTED_PATHS = ['/admin', '/dashboard'];
const AUTH_PAGE_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const sessionDataCookie = request.cookies.get('user-session')?.value;
  
  let activeUser: StoredUser | null = null;
  let isAuthenticatedFlag = false;

  if (sessionDataCookie) {
    try {
      activeUser = JSON.parse(sessionDataCookie);
      if (activeUser && activeUser.id) {
        isAuthenticatedFlag = true;
      } else {
        activeUser = null;
      }
    } catch (e) {
      console.error("Middleware: Error parsing session cookie:", e);
      const responseWithClearedCookies = NextResponse.next(); 
      responseWithClearedCookies.cookies.delete('user-session');
      responseWithClearedCookies.cookies.delete('isLoggedIn');
      responseWithClearedCookies.cookies.delete('loggedInUser');
      if (PROTECTED_PATHS.some(protectedRoute => currentPath.startsWith(protectedRoute))) {
          return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      return responseWithClearedCookies;
    }
  }

  if (isAuthenticatedFlag && AUTH_PAGE_PATHS.includes(currentPath)) {
    return NextResponse.redirect(new URL(activeUser?.role === 'admin' ? '/admin' : '/dashboard', request.url));
  }

  if (currentPath.startsWith('/admin')) {
    if (!isAuthenticatedFlag) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (activeUser?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
  }

  if (PROTECTED_PATHS.some(protectedRoute => currentPath.startsWith(protectedRoute) && protectedRoute !== '/admin')) {
     if (!isAuthenticatedFlag) {
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
