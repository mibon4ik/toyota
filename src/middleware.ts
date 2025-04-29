import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from 'cookies-next'; // Use getCookie if needed elsewhere, but request.cookies is preferred here

export function middleware(request: NextRequest) {
  // Check for the existence of the authToken cookie directly from the request
  const authToken = request.cookies.get('authToken')?.value;
  const isLoggedIn = !!authToken; // User is logged in if authToken exists

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

    // If logged in, check admin status from the 'loggedInUser' cookie
    const userCookie = request.cookies.get('loggedInUser')?.value;
    let isAdmin = false;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true; // Explicitly check for true
      } catch (e) {
        console.error("Middleware: Error parsing user cookie:", e);
        // Consider invalid cookie as not admin, redirect to login to force re-auth
        console.log(`Middleware: Invalid user cookie found. Redirecting to /auth/login`);
        // Optionally clear the bad cookie here if possible, though middleware doesn't easily modify response cookies.
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
         // Example of attempting to clear cookies (might not work reliably in all edge cases)
         response.cookies.delete('authToken');
         response.cookies.delete('isLoggedIn');
         response.cookies.delete('loggedInUser');
        return response;
      }
    }

    if (!isAdmin) {
      console.log(`Middleware: Non-admin user accessing /admin. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins away
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }

  // --- Other Protected Routes (Example: Cart/Checkout IF they required login) ---
  // As per request, cart/checkout are now public, so this block might be removed or adjusted.
  // const otherProtectedRoutes = ['/cart', '/checkout']; // Example
  // if (!isLoggedIn && otherProtectedRoutes.some(p => path.startsWith(p))) {
  //   console.log(`Middleware: Unauthenticated user accessing ${path}. Redirecting to /auth/login`);
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

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
     * - /images/ (public image files) - Added this to prevent middleware on images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};