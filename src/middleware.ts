import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from 'cookies-next'; // Use getCookie

export function middleware(request: NextRequest) {
  // Check for the existence of the authToken cookie directly from the request
  const authToken = request.cookies.get('authToken')?.value;
  const isLoggedIn = !!authToken; // User is logged in if authToken exists

  const path = request.nextUrl.pathname;

  // If user is logged in and tries to access login/register, redirect to home
  if (isLoggedIn && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  const protectedRoutes = ['/cart', '/checkout', '/admin'];
  if (!isLoggedIn && protectedRoutes.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

    // If user is not admin and tries to access admin page, redirect to home
    if (isLoggedIn && path.startsWith('/admin')) {
        const userCookie = request.cookies.get('loggedInUser')?.value;
        let isAdmin = false;
        if (userCookie) {
            try {
                const user = JSON.parse(userCookie);
                isAdmin = user.isAdmin === true;
            } catch (e) {
                console.error("Error parsing user cookie in middleware:", e);
                // Redirect to login if cookie is invalid
                 return NextResponse.redirect(new URL('/auth/login', request.url));
            }
        }
         if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }


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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
