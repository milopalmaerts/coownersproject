"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, ColorType, IChartApi, Time } from "lightweight-charts";
import { FundingSnapshot } from "@/lib/alerts/redis";

// Two lines on independent price scales (funding rate is a tiny percentage,
// open interest is a huge dollar figure — sharing one scale would flatten
// one of them to a flat line).
export function FundingHistoryChart({ history }: { history: FundingSnapshot[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9297a3",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#23262f" },
        horzLines: { color: "#23262f" },
      },
      rightPriceScale: { borderColor: "#23262f" },
      leftPriceScale: { visible: true, borderColor: "#23262f" },
      timeScale: { borderColor: "#23262f" },
      width: containerRef.current.clientWidth,
      height: 180,
    });
    chartRef.current = chart;

    const fundingSeries = chart.addSeries(LineSeries, {
      color: "#ff2d2d",
      lineWidth: 2,
      priceScaleId: "right",
      title: "Funding %",
    });
    fundingSeries.setData(
      history.map((h) => ({ time: h.time as Time, value: h.fundingRatePct }))
    );

    const oiSeries = chart.addSeries(LineSeries, {
      color: "#4d8cf2",
      lineWidth: 2,
      priceScaleId: "left",
      title: "Open Interest",
    });
    oiSeries.setData(history.map((h) => ({ time: h.time as Time, value: h.openInterest })));

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
      chartRef.current = null;
    };
  }, [history]);

  return (
    <div>
      <div className="flex items-center gap-4 text-xs mb-2">
        <span className="flex items-center gap-1.5 text-tl-text-secondary">
          <span className="h-0.5 w-3 bg-tl-accent inline-block" /> Funding Rate
        </span>
        <span className="flex items-center gap-1.5 text-tl-text-secondary">
          <span className="h-0.5 w-3 bg-tl-info inline-block" /> Open Interest
        </span>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
