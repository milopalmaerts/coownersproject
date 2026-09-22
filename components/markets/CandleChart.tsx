"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { Candle } from "@/lib/types";
import { computeVolumeProfile } from "@/lib/volumeProfile";

export function CandleChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [showVolumeProfile, setShowVolumeProfile] = useState(false);

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

    series.setData(
      candles.map((c) => ({
        time: c.time as never,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    chart.timeScale().fitContent();

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles]);

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

  useEffect(() => {
    showVolumeProfileRef.current = showVolumeProfile;
    drawVolumeProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVolumeProfile, candles]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setShowVolumeProfile((v) => !v)}
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
