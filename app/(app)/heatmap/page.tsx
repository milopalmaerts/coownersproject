import Link from "next/link";
import { marketProvider } from "@/lib/providers";
import { formatPct, formatUsd } from "@/lib/format";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Tile size buckets by market cap rank — a real treemap needs a packing
// algorithm; with only 8 tracked assets a few fixed spans reads just as
// clearly and is far simpler.
const SPAN_BY_RANK = ["col-span-4 row-span-2", "col-span-2 row-span-2", "col-span-2 row-span-1"];

function spanForRank(rank: number): string {
  return SPAN_BY_RANK[rank] ?? "col-span-2 row-span-1";
}

// Green/red intensity scales with how big the move is, capped at +-8% so a
// single outlier doesn't wash out every other tile.
function heatColor(changePct: number): string {
  const intensity = Math.min(Math.abs(changePct) / 8, 1);
  if (changePct >= 0) {
    return `color-mix(in srgb, var(--tl-positive) ${20 + intensity * 55}%, var(--tl-bg-card))`;
  }
  return `color-mix(in srgb, var(--tl-negative) ${20 + intensity * 55}%, var(--tl-bg-card))`;
}

export default async function HeatmapPage() {
  const tickers = await marketProvider.getAllTickers();
  const sorted = [...tickers].sort((a, b) => b.marketCap - a.marketCap);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 09 · Market Heatmap</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Heatmap</h1>
        <p className="text-sm text-tl-text-secondary">
          All tracked assets, sized by market cap, colored by 24h move.
        </p>
      </div>

      <ScrollReveal className="grid grid-cols-6 auto-rows-[110px] gap-2">
        {sorted.map((t, i) => (
          <Link
            key={t.symbol}
            href={`/markets/${t.symbol}`}
            className={`${spanForRank(i)} rounded-lg border border-tl-border p-3 flex flex-col justify-between transition-transform hover:scale-[1.02]`}
            style={{ backgroundColor: heatColor(t.change24hPct) }}
          >
            <div>
              <div className="font-bold text-tl-text-primary tl-mono">{t.symbol}</div>
              <div className="text-xs text-tl-text-secondary">{formatUsd(t.marketCap)}</div>
            </div>
            <div
              className={`text-sm font-semibold tabular-nums ${
                t.change24hPct >= 0 ? "text-tl-positive" : "text-tl-negative"
              }`}
            >
              {formatPct(t.change24hPct)}
            </div>
          </Link>
        ))}
      </ScrollReveal>
    </div>
  );
}
