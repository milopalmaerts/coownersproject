"use client";

import { useEffect, useRef, useState } from "react";
import { WhaleTransaction } from "@/lib/types";
import { isMegaWhale } from "@/lib/whaleThresholds";

const POLL_MS = 30_000;
const STORAGE_KEY = "tl-whale-sound-muted";

// Plays a short synthesized beep (no audio file needed) the moment a new
// mega-whale transaction shows up — never on first load, only on genuinely
// new transactions seen after this component mounted. Muted by default;
// the toggle preference is a per-viewer convenience in localStorage only.
export function WhaleSoundAlert() {
  const [muted, setMuted] = useState(true);
  const seenIds = useRef<Set<string> | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setMuted(stored === "true");
    } catch {
      // localStorage unavailable — keep default (muted).
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/whales", { cache: "no-store" });
        if (!res.ok) return;
        const { transactions } = (await res.json()) as { transactions: WhaleTransaction[] };
        if (cancelled) return;

        if (seenIds.current === null) {
          // First poll just establishes the baseline — don't alert on
          // transactions that were already there before this page loaded.
          seenIds.current = new Set(transactions.map((t) => t.id));
          return;
        }

        const newMega = transactions.find(
          (t) => !seenIds.current!.has(t.id) && isMegaWhale(t.symbol, t.usdValue)
        );
        transactions.forEach((t) => seenIds.current!.add(t.id));

        if (newMega && !muted) {
          playBeep();
        }
      } catch {
        // Transient network error — try again on the next poll.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [muted]);

  function playBeep() {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new AudioContext();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Autoplay/audio blocked by the browser — fail silently, no fake cue.
    }
  }

  function toggle() {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Non-fatal — preference just won't persist across reloads.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={muted ? "Enable sound for mega-whale alerts" : "Mute mega-whale sound alerts"}
      className="text-xs text-tl-text-muted hover:text-tl-accent transition-colors"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
