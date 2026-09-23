"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";
import { Candle } from "@/lib/types";
import { Divergence } from "@/lib/cvd";
import { computeVolumeProfile } from "@/lib/volumeProfile";

export function CandleChart({
  candles,
  divergences = [],
}: {
  candles: Candle[];
  divergences?: Divergence[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const divergenceLinesRef = useRef<ISeriesApi<"Line">[]>([]);
  const hasFitRef = useRef(false);
  const [showVolumeProfile, setShowVolumeProfile] = useState(false);

  // Effects can't see fresh state inside the chart's own event subscriptions
  // (they're set up once), so a ref mirrors the toggle for the draw callback.
  const showVolumeProfileRef = useRef(showVolumeProfile);

  function drawVolumeProfile() {
    const canvas = canvasRef.current;
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!canvas || !series || !chart) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const profile = showVolumeProfileRef.current ? computeVolumeProfile(candles) : null;
    if (!profile) return;

    // Stay inside the plot area — the price scale reserves its own width on
    // the right for the axis labels, and bars shouldn't render under them.
    const priceScaleWidth = chart.priceScale("right").width();
    const plotWidth = canvas.width - priceScaleWidth;
    const maxBarWidth = plotWidth * 0.22;

    profile.bins.forEach((bin, i) => {
      const yTop = series.priceToCoordinate(bin.priceHigh);
      const yBottom = series.priceToCoordinate(bin.priceLow);
      if (yTop === null || yBottom === null) return;

      const barWidth = (bin.volume / profile.maxVolume) * maxBarWidth;
      const isPoc = i === profile.pocIndex;

      ctx.fillStyle = isPoc ? "rgba(198, 255, 26, 0.45)" : "rgba(198, 255, 26, 0.16)";
      ctx.fillRect(plotWidth - barWidth, yTop, barWidth, Math.max(1, yBottom - yTop));
    });
  }

  // Chart + series are created exactly once — recreating them on every data
  // update (as this used to do) destroyed the user's zoom/pan on every new
  // candle, since a fresh chart always starts fitted to content.
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
      height: 360,
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#2fd480",
      downColor: "#f24d5c",
      borderVisible: false,
      wickUpColor: "#2fd480",
      wickDownColor: "#f24d5c",
    });
    seriesRef.current = series;

    const draw = () => drawVolumeProfile();
    chart.timeScale().subscribeVisibleLogicalRangeChange(draw);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
        if (canvasRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = 360;
        }
      }
      draw();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(draw);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      hasFitRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data updates just update the existing series — zoom/pan survive. Only
  // the very first load auto-fits; after that the user's own view sticks,
  // including while live candles keep streaming in.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !chartRef.current) return;

    series.setData(
      candles.map((c) => ({
        time: c.time as never,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    if (!hasFitRef.current && candles.length > 0) {
      chartRef.current.timeScale().fitContent();
      hasFitRef.current = true;
    }

    drawVolumeProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles]);

  // Divergence connector lines — a two-point line series per divergence,
  // joining the exact pair of swing points the label refers to, so it's
  // visible on the price chart itself rather than just described in text.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    divergenceLinesRef.current.forEach((line) => chart.removeSeries(line));
    divergenceLinesRef.current = [];

    divergences.forEach((d) => {
      const fromCandle = candles[d.fromIndex];
      const toCandle = candles[d.index];
      if (!fromCandle || !toCandle) return;

      const price = d.type === "bearish" ? "high" : "low";
      const line = chart.addSeries(LineSeries, {
        color: d.type === "bearish" ? "#ff5c5c" : "#6ee06e",
        lineWidth: 2,
        lineStyle: 2, // dashed
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      line.setData([
        { time: fromCandle.time as Time, value: fromCandle[price] },
        { time: toCandle.time as Time, value: toCandle[price] },
      ]);
      divergenceLinesRef.current.push(line);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divergences, candles]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setShowVolumeProfile((v) => !v);
          showVolumeProfileRef.current = !showVolumeProfileRef.current;
          drawVolumeProfile();
        }}
        className={`absolute top-0 right-0 z-10 tl-mono text-[10px] px-2 py-1 rounded border transition-colors ${
          showVolumeProfile
            ? "bg-tl-accent text-black border-tl-accent"
            : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
        }`}
      >
        VOLUME PROFILE
      </button>
      <div ref={containerRef} className="w-full" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: "100%", height: 360 }}
      />
    </div>
  );
}
