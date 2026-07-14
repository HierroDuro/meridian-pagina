import type { MessageSenderType, ConversationStatus } from "@prisma/client";

export interface ChatMessage {
  id: string;
  senderType: MessageSenderType;
  senderName: string;
  body: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface ConversationThread {
  status: ConversationStatus;
  viewerType: MessageSenderType;
  otherPartyTyping: boolean;
  messages: ChatMessage[];
}

export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  NEW: "Nueva",
  IN_PROGRESS: "En proceso",
  WAITING_CUSTOMER: "Esperando respuesta del cliente",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
};

export const CONVERSATION_STATUS_BADGE_VARIANT: Record<
  ConversationStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  NEW: "default",
  IN_PROGRESS: "secondary",
  WAITING_CUSTOMER: "outline",
  RESOLVED: "success",
  CLOSED: "destructive",
};
