import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

import authConfig from "@/auth.config";

export const middleware = withAuth(
  // `withAuth` augments your `Request` with the user's token.
  {
    callbacks: {
      authorized({ token, request }) {
        const path = request.nextUrl.pathname;

        const isPublicPath = path === "/auth/login";

        if (token && isPublicPath) {
          return Response.redirect(new URL("/", request.nextUrl));
        }

        if (!token && (path === "/cart" || path === "/checkout")) {
          return false; // Redirect to login is handled in the unauthorized callback
        }

        return true; // Allow access
      },
      unauthorized({ request }) {
        const url = new URL("/auth/login", request.url);
        return NextResponse.redirect(url);
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  },
  // Only run the middleware on specified paths
  ["/cart", "/checkout"]
);

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/cart", "/checkout"],
};
