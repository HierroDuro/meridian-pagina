import "server-only";

import { auth } from "@/lib/auth";

/**
 * Defense-in-depth helper: even though `middleware.ts` already blocks
 * unauthenticated requests to /admin and /api/admin/*, mutating endpoints
 * that also serve public GET requests (e.g. /api/products/[id] for PATCH
 * vs GET) re-verify the session here directly. Never trust routing alone
 * to gate a write operation.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}
