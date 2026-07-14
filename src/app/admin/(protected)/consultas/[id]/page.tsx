import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { User, Mail } from "lucide-react";

import { ProductMiniCard } from "@/components/chat/product-mini-card";
import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationControls } from "@/components/admin/conversation-controls";
import { getConversationProductContext } from "@/actions/chat-actions";
import { requireAdminSession } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "Consulta",
  robots: { index: false, follow: false },
};

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdminSession();
  if (!session) notFound();

  const context = await getConversationProductContext(id);
  if (!context) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Consulta</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <User className="h-4 w-4 text-muted-foreground" />
            Cliente: {context.customer.name}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            Gmail del cliente: {context.customer.email}
          </span>
        </div>
      </div>

      <ProductMiniCard {...context.product} />

      <ConversationControls conversationId={id} status={context.status} />

      <ChatThread conversationId={id} />
    </div>
  );
}
