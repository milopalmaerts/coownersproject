"use client";

import { useEffect, useRef, useState } from "react";
import { Candle } from "@/lib/types";

// Binance has no 15s/30s kline interval (smallest is 1s, then jumps to 1m),
// so there's no historical REST data to backfill from — this builds candles
// forward in real time from the raw trade stream instead, starting empty
// the moment the page opens. That's a real tradeoff of sub-minute
// timeframes on free data, not a bug: there's simply no history to show.
const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";

interface BinanceTradeMessage {
  p: string; // price
  q: string; // quantity
  T: number; // trade time, ms
  m: boolean; // true = buyer is the maker (i.e. a sell hit the bid — taker sold)
}

export type LiveConnectionStatus = "connecting" | "live" | "error";

export function useLiveCandles(
  pair: string,
  intervalSeconds: number,
  maxCandles = 120
): { candles: Candle[]; status: LiveConnectionStatus; tradeCount: number } {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [status, setStatus] = useState<LiveConnectionStatus>("connecting");
  const [tradeCount, setTradeCount] = useState(0);
  const candlesRef = useRef<Candle[]>([]);
  const tradeCountRef = useRef(0);

  useEffect(() => {
    candlesRef.current = [];
    tradeCountRef.current = 0;
    setCandles([]);
    setTradeCount(0);
    setStatus("connecting");

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function bucketStart(timeMs: number): number {
      return Math.floor(timeMs / 1000 / intervalSeconds) * intervalSeconds;
    }

    function handleTrade(msg: BinanceTradeMessage) {
      const price = Number(msg.p);
      const qty = Number(msg.q);
      const time = bucketStart(msg.T);
      // isBuyerMaker=false means the buyer was the taker (an aggressive buy).
      const takerBuyQty = msg.m ? 0 : qty;

      const list = candlesRef.current;
      const last = list[list.length - 1];

      if (last && last.time === time) {
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.close = price;
        last.volume += qty;
        last.takerBuyVolume = (last.takerBuyVolume ?? 0) + takerBuyQty;
      } else {
        list.push({
          time,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: qty,
          takerBuyVolume: takerBuyQty,
        });
        if (list.length > maxCandles) list.shift();
      }

      tradeCountRef.current += 1;
      setTradeCount(tradeCountRef.current);
      setCandles([...list]);
    }

    function connect() {
      ws = new WebSocket(`${BINANCE_WS_BASE}/${pair.toLowerCase()}@trade`);

      ws.onopen = () => {
        if (!cancelled) setStatus("live");
      };

      ws.onmessage = (event) => {
        try {
          handleTrade(JSON.parse(event.data) as BinanceTradeMessage);
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
  }, [pair, intervalSeconds, maxCandles]);

  return { candles, status, tradeCount };
}
