"use client";

import { useEffect, useRef, useState } from "react";
import { AssetTicker } from "@/lib/types";

const POLL_MS = 15_000;

// Polls our own /api/tickers (which reads through the already-cached market
// provider) so client components can show real price movement without each
// one opening its own connection. Returns null until the first successful
// fetch — callers should keep rendering their server-provided initial data
// until then instead of showing a loading state.
export function useLiveTickers(): Map<string, AssetTicker> | null {
  const [tickers, setTickers] = useState<Map<string, AssetTicker> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function poll() {
      try {
        const res = await fetch("/api/tickers", { cache: "no-store" });
        if (!res.ok) return;
        const { tickers: list } = (await res.json()) as { tickers: AssetTicker[] };
        if (!mounted.current) return;
        setTickers(new Map(list.map((t) => [t.symbol, t])));
      } catch {
        // Transient network error — keep showing the last known values.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  return tickers;
}
