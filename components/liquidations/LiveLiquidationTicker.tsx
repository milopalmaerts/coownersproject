"use client";

import { useEffect, useRef, useState } from "react";
import { formatUsd, formatTimeUtc } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Binance Futures' public forceOrder stream is the only free, exchange-wide
// (not per-user) liquidation feed we found — Hyperliquid has no equivalent.
// It's WebSocket-only, so this runs entirely in the browser: the site's
// server never holds this connection, which also sidesteps Vercel
// serverless functions not supporting long-lived connections.
const BINANCE_WS_URL = "wss://fstream.binance.com/ws/!forceOrder@arr";

// Exchange-wide, not limited to the 8 assets tracked elsewhere on the site —
// liquidations on any single pair are infrequent enough that restricting to
// 8 symbols made this feed sit at $0/$0 for long stretches. Binance Futures
// liquidates something somewhere every few seconds market-wide, which is
// the more honest "is this thing alive" signal.
interface LiquidationEvent {
  id: string;
  symbol: string;
  side: "long" | "short"; // the side of the position that got liquidated
  usdValue: number;
  price: number;
  time: number;
}

interface BinanceForceOrderMessage {
  o: {
    s: string;
    S: "BUY" | "SELL";
    q: string;
    ap: string;
    T: number;
  };
}

const MAX_EVENTS = 30;

export function LiveLiquidationTicker() {
  const [events, setEvents] = useState<LiquidationEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "error">(
    "connecting"
  );
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      ws = new WebSocket(BINANCE_WS_URL);

      ws.onopen = () => {
        if (!cancelled) setStatus("live");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as BinanceForceOrderMessage;
          const { s: symbol, S: side, q, ap, T: time } = msg.o;
          if (!symbol.endsWith("USDT")) return;

          const price = Number(ap);
          const usdValue = Number(q) * price;
          const id = `${symbol}-${time}-${q}`;
          if (seenIds.current.has(id)) return;
          seenIds.current.add(id);

          // SELL-side forced order liquidates a long position; BUY-side
          // liquidates a short.
          const liquidatedSide: "long" | "short" = side === "SELL" ? "long" : "short";

          setEvents((prev) => [
            {
              id,
              symbol: symbol.replace("USDT", ""),
              side: liquidatedSide,
              usdValue,
              price,
              time,
            },
            ...prev,
          ].slice(0, MAX_EVENTS));
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
  }, []);

  const longTotal = events
    .filter((e) => e.side === "long")
    .reduce((sum, e) => sum + e.usdValue, 0);
  const shortTotal = events
    .filter((e) => e.side === "short")
    .reduce((sum, e) => sum + e.usdValue, 0);

  return (
    <Card>
      <CardHeader
        title="Live Liquidation Feed"
        action={
          <Badge tone={status === "live" ? "positive" : "neutral"}>
            {status === "live" ? "● LIVE" : status === "error" ? "RECONNECTING" : "CONNECTING"}
          </Badge>
        }
      />
      <p className="text-xs text-tl-text-muted mb-3">
        Real liquidations across all Binance Futures USDT pairs (not just the
        assets tracked elsewhere on this site), streamed directly to your
        browser as they happen — not a historical summary. Totals below are
        for what&apos;s streamed in since you opened this page, not a fixed
        time window.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-tl-border p-3">
          <div className="text-xs text-tl-text-muted">Longs liquidated</div>
          <div className="text-lg font-semibold text-tl-negative tabular-nums">
            {formatUsd(longTotal)}
          </div>
        </div>
        <div className="rounded-lg border border-tl-border p-3">
          <div className="text-xs text-tl-text-muted">Shorts liquidated</div>
          <div className="text-lg font-semibold text-tl-positive tabular-nums">
            {formatUsd(shortTotal)}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-tl-text-muted">
          {status === "live"
            ? "Waiting for the next liquidation…"
            : "Connecting to Binance…"}
        </p>
      ) : (
        <ul className="divide-y divide-tl-border max-h-96 overflow-y-auto">
          {events.map((e) => (
            <li key={e.id} className="py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge tone={e.side === "long" ? "negative" : "positive"}>
                  {e.side === "long" ? "LONG" : "SHORT"}
                </Badge>
                <span className="font-medium text-tl-text-primary">{e.symbol}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-tl-text-secondary">
                <span className="tabular-nums">{formatUsd(e.usdValue)}</span>
                <span className="text-tl-text-muted">
                  {formatTimeUtc(new Date(e.time).toISOString())}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
