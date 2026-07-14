import Link from "next/link";
import Image from "next/image";
import type { ConversationStatus } from "@prisma/client";
import { User, Mail } from "lucide-react";

import { ConversationStatusBadge } from "@/components/chat/conversation-status-badge";
import { truncate } from "@/lib/utils";

interface ConversationRowProps {
  href: string;
  productName: string;
  productImageUrl: string;
  status: ConversationStatus;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  /** Shown in the admin list only — who this conversation is with. */
  customer?: { name: string; email: string };
}

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Hace ${diffD} d`;
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(date);
}

export function ConversationRow({
  href,
  productName,
  productImageUrl,
  status,
  lastMessage,
  lastMessageAt,
  unreadCount,
  customer,
}: ConversationRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted/40">
        <Image src={productImageUrl} alt={productName} fill className="object-contain p-1.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{productName}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeDate(lastMessageAt)}
          </span>
        </div>
        {customer && (
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-foreground/80">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{customer.name}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </span>
          </div>
        )}
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {lastMessage ? truncate(lastMessage, 70) : "Sin mensajes todavía"}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <ConversationStatusBadge status={status} />
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
