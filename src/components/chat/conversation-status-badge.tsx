import type { ConversationStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { CONVERSATION_STATUS_LABELS, CONVERSATION_STATUS_BADGE_VARIANT } from "@/types/chat";

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <Badge variant={CONVERSATION_STATUS_BADGE_VARIANT[status]}>
      {CONVERSATION_STATUS_LABELS[status]}
    </Badge>
  );
}
