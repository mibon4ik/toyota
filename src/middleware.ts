import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/types/user';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`Middleware: Processing request for path: ${path}`);


  const authTokenCookie = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;
  const userCookie = request.cookies.get('loggedInUser')?.value;

  // Check ONLY cookies for login status in middleware
  const isLoggedIn = !!authTokenCookie && isLoggedInCookie === 'true';

  console.log(`Middleware: isLoggedIn check (cookies only) - authToken: ${!!authTokenCookie}, isLoggedInCookie: ${isLoggedInCookie}, derived isLoggedIn: ${isLoggedIn}`);


  // --- Redirect logged-in users from auth pages ---
  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    console.log(`Middleware: Logged-in user accessing ${path}. Redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }


  // --- Admin route protection ---
  if (path.startsWith('/admin')) {
    console.log(`Middleware: Accessing admin route: ${path}`);
    if (!isLoggedIn) {
      console.log(`Middleware: Unauthenticated user accessing /admin. Redirecting to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verify admin status from user cookie
    let isAdmin = false;
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true;
        console.log(`Middleware: Parsed user cookie for admin check. User: ${user.username}, isAdmin: ${isAdmin}`);
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Clear potentially corrupted cookies and redirect to login
        console.log(`Middleware: Invalid user cookie found while checking admin. Redirecting to /auth/login and clearing cookies.`);
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
         response.cookies.delete('authToken', { path: '/' });
         response.cookies.delete('isLoggedIn', { path: '/' });
         response.cookies.delete('loggedInUser', { path: '/' });
        return response;
      }
    } else {
       // If loggedIn cookie is true but no user data, clear cookies and redirect
       console.log(`Middleware: Inconsistent auth state (loggedIn but no user data). Redirecting to /auth/login and clearing cookies.`);
       const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('authToken', { path: '/' });
        response.cookies.delete('isLoggedIn', { path: '/' });
        response.cookies.delete('loggedInUser', { path: '/' });
       return response;
    }

    // Redirect non-admins trying to access /admin
    if (!isAdmin) {
      console.log(`Middleware: Non-admin user accessing /admin. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }


  // --- Allow request to proceed ---
  console.log(`Middleware: Allowing request for ${path} to proceed.`);
  return NextResponse.next();
}

// Define paths where middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (image files in public/images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};