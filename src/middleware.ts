
export {};
// import NextAuth from "next-auth";

// import authConfig from "@/auth.config";

// export const { auth } = NextAuth(authConfig)

// export const config = {
//   matcher: [
//     "/cart",
//     "/checkout"
//   ],
// };

// export async function middleware(request) {
//   // Get the path
//   const path = request.nextUrl.pathname
//   const isLoggedIn = !!(await auth())

//   // Get the public routes
//   const isPublicPath = path === "/auth/login"

//   // If a user is logged in and is trying to access
//   // any of the public routes, redirect to the homepage.
//   if (isLoggedIn && isPublicPath) {
//     return Response.redirect(new URL("/", request.nextUrl))
//   }

//   // If a user is not logged in and is trying to access
//   // a protected route, redirect them to the login page.
//   if (!isLoggedIn && !isPublicPath) {
//     return Response.redirect(new URL("/auth/login", request.nextUrl))
//   }
//   // Do nothing to any other route
//   return null
// }
    