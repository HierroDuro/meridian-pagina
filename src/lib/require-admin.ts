import "server-only";

import { auth } from "@/lib/auth";

/**
 * Defense-in-depth helper: even though `middleware.ts` already blocks
 * unauthenticated requests to /admin and /api/admin/*, mutating endpoints
 * that also serve public GET requests (e.g. /api/products/[id] for PATCH
 * vs GET) re-verify the session here directly. Never trust routing alone
 * to gate a write operation.
 *
 * Checks `userType === "admin"` explicitly, not just that a session
 * exists — this NextAuth instance also issues "customer" sessions (see
 * auth.config.ts), and those must never pass an admin check.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return null;
  }
  return session;
}
