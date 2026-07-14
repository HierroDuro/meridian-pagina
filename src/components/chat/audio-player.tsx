"use client";

import * as React from "react";
import { Play, Pause } from "lucide-react";

import { cn } from "@/lib/utils";
import { notifyPlaying, notifyStopped } from "@/components/chat/audio-playback-manager";

/** How many bars the decoded static waveform is downsampled to. */
const WAVEFORM_BARS = 40;

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Downsamples the whole file into a fixed number of peak-amplitude bars —
 * WhatsApp-style static waveform, computed once per src instead of read
 * live off the mic (compare useVoiceRecorder's live level meter). */
async function computeWaveform(src: string): Promise<number[]> {
  const res = await fetch(src);
  const arrayBuffer = await res.arrayBuffer();
  const audioContext = new AudioContext();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channelData.length / WAVEFORM_BARS));
    const peaks: number[] = [];
    for (let i = 0; i < WAVEFORM_BARS; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] ?? 0);
      }
      peaks.push(sum / blockSize);
    }
    const max = Math.max(...peaks, 0.01);
    return peaks.map((p) => Math.min(1, p / max));
  } finally {
    void audioContext.close();
  }
}

/** Minimal WhatsApp-style voice message player: a round play/pause button,
 * a static waveform that doubles as a click-to-seek scrubber and fills in
 * as playback progresses, and a duration readout — built on the native
 * <audio> element with custom controls instead of the browser's default UI. */
export function AudioPlayer({ src, isOwn }: { src: string; isOwn: boolean }) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const barsRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  // null = still decoding, [] = decode failed (falls back to a plain seek bar).
  const [waveform, setWaveform] = React.useState<number[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setWaveform(null);
    computeWaveform(src)
      .then((peaks) => {
        if (!cancelled) setWaveform(peaks);
      })
      .catch(() => {
        if (!cancelled) setWaveform([]);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    // Driven by the audio element's own events rather than toggled
    // optimistically on click — if play() silently fails (e.g. an
    // unsupported/corrupt source), the button won't lie about it. Same
    // event is also the single choke point for the "only one audio plays
    // at a time" rule: it fires for every play, however triggered, so
    // pausing sibling players here can't be bypassed by clicking around.
    const onPlay = () => {
      notifyPlaying(audio);
      setIsPlaying(true);
    };
    const onPause = () => {
      notifyStopped(audio);
      setIsPlaying(false);
    };
    const onEnded = () => {
      notifyStopped(audio);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      notifyStopped(audio);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {
        // Autoplay/decode failure — onPlay never fires, so isPlaying
        // correctly stays false instead of showing a stuck "pause" icon.
      });
    } else {
      audio.pause();
    }
  };

  const seekToRatio = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const value = Math.min(duration, Math.max(0, ratio * duration));
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleBarsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = barsRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    seekToRatio((e.clientX - rect.left) / rect.width);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const playedBars = waveform ? Math.round((progressPct / 100) * waveform.length) : 0;

  return (
    <div className="flex w-56 items-center gap-2.5">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        {waveform && waveform.length > 0 ? (
          <div
            ref={barsRef}
            onClick={handleBarsClick}
            role="slider"
            aria-label="Progreso del audio"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            className="flex h-6 cursor-pointer items-center gap-0.5"
          >
            {waveform.map((level, i) => (
              <span
                key={i}
                className={cn(
                  "w-0.5 shrink-0 rounded-full transition-colors",
                  i < playedBars
                    ? isOwn
                      ? "bg-primary-foreground"
                      : "bg-primary"
                    : isOwn
                      ? "bg-primary-foreground/30"
                      : "bg-muted-foreground/30",
                )}
                style={{ height: `${Math.round(15 + level * 85)}%` }}
              />
            ))}
          </div>
        ) : waveform === null ? (
          <div className="h-6 w-full animate-pulse rounded-full bg-current/10" />
        ) : (
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Progreso del audio"
            className={cn(
              "h-1 w-full cursor-pointer appearance-none rounded-full",
              "[&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0",
              isOwn
                ? "[&::-webkit-slider-thumb]:bg-primary-foreground"
                : "[&::-webkit-slider-thumb]:bg-primary",
            )}
            style={{
              background: isOwn
                ? `linear-gradient(to right, rgba(255,255,255,0.9) ${progressPct}%, rgba(255,255,255,0.3) ${progressPct}%)`
                : `linear-gradient(to right, hsl(var(--primary)) ${progressPct}%, hsl(var(--muted)) ${progressPct}%)`,
            }}
          />
        )}
        <span
          className={cn(
            "mt-1 block text-[10px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatDuration(isPlaying || currentTime > 0 ? currentTime : duration)}
        </span>
      </div>
    </div>
  );
}
