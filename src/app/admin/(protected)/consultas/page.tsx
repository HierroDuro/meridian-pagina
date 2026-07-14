import type { Metadata } from "next";

import { AdminConversationsList } from "@/components/admin/admin-conversations-list";
import { getConversationFilterOptions } from "@/actions/chat-actions";

export const metadata: Metadata = {
  title: "Consultas",
  robots: { index: false, follow: false },
};

export default async function AdminConversationsPage() {
  const filterOptions = await getConversationFilterOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Consultas</h1>
        <p className="text-sm text-muted-foreground">
          Todas las conversaciones de clientes sobre productos.
        </p>
      </div>
      <AdminConversationsList filterOptions={filterOptions} />
    </div>
  );
}
