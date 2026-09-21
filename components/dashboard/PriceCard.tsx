"use client";

import Link from "next/link";
import { AssetTicker } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PctBadge } from "@/components/ui/Badge";
import { WatchlistStarButton } from "@/components/watchlist/WatchlistStarButton";
import { LivePrice } from "@/components/dashboard/LivePrice";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";

export function PriceCard({ asset }: { asset: AssetTicker }) {
  const liveTickers = useLiveTickers();
  const changePct = liveTickers?.get(asset.symbol)?.change24hPct ?? asset.change24hPct;

  return (
    <Link href={`/markets/${asset.symbol}`}>
      <Card className="hover:border-tl-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-tl-text-muted">{asset.name}</div>
            <div className="text-lg font-semibold text-tl-text-primary flex items-center gap-1.5">
              {asset.symbol}
              <WatchlistStarButton symbol={asset.symbol} className="text-sm" />
            </div>
          </div>
          <PctBadge value={changePct} />
        </div>
        <div className="mt-3 text-2xl font-bold text-tl-text-primary tabular-nums">
          <LivePrice initial={asset} />
        </div>
      </Card>
    </Link>
  );
}
