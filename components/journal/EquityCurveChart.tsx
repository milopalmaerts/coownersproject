"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, ColorType, IChartApi, Time } from "lightweight-charts";
import { EquityPoint } from "@/lib/journal/calculations";

export function EquityCurveChart({ points }: { points: EquityPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8B949E",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "#21262D" },
        horzLines: { color: "#21262D" },
      },
      rightPriceScale: { borderColor: "#21262D" },
      timeScale: { borderColor: "#21262D" },
      width: containerRef.current.clientWidth,
      height: 280,
    });
    chartRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: "#E5484D",
      lineWidth: 2,
    });

    // De-duplicate same-day points (last value wins) — lightweight-charts
    // requires strictly increasing timestamps.
    const byDate = new Map<string, number>();
    points.forEach((p) => byDate.set(p.date, p.cumulativeR));
    const data = Array.from(byDate.entries())
      .map(([date, cumulativeR]) => ({
        time: (new Date(date).getTime() / 1000) as Time,
        value: cumulativeR,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-tl-text-muted">
        No trades yet — the equity curve fills in as you log them.
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
