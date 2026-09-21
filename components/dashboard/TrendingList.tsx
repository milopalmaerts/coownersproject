import Link from "next/link";
import { AssetTicker } from "@/lib/types";
import { formatPrice, formatUsd } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { PctBadge } from "@/components/ui/Badge";

export function TrendingList({
  title,
  assets,
  metric = "change",
  emptyMessage = "No assets to show right now.",
}: {
  title: string;
  assets: AssetTicker[];
  metric?: "change" | "volume";
  emptyMessage?: string;
}) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <p className="text-sm text-tl-text-muted">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} />
      <ul className="divide-y divide-tl-border">
        {assets.map((asset) => (
          <li key={asset.symbol}>
            <Link
              href={`/markets/${asset.symbol}`}
              className="flex items-center justify-between py-2.5 hover:opacity-80"
            >
              <div>
                <div className="text-sm font-medium text-tl-text-primary">
                  {asset.symbol}
                </div>
                <div className="text-xs text-tl-text-muted">{asset.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm tabular-nums text-tl-text-primary">
                  {formatPrice(asset.price)}
                </div>
                {metric === "change" ? (
                  <PctBadge value={asset.change24hPct} />
                ) : (
                  <div className="text-xs text-tl-text-secondary tabular-nums">
                    {formatUsd(asset.volume24h)}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
