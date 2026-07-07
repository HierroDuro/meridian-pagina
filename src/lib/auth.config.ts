import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config: pages, cookies and JWT/session callbacks only.
 *
 * This file MUST NOT import Prisma or bcryptjs (or anything else that
 * depends on Node.js APIs) — `middleware.ts` builds a NextAuth instance
 * from *only* this config, and Next.js Middleware runs in the Edge
 * Runtime, which can't execute Prisma Client or native bcrypt bindings.
 * The Credentials provider (which needs both) lives in `auth.ts` instead,
 * which is only ever imported from Route Handlers / Server Components
 * that run on the regular Node.js runtime.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour sessions
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-admin-session-token"
          : "admin-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
