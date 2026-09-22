"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  createSeriesMarkers,
  LineSeries,
  ColorType,
  IChartApi,
  SeriesMarker,
  Time,
} from "lightweight-charts";
import { Candle } from "@/lib/types";
import { computeCvdSeries, detectDivergences } from "@/lib/cvd";
import { formatRelativeTime } from "@/lib/format";

export function CvdChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const cvd = computeCvdSeries(candles);
  const divergences = detectDivergences(candles, cvd);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9297a3",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "#23262f" },
        horzLines: { color: "#23262f" },
      },
      rightPriceScale: { borderColor: "#23262f" },
      timeScale: { borderColor: "#23262f" },
      width: containerRef.current.clientWidth,
      height: 160,
    });

    const series = chart.addSeries(LineSeries, {
      color: "#c6ff1a",
      lineWidth: 2,
    });

    series.setData(cvd.map((p) => ({ time: p.time as Time, value: p.cvd })));

    if (divergences.length > 0) {
      const markers: SeriesMarker<Time>[] = divergences.map((d) => ({
        time: d.time as Time,
        position: d.type === "bearish" ? "aboveBar" : "belowBar",
        color: d.type === "bearish" ? "#ff5c5c" : "#6ee06e",
        shape: d.type === "bearish" ? "arrowDown" : "arrowUp",
        text: d.type === "bearish" ? "BEAR DIV" : "BULL DIV",
      }));
      createSeriesMarkers(series, markers);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, cvd, divergences]);

  const hasTakerData = candles.some((c) => c.takerBuyVolume !== undefined);

  return (
    <div>
      <div ref={containerRef} className="w-full" />
      {!hasTakerData && (
        <p className="text-xs text-tl-text-muted mt-2">
          No taker-volume data on this timeframe/source — CVD unavailable.
        </p>
      )}
      {divergences.map((d) => (
        <div
          key={`${d.type}-${d.index}`}
          className={`mt-2 text-xs rounded-md px-3 py-2 border ${
            d.type === "bearish"
              ? "border-tl-negative/30 bg-tl-negative/10 text-tl-negative"
              : "border-tl-positive/30 bg-tl-positive/10 text-tl-positive"
          }`}
        >
          {d.type === "bearish" ? "▼ Bearish" : "▲ Bullish"} CVD divergence ·{" "}
          {formatRelativeTime(new Date(d.time * 1000).toISOString())} — {d.description}
        </div>
      ))}
    </div>
  );
}
