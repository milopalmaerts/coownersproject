"use client";

import { useLiveCandles } from "@/lib/hooks/useLiveCandles";
import { computeCvdSeries, detectDivergences } from "@/lib/cvd";
import { CandleChart } from "@/components/markets/CandleChart";
import { CvdChart } from "@/components/markets/CvdChart";
import { Badge } from "@/components/ui/Badge";

const MIN_CANDLES_FOR_CVD = 8;

export function LiveCandleChart({
  pair,
  intervalSeconds,
}: {
  pair: string;
  intervalSeconds: number;
}) {
  const { candles, status, tradeCount } = useLiveCandles(pair, intervalSeconds);
  const hasCvd = candles.length >= MIN_CANDLES_FOR_CVD;
  const divergences = hasCvd ? detectDivergences(candles, computeCvdSeries(candles)) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-tl-text-muted">
          Built live from individual trades on Binance — no historical
          backfill exists for sub-minute intervals, so this starts empty and
          fills in as trades happen. {tradeCount} trade{tradeCount === 1 ? "" : "s"} seen this session.
        </p>
        <Badge tone={status === "live" ? "positive" : status === "error" ? "negative" : "neutral"}>
          {status === "live" ? "● LIVE" : status === "error" ? "RECONNECTING" : "CONNECTING"}
        </Badge>
      </div>

      {candles.length === 0 ? (
        <div className="h-[360px] flex items-center justify-center text-sm text-tl-text-muted border border-tl-border rounded-lg">
          {status === "live" ? "Waiting for the first trade…" : "Connecting to Binance…"}
        </div>
      ) : (
        <CandleChart candles={candles} divergences={divergences} />
      )}

      {hasCvd && (
        <div>
          <p className="tl-label text-xs text-tl-text-secondary mb-2 flex items-center gap-2">
            <span className="text-tl-accent">▸</span>
            CVD (Cumulative Volume Delta)
          </p>
          <CvdChart candles={candles} />
        </div>
      )}
    </div>
  );
}
