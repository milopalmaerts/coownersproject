"use client";

import { AssetTicker } from "@/lib/types";
import { useWatchlist } from "@/components/watchlist/WatchlistProvider";
import { formatPrice, formatUsd } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { PctBadge } from "@/components/ui/Badge";
import { WatchlistStarButton } from "@/components/watchlist/WatchlistStarButton";

export function WatchlistView({ allAssets }: { allAssets: AssetTicker[] }) {
  const { symbols, hydrated, add } = useWatchlist();

  const watched = hydrated
    ? allAssets.filter((a) => symbols.includes(a.symbol))
    : [];
  const remaining = hydrated
    ? allAssets.filter((a) => !symbols.includes(a.symbol))
    : allAssets;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Your Watchlist" />
        {watched.length === 0 ? (
          <p className="text-sm text-tl-text-muted">
            Your watchlist is empty. Add assets below, or tap the star on any
            coin in Markets or its detail page.
          </p>
        ) : (
          <ul className="divide-y divide-tl-border">
            {watched.map((asset) => (
              <li
                key={asset.symbol}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <WatchlistStarButton symbol={asset.symbol} />
                  <div>
                    <div className="font-medium text-tl-text-primary">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-tl-text-muted">
                      {asset.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="tabular-nums text-sm">
                      {formatPrice(asset.price)}
                    </div>
                    <div className="text-xs text-tl-text-secondary tabular-nums">
                      {formatUsd(asset.volume24h)}
                    </div>
                  </div>
                  <PctBadge value={asset.change24hPct} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {remaining.length > 0 && (
        <Card>
          <CardHeader title="Add Assets" />
          <div className="flex flex-wrap gap-2">
            {remaining.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => add(asset.symbol)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-tl-border text-tl-text-secondary hover:border-tl-accent hover:text-tl-accent transition-colors"
              >
                + {asset.symbol}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
