import "server-only";

import { auth } from "@/lib/auth";

/**
 * Mirrors `require-admin.ts` for the customer side: verifies the session
 * is specifically a "customer" session (not an admin/employee one) before
 * a chat/consultation server action or route is allowed to touch data
 * scoped to that customer.
 */
export async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "customer") {
    return null;
  }
  return session;
}
