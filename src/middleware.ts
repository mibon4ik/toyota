import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`Middleware: Processing request for path: ${path}`);

  // Check for the existence of the authToken cookie directly from the request
  const authTokenCookie = request.cookies.get('authToken')?.value;
  const isLoggedInCookie = request.cookies.get('isLoggedIn')?.value; // Check isLoggedIn cookie
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

    // If logged in (cookie verified), check admin status from the 'loggedInUser' cookie
    const userCookie = request.cookies.get('loggedInUser')?.value;
    let isAdmin = false;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        isAdmin = user.isAdmin === true; // Explicitly check for true
        console.log(`Middleware: Parsed user cookie for admin check. isAdmin: ${isAdmin}`, user);
      } catch (e) {
        console.error("Middleware: Error parsing user cookie for admin check:", e);
        // Consider invalid cookie as not admin, redirect to login to force re-auth
        console.log(`Middleware: Invalid user cookie found while checking admin. Redirecting to /auth/login and clearing cookies.`);
        // Prepare response to clear cookies
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
         response.cookies.delete('authToken', { path: '/' });
         response.cookies.delete('isLoggedIn', { path: '/' });
         response.cookies.delete('loggedInUser', { path: '/' });
        return response;
      }
    } else {
         // If loggedIn cookie is set but user cookie is missing, it's an inconsistent state
         console.log(`Middleware: Inconsistent auth state (loggedIn but no user data). Redirecting to /auth/login and clearing cookies.`);
         const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('authToken', { path: '/' });
          response.cookies.delete('isLoggedIn', { path: '/' });
          response.cookies.delete('loggedInUser', { path: '/' });
         return response;
    }

    if (!isAdmin) {
      console.log(`Middleware: Non-admin user accessing /admin. Redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins away
    }

    console.log(`Middleware: Admin user granted access to /admin.`);
  }

  // --- Cart and Checkout Route (Protected) ---
  // Require login for cart and checkout
   if (path.startsWith('/cart') || path.startsWith('/checkout')) {
        console.log(`Middleware: Accessing protected route: ${path}`);
        if (!isLoggedIn) {
          console.log(`Middleware: Unauthenticated user accessing ${path}. Redirecting to /auth/login`);
          return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(path), request.url)); // Redirect to login, preserving intended destination
        }
         console.log(`Middleware: Authenticated user allowed access to ${path}.`);
    }


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
