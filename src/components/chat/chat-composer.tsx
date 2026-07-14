"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, Send, X, FileText, Mic, Square, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/chat/audio-player";
import { sendMessage, setTyping } from "@/actions/chat-actions";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { cn } from "@/lib/utils";

const TYPING_DEBOUNCE_MS = 2000;

interface PendingAttachment {
  url: string;
  type: "image" | "pdf" | "audio";
  name: string;
}

interface ChatComposerProps {
  conversationId: string;
  disabled?: boolean;
  defaultValue?: string;
  onSent?: () => void;
}

function formatTimer(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ChatComposer({ conversationId, disabled, defaultValue, onSent }: ChatComposerProps) {
  const [text, setText] = React.useState(defaultValue ?? "");
  const [attachment, setAttachment] = React.useState<PendingAttachment | null>(null);
  const [sending, setSending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const isTypingRef = React.useRef(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const recorder = useVoiceRecorder();

  const stopTyping = React.useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      void setTyping(conversationId, false);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [conversationId]);

  const handleTextChange = (value: string) => {
    setText(value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      void setTyping(conversationId, true);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
      void setTyping(conversationId, false);
    }, TYPING_DEBOUNCE_MS);
  };

  React.useEffect(() => stopTyping, [stopTyping]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "No se pudo subir el archivo");
      return null;
    }
    return data as { url: string; type: "image" | "pdf" | "audio" };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      if (uploaded) setAttachment({ ...uploaded, name: file.name });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    setSending(true);
    stopTyping();
    const result = await sendMessage(
      conversationId,
      trimmed,
      attachment ? { url: attachment.url, type: attachment.type } : undefined,
    );
    setSending(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    setText("");
    setAttachment(null);
    onSent?.();
  };

  const handleStartRecording = async () => {
    const started = await recorder.start();
    if (!started) {
      toast.error("No pudimos acceder al micrófono. Revisá los permisos del navegador.");
    }
  };

  const handleSendRecording = async () => {
    const file = recorder.getRecordedFile();
    recorder.discardPreview();
    if (!file) return;

    setSending(true);
    const uploaded = await uploadFile(file);
    if (!uploaded) {
      setSending(false);
      return;
    }
    const result = await sendMessage(conversationId, "", { url: uploaded.url, type: "audio" });
    setSending(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }
    onSent?.();
  };

  if (disabled) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        Esta conversación está cerrada.
      </div>
    );
  }

  // Recording in progress: replace the whole composer row with a timer +
  // cancel/stop controls, WhatsApp-style.
  if (recorder.state === "recording") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <button
          type="button"
          onClick={recorder.cancelRecording}
          aria-label="Cancelar grabación"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
          {formatTimer(recorder.elapsedMs)}
        </span>
        <div className="flex h-6 min-w-0 flex-1 items-center gap-0.5 overflow-hidden">
          {recorder.levels.map((level, i) => (
            <span
              key={i}
              className="w-0.5 shrink-0 rounded-full bg-destructive/70"
              style={{ height: `${Math.round(15 + level * 85)}%` }}
            />
          ))}
        </div>
        <Button
          type="button"
          size="icon"
          onClick={recorder.stopToPreview}
          aria-label="Detener grabación"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </Button>
      </div>
    );
  }

  // Recorded, not sent yet: preview + discard/send, also replacing the row.
  if (recorder.state === "preview" && recorder.previewUrl) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <button
          type="button"
          onClick={recorder.discardPreview}
          aria-label="Descartar audio"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <AudioPlayer src={recorder.previewUrl} isOwn={false} />
        </div>
        <Button
          type="button"
          size="icon"
          disabled={sending}
          onClick={() => void handleSendRecording()}
          aria-label="Enviar audio"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  const canSendText = Boolean(text.trim() || attachment);

  return (
    <div className="space-y-2">
      {attachment && (
        <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
          {attachment.type === "pdf" ? <FileText className="h-3.5 w-3.5" /> : null}
          <span className="max-w-[180px] truncate">{attachment.name}</span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            aria-label="Quitar adjunto"
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading || sending}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar imagen o PDF"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>

        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Escribí un mensaje..."
          rows={1}
          className="max-h-32 min-h-[42px] flex-1 resize-none"
        />

        {canSendText ? (
          <Button
            type="button"
            size="icon"
            disabled={sending || uploading}
            onClick={() => void handleSend()}
            aria-label="Enviar mensaje"
            className={cn(sending && "opacity-70")}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            disabled={uploading}
            onClick={() => void handleStartRecording()}
            aria-label="Grabar nota de voz"
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
