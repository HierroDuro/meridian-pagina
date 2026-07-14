"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCheck, FileText } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AudioPlayer } from "@/components/chat/audio-player";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const { isOwn, body, attachmentUrl, attachmentType, createdAt, deliveredAt, readAt } = message;
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-soft",
          isOwn
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-foreground",
        )}
      >
        {attachmentUrl && attachmentType === "image" && (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="mb-2 block cursor-zoom-in"
              aria-label="Ver imagen en tamaño completo"
            >
              <div className="relative h-40 w-56 overflow-hidden rounded-lg bg-black/10">
                <Image src={attachmentUrl} alt="Imagen adjunta" fill className="object-cover" />
              </div>
            </button>
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">Imagen adjunta</DialogTitle>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/80">
                  <Image
                    src={attachmentUrl}
                    alt="Imagen adjunta"
                    fill
                    className="object-contain"
                    sizes="768px"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        {attachmentUrl && attachmentType === "audio" && (
          <div className="mb-1">
            <AudioPlayer src={attachmentUrl} isOwn={isOwn} />
          </div>
        )}
        {attachmentUrl && attachmentType === "pdf" && (
          <Link
            href={attachmentUrl}
            target="_blank"
            className={cn(
              "mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              isOwn ? "border-primary-foreground/30" : "border-border",
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            Ver archivo PDF
          </Link>
        )}

        {body && <p className="whitespace-pre-line break-words text-sm">{body}</p>}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{formatTime(createdAt)}</span>
          {isOwn &&
            (readAt ? (
              // WhatsApp's exact read-tick blue — intentionally not a
              // theme token, this color is what makes it recognizable.
              <CheckCheck className="h-3.5 w-3.5" style={{ color: "#53bdeb" }} />
            ) : deliveredAt ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      </div>
    </div>
  );
}
