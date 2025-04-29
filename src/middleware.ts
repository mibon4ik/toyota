import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the existence of the authToken cookie directly from the request
  const authToken = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value; // Check isLoggedIn cookie
  const isLoggedIn = !!authToken && isLoggedInCookie === 'true'; // User is logged in if authToken exists AND isLoggedIn cookie is 'true'

  const path = request.nextUrl.pathname;

  // --- Login/Register redirection for logged-in users ---
  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    console.log(`Middleware: Logged-in user accessing ${path}. Redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Admin Route Protection ---
  if (path.startsWith('/admin')) {
    if (!isLoggedIn) {
      console.log(`Middleware: Unauthenticated user accessing /admin. Redirecting to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If logged in (cookie verified), check admin status from the 'loggedInUser' cookie
    const userCookie = request.cookies.get('loggedInUser')?.value;
    let isAdmin = false;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true; // Explicitly check for true
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Consider invalid cookie as not admin, redirect to login to force re-auth
        console.log(`Middleware: Invalid user cookie found while checking admin. Redirecting to /auth/login`);
        // Prepare response to clear cookies
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
         response.cookies.delete('authToken');
         response.cookies.delete('isLoggedIn');
         response.cookies.delete('loggedInUser');
        return response;
      }
    } else {
         // If loggedIn cookie is set but user cookie is missing, it's an inconsistent state
         console.log(`Middleware: Inconsistent auth state (loggedIn but no user data). Redirecting to /auth/login`);
         const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('authToken');
          response.cookies.delete('isLoggedIn');
          response.cookies.delete('loggedInUser');
         return response;
    }

    if (!isAdmin) {
      console.log(`Middleware: Non-admin user accessing /admin. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins away
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }

  // --- Cart Route (Public) ---
  // No specific protection needed for /cart as per requirements

  // Allow the request to proceed if none of the above conditions were met
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /images/ (public image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
