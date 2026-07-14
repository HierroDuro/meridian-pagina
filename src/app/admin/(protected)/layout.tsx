import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Shell for every authenticated /admin page. `middleware.ts` already
 * redirects unauthenticated (or customer-session) requests before this ever
 * renders, but we re-verify with `requireAdminSession` here too (defense in
 * depth) — it also gives us the admin's username for the nav.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20 md:flex-row">
      <AdminNav username={session.user.name ?? "admin"} />
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}
