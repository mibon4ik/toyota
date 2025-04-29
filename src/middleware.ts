import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@/types/user'; // Import User type for parsing

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`Middleware: Processing request for path: ${path}`);

  // --- Get Cookies ---
  const authTokenCookie = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value;
  const userCookie = request.cookies.get('loggedInUser')?.value;

  const isLoggedIn = !!authTokenCookie && isLoggedInCookie === 'true'; // User is logged in if authToken exists AND isLoggedIn cookie is 'true'

  console.log(`Middleware: isLoggedIn check - authToken: ${!!authTokenCookie}, isLoggedInCookie: ${isLoggedInCookie}, derived isLoggedIn: ${isLoggedIn}`);

  // --- Login/Register redirection for logged-in users ---
  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    console.log(`Middleware: Logged-in user accessing ${path}. Redirecting to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- Admin Route Protection ---
  if (path.startsWith('/admin')) {
    console.log(`Middleware: Accessing admin route: ${path}`);
    if (!isLoggedIn) {
      console.log(`Middleware: Unauthenticated user accessing /admin. Redirecting to /auth/login`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If logged in, check admin status from the 'loggedInUser' cookie
    let isAdmin = false;
    if (userCookie) {
      try {
        const user: User = JSON.parse(userCookie); // Use User type for better validation
        // Explicitly check if the 'isAdmin' property is exactly true
        isAdmin = user.isAdmin === true;
        console.log(`Middleware: Parsed user cookie for admin check. User: ${user.username}, isAdmin: ${isAdmin}`);
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Invalid cookie -> not admin, force re-login by redirecting and clearing cookies
        console.log(`Middleware: Invalid user cookie found while checking admin. Redirecting to /auth/login and clearing cookies.`);
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
         response.cookies.delete('authToken', { path: '/' });
         response.cookies.delete('isLoggedIn', { path: '/' });
         response.cookies.delete('loggedInUser', { path: '/' });
        return response;
      }
    } else {
         // If isLoggedIn cookie exists but userCookie is missing -> inconsistent state
         console.log(`Middleware: Inconsistent auth state (loggedIn but no user data). Redirecting to /auth/login and clearing cookies.`);
         const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('authToken', { path: '/' });
          response.cookies.delete('isLoggedIn', { path: '/' });
          response.cookies.delete('loggedInUser', { path: '/' });
         return response;
    }

    if (!isAdmin) {
      console.log(`Middleware: Non-admin user accessing /admin. Redirecting to /`);
      // Redirect non-admins away from admin section, maybe to home or a specific 'access denied' page
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }

  // --- Cart and Checkout Route (No longer strictly protected by middleware) ---
  // Authentication check for these routes can be handled client-side or on the page itself
  // if (path.startsWith('/cart') || path.startsWith('/checkout')) {
  //   // Logic removed as per requirement for cart to work without login
  // }

  // Allow the request to proceed if none of the above conditions were met
  console.log(`Middleware: Allowing request for ${path} to proceed.`);
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
     * - images/ (public image files) - Added exclusion for public images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
