"use client";

import * as React from "react";

export type RecorderState = "idle" | "recording" | "preview";

/** Browsers disagree on what MediaRecorder can produce — try the best
 * option each supports, in order of preference. */
const CANDIDATE_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

/** How many bars the live level meter keeps — older samples scroll off. */
const MAX_LEVEL_BARS = 40;
/** How often (ms) to sample the mic for the level meter. */
const LEVEL_SAMPLE_INTERVAL_MS = 100;

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

/** Encapsulates getUserMedia + MediaRecorder so ChatComposer only has to
 * deal with three states: idle (mic button), recording (timer + cancel/stop),
 * and preview (play back what was recorded before actually sending it). */
export function useVoiceRecorder() {
  const [state, setState] = React.useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [levels, setLevels] = React.useState<number[]>([]);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const mimeTypeRef = React.useRef<string>("");
  const startedAtRef = React.useRef(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const levelDataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const levelIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const stopLevelMeter = () => {
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    levelIntervalRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    levelDataRef.current = null;
  };

  const releaseMic = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    stopTimer();
    stopLevelMeter();
  }, []);

  /** Returns false if mic permission was denied or recording isn't supported. */
  const start = async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;

    try {
      // noiseSuppression off: the browser's default noise-gate can read
      // normal speech as background noise and suppress it near-silent,
      // especially with virtual audio devices (Voicemeeter, capture
      // software, etc.) in the input chain.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: false, echoCancellation: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType || "audio/webm";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;

      // Live level meter: an AnalyserNode reads the raw waveform off the
      // same stream MediaRecorder is encoding, sampled on an interval and
      // turned into a rolling window of bar heights for the UI.
      const audioContext = new AudioContext();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      levelDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      setLevels([]);
      levelIntervalRef.current = setInterval(() => {
        const currentAnalyser = analyserRef.current;
        const data = levelDataRef.current;
        if (!currentAnalyser || !data) return;
        currentAnalyser.getByteTimeDomainData(data);

        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const normalized = (data[i]! - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        const level = Math.min(1, rms * 4); // amplified — raw mic RMS reads quiet

        setLevels((prev) => {
          const next = [...prev, level];
          return next.length > MAX_LEVEL_BARS ? next.slice(next.length - MAX_LEVEL_BARS) : next;
        });
      }, LEVEL_SAMPLE_INTERVAL_MS);

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setState("recording");
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
      return true;
    } catch {
      return false;
    }
  };

  /** Stops recording and moves to the preview state (doesn't send anything yet). */
  const stopToPreview = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
      setPreviewUrl(URL.createObjectURL(blob));
      setState("preview");
      releaseMic();
    };
    recorder.stop();
  };

  /** Abandons the recording entirely (mid-recording "trash" tap). */
  const cancelRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    releaseMic();
    chunksRef.current = [];
    setState("idle");
    setElapsedMs(0);
    setLevels([]);
  };

  /** Discards a recording that's already in the preview state. */
  const discardPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    chunksRef.current = [];
    setState("idle");
    setElapsedMs(0);
    setLevels([]);
  };

  const getRecordedFile = (): File | null => {
    if (chunksRef.current.length === 0) return null;
    const mimeType = mimeTypeRef.current || "audio/webm";
    const extension = mimeType.includes("mp4") ? "m4a" : mimeType.split(";")[0]!.split("/")[1];
    const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
    return new File([blob], `nota-de-voz.${extension}`, { type: mimeType.split(";")[0] });
  };

  React.useEffect(() => {
    return () => {
      releaseMic();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, releaseMic]);

  return {
    state,
    elapsedMs,
    previewUrl,
    /** Rolling window of 0–1 volume samples while recording, oldest first — drives the live level meter. */
    levels,
    start,
    stopToPreview,
    cancelRecording,
    discardPreview,
    getRecordedFile,
  };
}
