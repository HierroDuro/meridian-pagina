"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MessageBubble } from "@/components/chat/message-bubble";
import { DaySeparator, isSameDay } from "@/components/chat/day-separator";
import { ChatComposer } from "@/components/chat/chat-composer";
import { getConversationMessages, markConversationRead } from "@/actions/chat-actions";
import type { ChatMessage } from "@/types/chat";

/** No WebSockets in this stack — polling is the pragmatic way to get a
 * "near-instant" feel without adding new infrastructure. 3s keeps the chat
 * feeling responsive without hammering the database. */
const POLL_INTERVAL_MS = 3000;

interface MessageGroup {
  date: Date;
  messages: ChatMessage[];
}

function groupByDay(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const message of messages) {
    const date = new Date(message.createdAt);
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.date, date)) {
      last.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
  }
  return groups;
}

export function ChatThread({
  conversationId,
  prefill,
}: {
  conversationId: string;
  prefill?: string;
}) {
  const queryClient = useQueryClient();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const queryKey = React.useMemo(() => ["conversation-messages", conversationId], [conversationId]);

  // Whether the user is actually looking at this tab right now — the
  // signal that separates the "delivered" (grey double-check) tick from
  // "read" (blue double-check): polling keeps running in the background
  // (see refetchIntervalInBackground below) so delivery still updates, but
  // messages are only marked *read* while this is true.
  const [isActive, setIsActive] = React.useState(
    () => typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus(),
  );

  React.useEffect(() => {
    const updateActive = () =>
      setIsActive(document.visibilityState === "visible" && document.hasFocus());
    document.addEventListener("visibilitychange", updateActive);
    window.addEventListener("focus", updateActive);
    window.addEventListener("blur", updateActive);
    return () => {
      document.removeEventListener("visibilitychange", updateActive);
      window.removeEventListener("focus", updateActive);
      window.removeEventListener("blur", updateActive);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getConversationMessages(conversationId),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const messageCount = data?.messages.length ?? 0;

  // Mark the other party's messages as read whenever we're actively
  // looking at this thread (mount + every poll tick, but only while the
  // tab is visible and focused).
  React.useEffect(() => {
    if (data && isActive) void markConversationRead(conversationId);
  }, [conversationId, data, isActive]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messageCount]);

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  if (isLoading || !data) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-background text-sm text-muted-foreground">
        Cargando conversación...
      </div>
    );
  }

  const groups = groupByDay(data.messages);
  const isClosed = data.status === "CLOSED";

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-border bg-background">
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto p-4">
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes. Escribí el primero.
          </p>
        )}
        {groups.map((group) => (
          <div key={group.date.toISOString()}>
            <DaySeparator date={group.date} />
            <div className="space-y-2">
              {group.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </div>
        ))}
        {data.otherPartyTyping && (
          <div className="flex justify-start pt-1">
            <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm italic text-muted-foreground shadow-soft">
              Escribiendo...
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <ChatComposer
          conversationId={conversationId}
          disabled={isClosed}
          defaultValue={prefill}
          onSent={refetch}
        />
      </div>
    </div>
  );
}
