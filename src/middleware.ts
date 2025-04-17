import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const isLoggedIn = !!(await auth());

  const isPublicPath = path === "/auth/login";

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isLoggedIn && !isPublicPath && (path === "/cart" || path === "/checkout")) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/cart", "/checkout", "/auth/login"],
};
