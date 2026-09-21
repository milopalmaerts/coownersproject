"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  ColorType,
  IChartApi,
} from "lightweight-charts";
import { Candle } from "@/lib/types";

export function CandleChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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
  }, [candles]);

  return <div ref={containerRef} className="w-full" />;
}
