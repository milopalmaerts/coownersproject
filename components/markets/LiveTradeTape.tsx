"use client";

import { useEffect, useRef, useState } from "react";
import { formatTimeUtc } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const HYPERLIQUID_WS_URL = "wss://api.hyperliquid.xyz/ws";
const MAX_TRADES = 40;

interface Trade {
  id: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  time: number;
}

// Hyperliquid trade feed for the given coin. Runs entirely client-side —
// public WebSocket, no key, and no server involvement, so it works fine
// on a serverless (Vercel) deployment where a persistent connection
// couldn't otherwise be held.
export function LiveTradeTape({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "error">(
    "connecting"
  );
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    setTrades([]);
    seenIds.current = new Set();
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      ws = new WebSocket(HYPERLIQUID_WS_URL);

      ws.onopen = () => {
        if (cancelled) return;
        setStatus("live");
        ws?.send(
          JSON.stringify({
            method: "subscribe",
            subscription: { type: "trades", coin: symbol },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.channel !== "trades" || !Array.isArray(msg.data)) return;

          const newTrades: Trade[] = msg.data
            .map((t: { coin: string; px: string; sz: string; side: string; time: number; tid: number }) => {
              if (t.coin !== symbol) return null;
              const id = String(t.tid);
              if (seenIds.current.has(id)) return null;
              seenIds.current.add(id);
              return {
                id,
                price: Number(t.px),
                size: Number(t.sz),
                side: t.side === "B" ? "buy" : "sell",
                time: t.time,
              } satisfies Trade;
            })
            .filter((t: Trade | null): t is Trade => t !== null);

          if (newTrades.length > 0) {
            setTrades((prev) => [...newTrades.reverse(), ...prev].slice(0, MAX_TRADES));
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        if (!cancelled) setStatus("error");
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("connecting");
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [symbol]);

  return (
    <Card>
      <CardHeader
        title="Live Trades"
        action={
          <Badge tone={status === "live" ? "positive" : "neutral"}>
            {status === "live" ? "● LIVE" : status === "error" ? "RECONNECTING" : "CONNECTING"}
          </Badge>
        }
      />
      <p className="text-xs text-tl-text-muted mb-3">
        Real-time perpetual trades on Hyperliquid for {symbol}.
      </p>
      {trades.length === 0 ? (
        <p className="text-sm text-tl-text-muted">
          {status === "live" ? "Waiting for the next trade…" : "Connecting…"}
        </p>
      ) : (
        <ul className="divide-y divide-tl-border max-h-80 overflow-y-auto font-mono text-xs">
          {trades.map((t) => (
            <li key={t.id} className="py-1.5 flex items-center justify-between">
              <span className={t.side === "buy" ? "text-tl-positive" : "text-tl-negative"}>
                {t.side === "buy" ? "BUY" : "SELL"}
              </span>
              <span className="text-tl-text-primary tabular-nums">
                {t.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </span>
              <span className="text-tl-text-secondary tabular-nums">{t.size}</span>
              <span className="text-tl-text-muted">
                {formatTimeUtc(new Date(t.time).toISOString())}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
