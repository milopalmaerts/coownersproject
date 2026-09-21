"use client";

import { useLiveTickers } from "@/lib/hooks/useLiveTickers";
import { formatPrice, formatPct } from "@/lib/format";
import { TRACKED_ASSETS } from "@/lib/providers/live/symbolMap";

// A live, looping ticker tape across the top of the app — the first thing
// tradrquant-style terminals show. Duplicates its content once so the CSS
// marquee (-50% translate) loops seamlessly regardless of viewport width.
export function TickerTape() {
  const liveTickers = useLiveTickers();

  const items = TRACKED_ASSETS.map((asset) => {
    const t = liveTickers?.get(asset.symbol);
    return t ? { symbol: asset.symbol, price: t.price, changePct: t.change24hPct } : null;
  }).filter((x): x is { symbol: string; price: number; changePct: number } => x !== null);

  if (items.length === 0) return null;

  const renderItems = (keyPrefix: string) =>
    items.map((item) => (
      <span
        key={`${keyPrefix}-${item.symbol}`}
        className="tl-mono flex items-center gap-2 px-4 text-xs whitespace-nowrap border-r border-tl-border"
      >
        <span className="text-tl-text-secondary">{item.symbol}</span>
        <span className="text-tl-text-primary">{formatPrice(item.price)}</span>
        <span className={item.changePct >= 0 ? "text-tl-positive" : "text-tl-negative"}>
          {item.changePct >= 0 ? "▲" : "▼"} {formatPct(item.changePct)}
        </span>
      </span>
    ));

  return (
    <div className="tl-marquee-viewport overflow-hidden border-b border-tl-border bg-tl-bg-elevated h-8 flex items-center">
      <div className="tl-marquee-track">
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}
