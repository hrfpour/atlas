"use client";

/**
 * Thin wrapper around the Web Speech API (speechSynthesis).
 *
 * IMPORTANT: most browsers require speechSynthesis.speak() to be called
 * from within a user-gesture call stack (e.g. a click handler). Therefore
 * we must NOT await anything before calling speak() — we call it
 * synchronously and let the browser pick the voice from whatever is
 * currently loaded (voices load asynchronously, but the utterance's lang
 * attribute is enough for the browser to choose a reasonable default).
 *
 * We still expose ensureVoicesLoaded() for diagnostics and a hasVoices()
 * check that callers can use to decide whether to show a fallback toast
 * *after* the click (without blocking the speak call).
 */

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

// Preload voices as soon as the module loads on the client. Most browsers
// populate getVoices() asynchronously after the page loads, so we register
// the listener early so voices are ready by the time the user clicks.
if (typeof window !== "undefined" && window.speechSynthesis) {
  const tryLoad = () => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      cachedVoices = v;
      voicesLoaded = true;
    }
  };
  tryLoad();
  window.speechSynthesis.addEventListener?.("voiceschanged", tryLoad);
}

export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) {
      resolve([]);
      return;
    }
    const immediate = synth.getVoices();
    if (immediate.length > 0) {
      cachedVoices = immediate;
      voicesLoaded = true;
      resolve(immediate);
      return;
    }
    if (voicesLoaded) {
      resolve(cachedVoices);
      return;
    }
    const handler = () => {
      cachedVoices = synth.getVoices();
      voicesLoaded = true;
      resolve(cachedVoices);
    };
    synth.addEventListener?.("voiceschanged", handler, { once: true });
    setTimeout(() => {
      if (!voicesLoaded) {
        cachedVoices = synth.getVoices();
        voicesLoaded = true;
        resolve(cachedVoices);
      }
    }, 1000);
  });
}

export function hasVoices(): boolean {
  if (cachedVoices.length > 0) return true;
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return false;
  return synth.getVoices().length > 0;
}

/**
 * Synchronously start speaking. Must be called within a user-gesture handler.
 * Returns a promise that resolves when the utterance ends or fails.
 */
export function speak(
  text: string,
  lang: string,
): Promise<{ ok: boolean; reason?: string }> {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) {
    return Promise.resolve({ ok: false, reason: "no-synth" });
  }

  // Pick the best voice currently available (non-blocking). Use the cached
  // voices first (populated by the preload listener), then fall back to a
  // synchronous getVoices() call.
  const voices = cachedVoices.length > 0 ? cachedVoices : synth.getVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  const voice =
    voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase()) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ||
    voices[0];

  // cancel any in-flight speech
  try {
    synth.cancel();
  } catch {
    /* ignore */
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  if (voice) u.voice = voice;

  return new Promise((resolve) => {
    let settled = false;
    const done = (ok: boolean, reason?: string) => {
      if (!settled) {
        settled = true;
        resolve({ ok, reason });
      }
    };
    u.onstart = () => {
      // mark that speech genuinely started
      (u as unknown as { __started?: boolean }).__started = true;
    };
    u.onend = () => done(true);
    u.onerror = (e) => {
      const err = (e as SpeechSynthesisErrorEvent).error;
      if (err === "interrupted" || err === "canceled") {
        done(true);
      } else {
        done(false, err);
      }
    };
    try {
      synth.speak(u);
      // Chrome sometimes starts speechSynthesis in a paused state; resume it
      // explicitly to make sure the utterance actually plays.
      try {
        if (synth.paused) synth.resume();
      } catch {
        /* ignore */
      }
    } catch {
      done(false, "exception");
    }
    // Safety timeout so the promise never hangs. Only resolve as ok if
    // speech actually started; otherwise it's a silent failure.
    const maxMs = Math.max(4000, text.length * 250);
    setTimeout(() => {
      if (settled) return;
      const started = (u as unknown as { __started?: boolean }).__started;
      done(!!started, started ? undefined : "silent-failure");
    }, maxMs);
  });
}
