import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config: pages, cookies and JWT/session callbacks only.
 *
 * This file MUST NOT import Prisma or bcryptjs (or anything else that
 * depends on Node.js APIs) — `middleware.ts` builds a NextAuth instance
 * from *only* this config, and Next.js Middleware runs in the Edge
 * Runtime, which can't execute Prisma Client or native bcrypt bindings.
 * The Credentials providers (which need both) live in `auth.ts` instead,
 * which is only ever imported from Route Handlers / Server Components
 * that run on the regular Node.js runtime.
 *
 * One NextAuth instance serves TWO kinds of sessions — admin/employee
 * (panel staff) and customer (catalog shoppers) — sharing the same JWT
 * cookie but tagged with `userType`. A browser can only be logged in as
 * one or the other at a time (logging in as one overwrites the other's
 * cookie), which is an acceptable trade-off for a B2B site where staff
 * and shoppers are different people. Every admin-only check MUST verify
 * `userType === "admin"`, not just that a session exists.
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
        token.userType = (user as { userType: "admin" | "customer" }).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
        session.user.userType = token.userType as "admin" | "customer";
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-session-token" : "session-token",
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
