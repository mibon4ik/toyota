import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add your middleware logic here
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico
     */
    '/((?!_next|static|favicon\\.ico).*)',
  ],
};

