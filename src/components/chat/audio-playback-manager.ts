/**
 * Keeps at most one <audio> element playing at a time across every
 * AudioPlayer on the page (a chat thread can show many voice messages at
 * once). Module-scoped on purpose: it needs to coordinate across sibling
 * component instances that don't otherwise know about each other, and a
 * page only ever has one active chat thread, so a single shared reference
 * is enough — no React context/provider wiring required.
 */
let currentlyPlaying: HTMLAudioElement | null = null;

/** Call when an audio element actually starts playing (its native "play"
 * event, not the button click) — pauses whatever was playing before it. */
export function notifyPlaying(audio: HTMLAudioElement) {
  if (currentlyPlaying && currentlyPlaying !== audio) {
    currentlyPlaying.pause();
  }
  currentlyPlaying = audio;
}

/** Call when an audio element pauses/ends so a stale reference isn't kept
 * around (e.g. after the message bubble unmounts). */
export function notifyStopped(audio: HTMLAudioElement) {
  if (currentlyPlaying === audio) {
    currentlyPlaying = null;
  }
}
