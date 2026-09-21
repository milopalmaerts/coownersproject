"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Timeframe } from "@/lib/types";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

export function TimeframeSelector({
  symbol,
  active,
}: {
  symbol: string;
  active: Timeframe;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTimeframe = (tf: Timeframe) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tf", tf);
    router.push(`/markets/${symbol}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
            active === tf
              ? "bg-tl-accent text-black border-tl-accent"
              : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
