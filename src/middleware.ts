import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/types/user';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // console.log(`Middleware: Processing request for path: ${path}`);

  const authTokenCookie = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;
  const userCookie = request.cookies.get('loggedInUser')?.value;

  const isLoggedIn = !!authTokenCookie && isLoggedInCookie === 'true';

  // console.log(`Middleware: isLoggedIn check - authToken: ${!!authTokenCookie}, isLoggedInCookie: ${isLoggedInCookie}, derived isLoggedIn: ${isLoggedIn}`);

  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    // console.log(`Middleware: Logged-in user accessing ${path}. Redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/admin')) {
    // console.log(`Middleware: Accessing admin route: ${path}`);
    if (!isLoggedIn) {
      // console.log(`Middleware: Unauthenticated user accessing /admin. Redirecting to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login?redirectedFrom=${path}', request.url));
    }

    let isAdmin = false;
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true; // Strict check for admin status
        // console.log(`Middleware: Parsed user cookie for admin check. User: ${user.username}, isAdmin: ${isAdmin}`);
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Malformed user cookie. Redirect to login, and let client-side clear inconsistent state.
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('error', 'session_error');
        return NextResponse.redirect(loginUrl);
      }
    } else {
       // authToken and isLoggedIn are true, but userCookie is missing. Inconsistent state.
       // console.log(`Middleware: Inconsistent auth state (isLoggedIn true, but loggedInUser cookie missing for /admin). Redirecting to /auth/login.`);
       const loginUrl = new URL('/auth/login', request.url);
       loginUrl.searchParams.set('error', 'missing_user_data');
       return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // console.log(`Middleware: Non-admin user attempting to access /admin. Redirecting to /`);
      // Redirect to home page if not an admin, possibly with a message
      const homeUrl = new URL('/', request.url);
      // homeUrl.searchParams.set('error', 'admin_only'); // Optional: to show a message on home
      return NextResponse.redirect(homeUrl);
    }

    // console.log(`Middleware: Admin user granted access to /admin.`);
  }

  // console.log(`Middleware: Allowing request for ${path} to proceed.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
