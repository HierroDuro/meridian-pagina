"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ConversationStatus } from "@prisma/client";
import { Lock, LockOpen } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateConversationStatus } from "@/actions/chat-actions";
import { CONVERSATION_STATUS_LABELS } from "@/types/chat";

const OPEN_STATUSES: ConversationStatus[] = ["NEW", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED"];

interface ConversationControlsProps {
  conversationId: string;
  status: ConversationStatus;
}

export function ConversationControls({ conversationId, status }: ConversationControlsProps) {
  const router = useRouter();

  const handleStatusChange = async (value: string) => {
    const result = await updateConversationStatus(conversationId, value as ConversationStatus);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    router.refresh();
  };

  const handleToggleClosed = async () => {
    const nextStatus: ConversationStatus = status === "CLOSED" ? "IN_PROGRESS" : "CLOSED";
    const result = await updateConversationStatus(conversationId, nextStatus);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(nextStatus === "CLOSED" ? "Conversación cerrada." : "Conversación reabierta.");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={status === "CLOSED"}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPEN_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {CONVERSATION_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleToggleClosed}>
        {status === "CLOSED" ? (
          <>
            <LockOpen className="h-4 w-4" />
            Reabrir
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Cerrar
          </>
        )}
      </Button>
    </div>
  );
}
