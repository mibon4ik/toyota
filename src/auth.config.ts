
import type { NextAuthConfig } from "next-auth"

import Credentials from "next-auth/providers/credentials"
import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { LoginSchema } from "@/schemas"
import { getUserByEmail } from "@/data/user"

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // Simplified authentication logic for admin/admin
          if (email === "admin@admin.com" && password === "admin") {
            return { id: "admin", name: "Admin", email: "admin@admin.com" };
          }

          return null;
        }

        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      console.log({ sessionToken: token });

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      return session;
    },
    async jwt({ token }) {
      return token;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  }
} satisfies NextAuthConfig
