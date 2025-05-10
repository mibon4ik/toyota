
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/types/user';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`Middleware: Processing request for path: ${path}`);

  const authTokenCookie = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;
  const userCookie = request.cookies.get('loggedInUser')?.value;

  const isLoggedIn = !!authTokenCookie && isLoggedInCookie === 'true';

  console.log(`Middleware: isLoggedIn check - authToken: ${!!authTokenCookie}, isLoggedInCookie: ${isLoggedInCookie}, derived isLoggedIn: ${isLoggedIn}`);

  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    console.log(`Middleware: Logged-in user accessing ${path}. Redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/admin')) {
    console.log(`Middleware: Accessing admin route: ${path}`);
    if (!isLoggedIn) {
      console.log(`Middleware: Unauthenticated user accessing /admin. Redirecting to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    let isAdmin = false;
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true;
        console.log(`Middleware: Parsed user cookie for admin check. User: ${user.username}, isAdmin: ${isAdmin}`);
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Malformed user cookie. Redirect to login.
        // Avoid deleting cookies here; let client-side (main-nav) handle sync based on potentially cleared cookie.
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } else {
       // authToken and isLoggedIn are true, but userCookie is missing. Inconsistent state.
       console.log(`Middleware: Inconsistent auth state (isLoggedIn true, but loggedInUser cookie missing for /admin). Redirecting to /auth/login.`);
       // Redirect to login. Client-side will eventually clear localStorage if cookies are truly gone.
       // Do not delete cookies from middleware in this specific case to avoid race conditions
       // with client-side state management.
       return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (!isAdmin) {
      console.log(`Middleware: Non-admin user attempting to access /admin. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }

  console.log(`Middleware: Allowing request for ${path} to proceed.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
