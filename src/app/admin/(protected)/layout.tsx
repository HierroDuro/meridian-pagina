import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Shell for every authenticated /admin page. `middleware.ts` already
 * redirects unauthenticated requests before this ever renders, but we
 * check the session again here (defense in depth) and it also gives us
 * the admin's username for the nav.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminNav username={session.user.name ?? "admin"} />
      <main className="flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}
