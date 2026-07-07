import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

/**
 * Guards every /admin route (except the login page itself).
 *
 * This is the single enforcement point for "no access to the panel without
 * authentication": even if someone guesses the exact URL of an admin page,
 * the middleware runs before any Server Component or Route Handler and
 * redirects unauthenticated requests straight to the login screen.
 *
 * Deliberately built from `authConfig` (no providers) rather than importing
 * `auth` from `@/lib/auth`: Next.js Middleware runs on the Edge Runtime,
 * which can't execute Prisma Client or bcrypt's native bindings — both of
 * which the Credentials provider in `auth.ts` depends on. This lightweight
 * instance only decodes the JWT cookie, which is edge-safe.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/upload");

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(req.auth);

  if (isLoginPage) {
    // Already logged in? Skip the login screen.
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    if (isAdminApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on every /admin page and every protected API route, but skip
  // static assets so the middleware doesn't add latency to them.
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/upload/:path*"],
};
