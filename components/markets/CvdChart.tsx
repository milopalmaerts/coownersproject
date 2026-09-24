"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  createSeriesMarkers,
  LineSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  SeriesMarker,
  Time,
} from "lightweight-charts";
import { Candle } from "@/lib/types";
import { computeCvdSeries, detectDivergences, CvdPoint } from "@/lib/cvd";
import { formatRelativeTime } from "@/lib/format";

export function CvdChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const divergenceLinesRef = useRef<ISeriesApi<"Line">[]>([]);
  const hasFitRef = useRef(false);

  const cvd: CvdPoint[] = computeCvdSeries(candles);
  const divergences = detectDivergences(candles, cvd);

  // Chart + series created once — recreating on every data update (as this
  // used to do) reset zoom/pan on every new candle.
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
    chartRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: "#ff2d2d",
      lineWidth: 2,
    });
    seriesRef.current = series;
    markersRef.current = createSeriesMarkers(series, []);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
      hasFitRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    series.setData(cvd.map((p) => ({ time: p.time as Time, value: p.cvd })));

    const markers: SeriesMarker<Time>[] = divergences.map((d) => ({
      time: d.time as Time,
      position: d.type === "bearish" ? "aboveBar" : "belowBar",
      color: d.type === "bearish" ? "#ff5c5c" : "#6ee06e",
      shape: d.type === "bearish" ? "arrowDown" : "arrowUp",
      text: d.type === "bearish" ? "BEAR DIV" : "BULL DIV",
    }));
    markersRef.current?.setMarkers(markers);

    // Connector line between the exact two CVD points being compared — the
    // same pair drawn on the price chart, so the divergence is visible
    // rather than only described in text.
    divergenceLinesRef.current.forEach((line) => chart.removeSeries(line));
    divergenceLinesRef.current = [];
    divergences.forEach((d) => {
      const fromPoint = cvd[d.fromIndex];
      const toPoint = cvd[d.index];
      if (!fromPoint || !toPoint) return;

      const line = chart.addSeries(LineSeries, {
        color: d.type === "bearish" ? "#ff5c5c" : "#6ee06e",
        lineWidth: 2,
        lineStyle: 2, // dashed
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      line.setData([
        { time: fromPoint.time as Time, value: fromPoint.cvd },
        { time: toPoint.time as Time, value: toPoint.cvd },
      ]);
      divergenceLinesRef.current.push(line);
    });

    if (!hasFitRef.current && cvd.length > 0) {
      chart.timeScale().fitContent();
      hasFitRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles]);

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
